import * as dbConn from '../../../utils/dbConn.js';
import * as dbModel from '../../../models/dbModel.js';
import AppError from '../../../utils/appError.js';
import CrudOperations from '../../../utils/crud.js';
import { TABLE_MASTER } from '../../tables.js';

// Table name constants for consistency
const CERTIFICATE_TYPES_TABLE = TABLE_MASTER['CERTIFICATE_TYPES'].name;
const CERTIFICATES_TABLE = TABLE_MASTER['PRODUCT_CERTIFICATES'].name;

/**
 * Creates a new certificate type
 * @param {Object} certificateTypeData - The certificate type data to create
 * @param {string} certificateTypeData.name - The name of the certificate type
 * @param {string} [certificateTypeData.description] - Optional description of the certificate type
 * @returns {Promise<Object>} Promise that resolves with the created certificate type
 */
export const createCertificateType = async (certificateTypeData) => {
  try {
    const pool = dbConn.tb_pool;

    // Validate required fields
    if (!certificateTypeData.name) {
      throw new AppError('Certificate type name is required', 400);
    }

    // Create the certificate type using CRUD utility
    const result = await CrudOperations.performCrud({
      operation: 'create',
      tableName: CERTIFICATE_TYPES_TABLE,
      data: certificateTypeData,
      connection: pool,
    });

    return {
      message: 'Certificate type created successfully',
      certificateType: result.record,
    };
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new AppError(
        'A certificate type with this name already exists',
        409
      );
    }
    throw new AppError(
      `Failed to create certificate type: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Gets a certificate type by ID
 * @param {number} id - The ID of the certificate type to retrieve
 * @returns {Promise<Object>} Promise that resolves with the certificate type data
 */
export const getCertificateTypeById = async (id) => {
  try {
    const pool = dbConn.tb_pool;

    // Get the certificate type using CRUD utility
    const result = await CrudOperations.performCrud({
      operation: 'read',
      tableName: CERTIFICATE_TYPES_TABLE,
      id: id,
      connection: pool,
    });

    if (!result.record) {
      throw new AppError('Certificate type not found', 404);
    }

    return result.record;
  } catch (error) {
    throw new AppError(
      `Failed to get certificate type: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Gets all certificate types with optional filtering and pagination
 * @param {Object} [options] - Query options
 * @param {string} [options.search] - Search term for certificate type name
 * @param {number} [options.page=1] - Page number for pagination
 * @param {number} [options.limit=100] - Number of results per page
 * @returns {Promise<Object>} Promise that resolves with the certificate types and pagination info
 */
export const getAllCertificateTypes = async (options = {}) => {
  try {
    const pool = dbConn.tb_pool;

    // For this query with subqueries, we'll use direct SQL
    // Build the WHERE clause based on filters
    let whereClause = '1=1';
    const params = [];

    if (options.search) {
      whereClause += ' AND name LIKE ?';
      params.push(`%${options.search}%`);
    }

    // Get total count for pagination
    const countSQL = `
      SELECT COUNT(*) as total
      FROM ${CERTIFICATE_TYPES_TABLE}
      WHERE ${whereClause}
    `;

    const countResult = await dbModel.executeQuery(pool, countSQL, params);
    const total = countResult[0].total;

    // Get certificate types with pagination
    const selectSQL = `
      SELECT id, name, description,
             (SELECT COUNT(*) FROM ${CERTIFICATES_TABLE} WHERE certificate_type_id = ${CERTIFICATE_TYPES_TABLE}.id) as usage_count
      FROM ${CERTIFICATE_TYPES_TABLE}
      WHERE ${whereClause}
      ORDER BY name ASC
      LIMIT ? OFFSET ?
    `;

    // Add pagination parameters
    const page = options.page || 1;
    const limit = options.limit || 100;
    const offset = (page - 1) * limit;
    const queryParams = [...params, limit, offset];
    const certificateTypes = await dbModel.executeQuery(
      pool,
      selectSQL,
      queryParams
    );

    return {
      certificateTypes,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw new AppError(
      `Failed to get certificate types: ${error.message}`,
      500
    );
  }
};

/**
 * Updates a certificate type
 * @param {number} id - The ID of the certificate type to update
 * @param {Object} updateData - The certificate type data to update
 * @param {string} [updateData.name] - The updated name of the certificate type
 * @param {string} [updateData.description] - The updated description of the certificate type
 * @returns {Promise<Object>} Promise that resolves with the updated certificate type
 */
export const updateCertificateType = async (id, updateData) => {
  try {
    const pool = dbConn.tb_pool;

    // Check if certificate type exists
    await getCertificateTypeById(id);

    // Update the certificate type using CRUD utility
    const result = await CrudOperations.performCrud({
      operation: 'update',
      tableName: CERTIFICATE_TYPES_TABLE,
      id: id,
      data: updateData,
      connection: pool,
    });

    return {
      message: 'Certificate type updated successfully',
      certificateType: result.record,
    };
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new AppError(
        'A certificate type with this name already exists',
        409
      );
    }
    throw new AppError(
      `Failed to update certificate type: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Deletes a certificate type
 * @param {number} id - The ID of the certificate type to delete
 * @param {boolean} [force=false] - Whether to force deletion even if in use
 * @returns {Promise<Object>} Promise that resolves with deletion result
 */
export const deleteCertificateType = async (id, force = false) => {
  try {
    const pool = dbConn.tb_pool;

    // Check if certificate type exists
    await getCertificateTypeById(id);

    // Check if the certificate type is in use
    const usageResult = await CrudOperations.performCrud({
      operation: 'read',
      tableName: CERTIFICATES_TABLE,
      conditions: { certificate_type_id: id },
      connection: pool,
    });

    const usageCount = usageResult.records.length;

    if (usageCount > 0 && !force) {
      throw new AppError(
        `Cannot delete certificate type that is in use by ${usageCount} certificates. Use force=true to override.`,
        400
      );
    }

    // Start transaction
    await dbModel.executeQuery(pool, 'START TRANSACTION');

    try {
      // If force is true and there are usages, delete the associated certificates first
      if (force && usageCount > 0) {
        await CrudOperations.performCrud({
          operation: 'bulkdelete',
          tableName: CERTIFICATES_TABLE,
          ids: usageResult.records.map((record) => record.id),
          connection: pool,
        });
      }

      // Delete the certificate type using CRUD utility
      await CrudOperations.performCrud({
        operation: 'delete',
        tableName: CERTIFICATE_TYPES_TABLE,
        id: id,
        connection: pool,
      });

      // Commit transaction
      await dbModel.executeQuery(pool, 'COMMIT');

      return {
        message: 'Certificate type deleted successfully',
        deletedAssociations: force ? usageCount : 0,
      };
    } catch (error) {
      // Rollback transaction on error
      await dbModel.executeQuery(pool, 'ROLLBACK');
      throw error;
    }
  } catch (error) {
    throw new AppError(
      `Failed to delete certificate type: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Gets products with a specific certificate type
 * @param {number} certificateTypeId - The ID of the certificate type
 * @param {Object} [options] - Query options
 * @param {number} [options.page=1] - Page number for pagination
 * @param {number} [options.limit=20] - Number of results per page
 * @returns {Promise<Object>} Promise that resolves with products and pagination info
 */
export const getProductsByCertificateType = async (
  certificateTypeId,
  options = {}
) => {
  try {
    const pool = dbConn.tb_pool;
    const page = options.page || 1;
    const limit = options.limit || 20;
    const offset = (page - 1) * limit;

    // Check if certificate type exists
    await getCertificateTypeById(certificateTypeId);

    // For this complex query with joins and aggregations, we'll use direct SQL
    // Get total count for pagination
    const countSQL = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM products p
      JOIN certificates c ON p.id = c.product_id
      WHERE c.certificate_type_id = ?
    `;

    const countResult = await dbModel.executeQuery(pool, countSQL, [
      certificateTypeId,
    ]);
    const total = countResult[0].total;

    // Get products with pagination
    const selectSQL = `
      SELECT p.id, p.product_id, p.icon_url, p.remark,
             GROUP_CONCAT(DISTINCT pn.name ORDER BY pn.name_type_id SEPARATOR '|') as names,
             COUNT(DISTINCT c.id) as certificate_count
      FROM products p
      JOIN certificates c ON p.id = c.product_id
      LEFT JOIN product_names pn ON p.id = pn.product_id
      WHERE c.certificate_type_id = ?
      GROUP BY p.id
      ORDER BY p.product_id ASC
      LIMIT ? OFFSET ?
    `;

    const products = await dbModel.executeQuery(pool, selectSQL, [
      certificateTypeId,
      limit,
      offset,
    ]);

    // Format product names
    products.forEach((product) => {
      if (product.names) {
        product.names = product.names.split('|');
      } else {
        product.names = [];
      }
    });

    return {
      products,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw new AppError(
      `Failed to get products by certificate type: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Batch creates multiple certificate types
 * @param {Array<Object>} certificateTypes - Array of certificate type objects to create
 * @returns {Promise<Object>} Promise that resolves with creation results
 */
export const batchCreateCertificateTypes = async (certificateTypes) => {
  try {
    const pool = dbConn.tb_pool;

    // Use bulkCreate operation from CRUD utility
    const result = await CrudOperations.performCrud({
      operation: 'bulkcreate',
      tableName: CERTIFICATE_TYPES_TABLE,
      data: certificateTypes,
      connection: pool,
    });

    return {
      total: certificateTypes.length,
      successful: result.count,
      failed: certificateTypes.length - result.count,
      details: result.records.map((record) => ({
        name: record.name,
        success: true,
        id: record.id,
      })),
    };
  } catch (error) {
    // If bulk operation fails, try individual creates
    try {
      const pool = dbConn.tb_pool;
      const results = {
        total: certificateTypes.length,
        successful: 0,
        failed: 0,
        details: [],
      };

      // Start transaction
      await dbModel.executeQuery(pool, 'START TRANSACTION');

      try {
        for (const certificateType of certificateTypes) {
          try {
            const result = await createCertificateType(certificateType);
            results.successful++;
            results.details.push({
              name: certificateType.name,
              success: true,
              id: result.certificateType.id,
            });
          } catch (error) {
            results.failed++;
            results.details.push({
              name: certificateType.name,
              success: false,
              error: error.message,
            });
          }
        }

        // Commit transaction
        await dbModel.executeQuery(pool, 'COMMIT');
        return results;
      } catch (innerError) {
        // Rollback transaction on error
        await dbModel.executeQuery(pool, 'ROLLBACK');
        throw innerError;
      }
    } catch (finalError) {
      throw new AppError(
        `Failed to batch create certificate types: ${finalError.message}`,
        500
      );
    }
  }
};

/**
 * Inserts default certificate types
 * @returns {Promise<Object>} Promise that resolves with insertion results
 */
export const insertDefaultCertificateTypes = async () => {
  try {
    const defaultCertificateTypes = [
      { name: 'CE', description: 'European Conformity certification' },
      { name: 'RoHS', description: 'Restriction of Hazardous Substances' },
      { name: 'FCC', description: 'Federal Communications Commission' },
      { name: 'ISO 9001', description: 'Quality Management System' },
      {
        name: 'REACH',
        description:
          'Registration, Evaluation, Authorization and Restriction of Chemicals',
      },
      { name: 'FDA', description: 'Food and Drug Administration' },
      { name: 'UL', description: 'Underwriters Laboratories' },
      {
        name: 'ASTM',
        description: 'American Society for Testing and Materials',
      },
      { name: 'BSCI', description: 'Business Social Compliance Initiative' },
      { name: 'FSC', description: 'Forest Stewardship Council' },
    ];

    const results = await batchCreateCertificateTypes(defaultCertificateTypes);

    return {
      message: 'Default certificate types inserted successfully',
      results,
    };
  } catch (error) {
    throw new AppError(
      `Failed to insert default certificate types: ${error.message}`,
      500
    );
  }
};
