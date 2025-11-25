import * as dbConn from '../../../utils/dbConn.js';
import * as dbModel from '../../../models/dbModel.js';
import AppError from '../../../utils/appError.js';
import CrudOperations from '../../../utils/crud.js';
import { TABLE_MASTER } from '../../tables.js';

// Table name constant for consistency
const CERTIFICATE_TYPES_TABLE = TABLE_MASTER['MASTER_CERTIFICATE_TYPES'].name;

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
 * @param {string} id - The ID of the certificate type to retrieve
 * @returns {Promise<Object>} Promise that resolves with the certificate type data
 */
export const getCertificateTypeById = async (id) => {
  try {
    const pool = dbConn.tb_pool;

    // Use CRUD utility to get the certificate type
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

    // Handle search separately since it requires LIKE operator
    let searchCondition = '';
    const searchParams = [];

    if (options.search) {
      searchCondition = 'name LIKE ?';
      searchParams.push(`%${options.search}%`);
    }

    // Get certificate types using CRUD utility with custom query for search
    const result = await CrudOperations.performCrud({
      operation: 'read',
      tableName: CERTIFICATE_TYPES_TABLE,
      page: options.page || 1,
      limit: options.limit || 100,
      orderBy: 'name',
      orderDirection: 'ASC',
      connection: pool,
    });

    // Filter results by search if provided
    let certificateTypes = result.records;
    let total = result.pagination.total;

    if (options.search) {
      // If search is provided, we need to filter the results manually
      // or use a custom query instead of the CRUD utility
      const searchSQL = `
        SELECT *
        FROM ${CERTIFICATE_TYPES_TABLE}
        WHERE name LIKE ?
        ORDER BY name ASC
        LIMIT ? OFFSET ?
      `;

      const limit = options.limit || 100;
      const offset = ((options.page || 1) - 1) * limit;
      const queryParams = [`%${options.search}%`, limit, offset];

      certificateTypes = await dbModel.executeQuery(
        pool,
        searchSQL,
        queryParams
      );

      // Get total count for search
      const countSQL = `
        SELECT COUNT(*) as total
        FROM ${CERTIFICATE_TYPES_TABLE}
        WHERE name LIKE ?
      `;

      const countParams = [`%${options.search}%`];
      const countResult = await dbModel.executeQuery(
        pool,
        countSQL,
        countParams
      );
      total = countResult[0].total;
    }

    return {
      certificateTypes,
      pagination: {
        total,
        page: options.page || 1,
        limit: options.limit || 100,
        pages: Math.ceil(total / (options.limit || 100)),
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
 * @param {string} id - The ID of the certificate type to update
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
 * @param {string} id - The ID of the certificate type to delete
 * @returns {Promise<Object>} Promise that resolves with deletion result
 */
export const deleteCertificateType = async (id) => {
  try {
    const pool = dbConn.tb_pool;

    // Check if certificate type exists
    await getCertificateTypeById(id);

    // Check if certificate type is in use
    const checkSQL = `
      SELECT COUNT(*) as count
      FROM product_certificates
      WHERE certificate_type_id = ?
    `;

    const checkResult = await dbModel.executeQuery(pool, checkSQL, [id]);

    if (checkResult[0].count > 0) {
      throw new AppError(
        `Cannot delete certificate type that is in use by ${checkResult[0].count} products`,
        400
      );
    }

    // Delete certificate type using CRUD utility
    await CrudOperations.performCrud({
      operation: 'delete',
      tableName: CERTIFICATE_TYPES_TABLE,
      id: id,
      connection: pool,
    });

    return {
      message: 'Certificate type deleted successfully',
    };
  } catch (error) {
    throw new AppError(
      `Failed to delete certificate type: ${error.message}`,
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
    const results = {
      total: certificateTypes.length,
      successful: 0,
      failed: 0,
      details: [],
    };

    // Start transaction
    await dbModel.executeQuery(pool, 'START TRANSACTION');

    try {
      // Use bulkCreate operation from CRUD utility
      const bulkResult = await CrudOperations.performCrud({
        operation: 'bulkcreate',
        tableName: CERTIFICATE_TYPES_TABLE,
        data: certificateTypes,
        connection: pool,
      });

      // Process results
      results.successful = bulkResult.count;
      results.details = bulkResult.records.map((record) => ({
        name: record.name,
        success: true,
        id: record.id,
      }));

      // Commit transaction
      await dbModel.executeQuery(pool, 'COMMIT');
    } catch (error) {
      // Rollback transaction on error
      await dbModel.executeQuery(pool, 'ROLLBACK');

      // If bulk operation failed, try individual creates to get more detailed errors
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
      } catch (finalError) {
        // Rollback transaction on error
        await dbModel.executeQuery(pool, 'ROLLBACK');
        throw finalError;
      }
    }

    return results;
  } catch (error) {
    throw new AppError(
      `Failed to batch create certificate types: ${error.message}`,
      500
    );
  }
};

/**
 * Inserts default certificate types
 * @returns {Promise<Object>} Promise that resolves with insertion results
 */
export const insertDefaultCertificateTypes = async () => {
  try {
    // Import certificate types from data file
    const sampleProducts = await import('../../../datas/products.js');
    const defaultCertificateTypes =
      sampleProducts.default.master_certificate_types;

    return await batchCreateCertificateTypes(defaultCertificateTypes);
  } catch (error) {
    throw new AppError(
      `Failed to insert default certificate types: ${error.message}`,
      500
    );
  }
};
