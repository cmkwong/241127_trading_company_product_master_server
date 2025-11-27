import DataModelUtils from '../../../utils/dataModelUtils.js';
import AppError from '../../../utils/appError.js';
import { TABLE_MASTER } from '../../tables.js';

// Table name constants for consistency
const CERTIFICATE_TYPES_TABLE = TABLE_MASTER['MASTER_CERTIFICATE_TYPES'].name;
const PRODUCT_CERTIFICATES_TABLE = TABLE_MASTER['PRODUCT_CERTIFICATES'].name;

// Create DataModelUtils instance for certificate types
const certificateTypeModel = new DataModelUtils({
  tableName: CERTIFICATE_TYPES_TABLE,
  entityName: 'certificate type',
  entityIdField: 'id',
  requiredFields: ['name'],
  validations: {
    name: { required: true },
  },
});

/**
 * Creates a new certificate type
 * @param {Object} certificateTypeData - The certificate type data to create
 * @param {string} certificateTypeData.name - The name of the certificate type
 * @param {string} [certificateTypeData.description] - Optional description of the certificate type
 * @returns {Promise<Object>} Promise that resolves with the created certificate type
 */
export const createCertificateType = async (certificateTypeData) => {
  try {
    return await certificateTypeModel.create(certificateTypeData);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new AppError(
        'A certificate type with this name already exists',
        409
      );
    }
    throw error;
  }
};

/**
 * Gets a certificate type by ID
 * @param {number} id - The ID of the certificate type to retrieve
 * @returns {Promise<Object>} Promise that resolves with the certificate type data
 */
export const getCertificateTypeById = async (id) => {
  return await certificateTypeModel.getById(id);
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
    const page = options.page || 1;
    const limit = options.limit || 100;
    const offset = (page - 1) * limit;

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

    const countResult = await certificateTypeModel.executeQuery(
      countSQL,
      params
    );
    const total = countResult[0].total;

    // Get certificate types with pagination and usage count
    const selectSQL = `
      SELECT ct.id, ct.name, ct.description,
             (SELECT COUNT(*) FROM ${PRODUCT_CERTIFICATES_TABLE} WHERE certificate_type_id = ct.id) as usage_count
      FROM ${CERTIFICATE_TYPES_TABLE} ct
      WHERE ${whereClause}
      ORDER BY ct.name ASC
      LIMIT ? OFFSET ?
    `;

    // Add pagination parameters
    const queryParams = [...params, limit, offset];
    const certificateTypes = await certificateTypeModel.executeQuery(
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
    return await certificateTypeModel.update(id, updateData);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new AppError(
        'A certificate type with this name already exists',
        409
      );
    }
    throw error;
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
    // Check if certificate type exists
    await getCertificateTypeById(id);

    // Check if the certificate type is in use
    const usageSQL = `
      SELECT COUNT(*) as count 
      FROM ${PRODUCT_CERTIFICATES_TABLE} 
      WHERE certificate_type_id = ?
    `;
    const usageResult = await certificateTypeModel.executeQuery(usageSQL, [id]);
    const usageCount = usageResult[0].count;

    if (usageCount > 0 && !force) {
      throw new AppError(
        `Cannot delete certificate type that is in use by ${usageCount} products. Use force=true to override.`,
        400
      );
    }

    // Use transaction for this operation
    return await certificateTypeModel.withTransaction(async (connection) => {
      // If force is true and there are usages, delete the associated product certificates first
      if (force && usageCount > 0) {
        const deleteCertificatesSQL = `DELETE FROM ${PRODUCT_CERTIFICATES_TABLE} WHERE certificate_type_id = ?`;
        await certificateTypeModel.executeQuery(deleteCertificatesSQL, [id]);
      }

      // Delete the certificate type
      await certificateTypeModel.delete(id);

      return {
        message: 'Certificate type deleted successfully',
        deletedAssociations: force ? usageCount : 0,
      };
    });
  } catch (error) {
    throw new AppError(
      `Failed to delete certificate type: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Gets products using a specific certificate type
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
    // Check if certificate type exists
    await getCertificateTypeById(certificateTypeId);

    const page = options.page || 1;
    const limit = options.limit || 20;
    const offset = (page - 1) * limit;

    // Get total count for pagination
    const countSQL = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM products p
      JOIN product_certificates pc ON p.id = pc.product_id
      WHERE pc.certificate_type_id = ?
    `;

    const countResult = await certificateTypeModel.executeQuery(countSQL, [
      certificateTypeId,
    ]);
    const total = countResult[0].total;

    // Get products with pagination
    const selectSQL = `
      SELECT p.id, p.product_id, p.icon_url, p.remark,
             GROUP_CONCAT(DISTINCT pn.name ORDER BY pn.name_type_id SEPARATOR '|') as names,
             COUNT(DISTINCT pc.id) as certificate_count
      FROM products p
      JOIN product_certificates pc ON p.id = pc.product_id
      LEFT JOIN product_names pn ON p.id = pn.product_id
      WHERE pc.certificate_type_id = ?
      GROUP BY p.id
      ORDER BY p.product_id ASC
      LIMIT ? OFFSET ?
    `;

    const products = await certificateTypeModel.executeQuery(selectSQL, [
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
    return await certificateTypeModel.withTransaction(async (connection) => {
      const results = {
        total: certificateTypes.length,
        successful: 0,
        failed: 0,
        details: [],
      };

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

      return results;
    });
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

/**
 * Truncates the certificate types table
 * @returns {Promise<Object>} Promise that resolves with truncation result
 */
export const truncateCertificateTypes = async () => {
  try {
    return await certificateTypeModel.truncateTable();
  } catch (error) {
    throw new AppError(
      `Failed to truncate certificate types: ${error.message}`,
      500
    );
  }
};
