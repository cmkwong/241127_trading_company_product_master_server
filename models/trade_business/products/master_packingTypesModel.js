import DataModelUtils from '../../../utils/dataModelUtils.js';
import AppError from '../../../utils/appError.js';
import { TABLE_MASTER } from '../../tables.js';
import { tradeBusinessDbc } from '../../dbModel.js';

// Table name constants for consistency
const PACKING_TYPES_TABLE = TABLE_MASTER['MASTER_PACKING_TYPES'].name;
const PRODUCT_PACKINGS_TABLE = TABLE_MASTER['PRODUCT_PACKINGS'].name;

// Create DataModelUtils instance for packing types
export const packingTypeModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: PACKING_TYPES_TABLE,
  tableFields: TABLE_MASTER['MASTER_PACKING_TYPES'].fields,
  entityName: 'packing type',
  requiredFields: ['name'],
  validations: {
    name: { required: true },
  },
});

/**
 * Creates a new packing type
 * @param {Object} packingTypeData - The packing type data to create
 * @param {string} packingTypeData.name - The name of the packing type
 * @param {string} [packingTypeData.description] - Optional description of the packing type
 * @returns {Promise<Object>} Promise that resolves with the created packing type
 */
export const createPackingType = async (packingTypeData) => {
  try {
    return await packingTypeModel.create(packingTypeData);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new AppError('A packing type with this name already exists', 409);
    }
    throw error;
  }
};

/**
 * Gets a packing type by ID
 * @param {number} id - The ID of the packing type to retrieve
 * @returns {Promise<Object>} Promise that resolves with the packing type data
 */
export const getPackingTypeById = async (id) => {
  return await packingTypeModel.getById(id);
};

/**
 * Gets all packing types with optional filtering and pagination
 * @param {Object} [options] - Query options
 * @param {string} [options.search] - Search term for packing type name
 * @param {number} [options.page=1] - Page number for pagination
 * @param {number} [options.limit=100] - Number of results per page
 * @returns {Promise<Object>} Promise that resolves with the packing types and pagination info
 */
export const getAllPackingTypes = async (options = {}) => {
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
      FROM ${PACKING_TYPES_TABLE}
      WHERE ${whereClause}
    `;

    const countResult = await packingTypeModel.executeQuery(countSQL, params);
    const total = countResult[0].total;

    // Get packing types with pagination and usage count
    const selectSQL = `
      SELECT id, name, description,
             (SELECT COUNT(*) FROM ${PRODUCT_PACKINGS_TABLE} WHERE packing_type_id = ${PACKING_TYPES_TABLE}.id) as usage_count
      FROM ${PACKING_TYPES_TABLE}
      WHERE ${whereClause}
      ORDER BY name ASC
      LIMIT ? OFFSET ?
    `;

    // Add pagination parameters
    const queryParams = [...params, limit, offset];
    const packingTypes = await packingTypeModel.executeQuery(
      selectSQL,
      queryParams
    );

    return {
      packingTypes,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw new AppError(`Failed to get packing types: ${error.message}`, 500);
  }
};

/**
 * Updates a packing type
 * @param {number} id - The ID of the packing type to update
 * @param {Object} updateData - The packing type data to update
 * @param {string} [updateData.name] - The updated name of the packing type
 * @param {string} [updateData.description] - The updated description of the packing type
 * @returns {Promise<Object>} Promise that resolves with the updated packing type
 */
export const updatePackingType = async (id, updateData) => {
  try {
    return await packingTypeModel.update(id, updateData);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new AppError('A packing type with this name already exists', 409);
    }
    throw error;
  }
};

/**
 * Deletes a packing type
 * @param {number} id - The ID of the packing type to delete
 * @param {boolean} [force=false] - Whether to force deletion even if in use
 * @returns {Promise<Object>} Promise that resolves with deletion result
 */
export const deletePackingType = async (id, force = false) => {
  try {
    // Check if packing type exists
    await getPackingTypeById(id);

    // Check if the packing type is in use
    const usageSQL = `
      SELECT COUNT(*) as count 
      FROM ${PRODUCT_PACKINGS_TABLE} 
      WHERE packing_type_id = ?
    `;
    const usageResult = await packingTypeModel.executeQuery(usageSQL, [id]);
    const usageCount = usageResult[0].count;

    if (usageCount > 0 && !force) {
      throw new AppError(
        `Cannot delete packing type that is in use by ${usageCount} products. Use force=true to override.`,
        400
      );
    }

    // Use transaction for this operation
    return await packingTypeModel.withTransaction(async (connection) => {
      // If force is true and there are usages, delete the associated product packings first
      if (force && usageCount > 0) {
        const deletePackingsSQL = `DELETE FROM ${PRODUCT_PACKINGS_TABLE} WHERE packing_type_id = ?`;
        await packingTypeModel.executeQuery(deletePackingsSQL, [id]);
      }

      // Delete the packing type
      await packingTypeModel.delete(id);

      return {
        message: 'Packing type deleted successfully',
        deletedAssociations: force ? usageCount : 0,
      };
    });
  } catch (error) {
    throw new AppError(
      `Failed to delete packing type: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Gets products using a specific packing type
 * @param {number} packingTypeId - The ID of the packing type
 * @param {Object} [options] - Query options
 * @param {number} [options.page=1] - Page number for pagination
 * @param {number} [options.limit=20] - Number of results per page
 * @returns {Promise<Object>} Promise that resolves with products and pagination info
 */
export const getProductsByPackingType = async (packingTypeId, options = {}) => {
  try {
    // Check if packing type exists
    await getPackingTypeById(packingTypeId);

    const page = options.page || 1;
    const limit = options.limit || 20;
    const offset = (page - 1) * limit;

    // Get total count for pagination
    const countSQL = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM products p
      JOIN product_packings pp ON p.id = pp.product_id
      WHERE pp.packing_type_id = ?
    `;

    const countResult = await packingTypeModel.executeQuery(countSQL, [
      packingTypeId,
    ]);
    const total = countResult[0].total;

    // Get products with pagination
    const selectSQL = `
      SELECT p.id, p.product_id, p.icon_url, p.remark,
             GROUP_CONCAT(DISTINCT pn.name ORDER BY pn.name_type_id SEPARATOR '|') as names,
             COUNT(DISTINCT pp.id) as packing_count
      FROM products p
      JOIN product_packings pp ON p.id = pp.product_id
      LEFT JOIN product_names pn ON p.id = pn.product_id
      WHERE pp.packing_type_id = ?
      GROUP BY p.id
      ORDER BY p.product_id ASC
      LIMIT ? OFFSET ?
    `;

    const products = await packingTypeModel.executeQuery(selectSQL, [
      packingTypeId,
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
      `Failed to get products by packing type: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Gets packing statistics by packing type
 * @param {number} packingTypeId - The ID of the packing type
 * @returns {Promise<Object>} Promise that resolves with packing statistics
 */
export const getPackingStatistics = async (packingTypeId) => {
  try {
    // Check if packing type exists
    const packingType = await getPackingTypeById(packingTypeId);

    // Get statistics
    const statsSQL = `
      SELECT 
        COUNT(*) as total_packings,
        AVG(length) as avg_length,
        AVG(width) as avg_width,
        AVG(height) as avg_height,
        AVG(weight) as avg_weight,
        AVG(quantity) as avg_quantity,
        MIN(length) as min_length,
        MIN(width) as min_width,
        MIN(height) as min_height,
        MIN(weight) as min_weight,
        MIN(quantity) as min_quantity,
        MAX(length) as max_length,
        MAX(width) as max_width,
        MAX(height) as max_height,
        MAX(weight) as max_weight,
        MAX(quantity) as max_quantity
      FROM ${PRODUCT_PACKINGS_TABLE}
      WHERE packing_type_id = ?
    `;

    const stats = await packingTypeModel.executeQuery(statsSQL, [
      packingTypeId,
    ]);

    // Get product count
    const productCountSQL = `
      SELECT COUNT(DISTINCT product_id) as product_count
      FROM ${PRODUCT_PACKINGS_TABLE}
      WHERE packing_type_id = ?
    `;

    const productCount = await packingTypeModel.executeQuery(productCountSQL, [
      packingTypeId,
    ]);

    return {
      packingType,
      statistics: {
        ...stats[0],
        product_count: productCount[0].product_count,
      },
    };
  } catch (error) {
    throw new AppError(
      `Failed to get packing statistics: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Batch creates multiple packing types
 * @param {Array<Object>} packingTypes - Array of packing type objects to create
 * @returns {Promise<Object>} Promise that resolves with creation results
 */
export const batchCreatePackingTypes = async (packingTypes) => {
  try {
    return await packingTypeModel.withTransaction(async (connection) => {
      const results = {
        total: packingTypes.length,
        successful: 0,
        failed: 0,
        details: [],
      };

      for (const packingType of packingTypes) {
        try {
          const result = await createPackingType(packingType);
          results.successful++;
          results.details.push({
            name: packingType.name,
            success: true,
            id: result.packingType.id,
          });
        } catch (error) {
          results.failed++;
          results.details.push({
            name: packingType.name,
            success: false,
            error: error.message,
          });
        }
      }

      return results;
    });
  } catch (error) {
    throw new AppError(
      `Failed to batch create packing types: ${error.message}`,
      500
    );
  }
};

/**
 * Inserts default packing types
 * @returns {Promise<Object>} Promise that resolves with insertion results
 */
export const insertDefaultPackingTypes = async () => {
  try {
    // Import packing types from data file
    const defaultProducts = await import('../../../datas/products.js');
    const defaultPackingTypes = defaultProducts.default.master_packing_types;

    const results = await batchCreatePackingTypes(defaultPackingTypes);

    return {
      message: 'Default packing types inserted successfully',
      results,
    };
  } catch (error) {
    throw new AppError(
      `Failed to insert default packing types: ${error.message}`,
      500
    );
  }
};

/**
 * Truncates the packing types table
 * @returns {Promise<Object>} Promise that resolves with truncation result
 */
export const truncatePackingTypes = async () => {
  try {
    return await packingTypeModel.truncateTable();
  } catch (error) {
    throw new AppError(
      `Failed to truncate packing types: ${error.message}`,
      500
    );
  }
};
