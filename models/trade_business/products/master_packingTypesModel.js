import * as dbConn from '../../../utils/dbConn.js';
import * as dbModel from '../../../models/dbModel.js';
import AppError from '../../../utils/appError.js';
import CrudOperations from '../../../utils/crud.js';
import { TABLE_NAMES } from '../../tables.js';

// Table name constant for consistency
const PACKING_TYPES_TABLE = TABLE_NAMES['PACKING_TYPES'];
const PRODUCT_PACKINGS_TABLE = TABLE_NAMES['PRODUCT_PACKINGS'];

/**
 * Creates a new packing type
 * @param {Object} packingTypeData - The packing type data to create
 * @param {string} packingTypeData.name - The name of the packing type
 * @param {string} [packingTypeData.description] - Optional description of the packing type
 * @returns {Promise<Object>} Promise that resolves with the created packing type
 */
export const createPackingType = async (packingTypeData) => {
  try {
    const pool = dbConn.tb_pool;

    // Validate required fields
    if (!packingTypeData.name) {
      throw new AppError('Packing type name is required', 400);
    }

    // Create the packing type using CRUD utility
    const result = await CrudOperations.performCrud({
      operation: 'create',
      tableName: PACKING_TYPES_TABLE,
      data: packingTypeData,
      connection: pool,
    });

    return {
      message: 'Packing type created successfully',
      packingType: result.record,
    };
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new AppError('A packing type with this name already exists', 409);
    }
    throw new AppError(
      `Failed to create packing type: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Gets a packing type by ID
 * @param {number} id - The ID of the packing type to retrieve
 * @returns {Promise<Object>} Promise that resolves with the packing type data
 */
export const getPackingTypeById = async (id) => {
  try {
    const pool = dbConn.tb_pool;

    // Get the packing type using CRUD utility
    const result = await CrudOperations.performCrud({
      operation: 'read',
      tableName: PACKING_TYPES_TABLE,
      id: id,
      connection: pool,
    });

    if (!result.record) {
      throw new AppError('Packing type not found', 404);
    }

    return result.record;
  } catch (error) {
    throw new AppError(
      `Failed to get packing type: ${error.message}`,
      error.statusCode || 500
    );
  }
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
      FROM ${PACKING_TYPES_TABLE}
      WHERE ${whereClause}
    `;

    const countResult = await dbModel.executeQuery(pool, countSQL, params);
    const total = countResult[0].total;

    // Get packing types with pagination
    const selectSQL = `
      SELECT id, name, description,
             (SELECT COUNT(*) FROM ${PRODUCT_PACKINGS_TABLE} WHERE packing_type_id = ${PACKING_TYPES_TABLE}.id) as usage_count
      FROM ${PACKING_TYPES_TABLE}
      WHERE ${whereClause}
      ORDER BY name ASC
      LIMIT ? OFFSET ?
    `;

    // Add pagination parameters
    const page = options.page || 1;
    const limit = options.limit || 100;
    const offset = (page - 1) * limit;
    const queryParams = [...params, limit, offset];
    const packingTypes = await dbModel.executeQuery(
      pool,
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
    const pool = dbConn.tb_pool;

    // Check if packing type exists
    await getPackingTypeById(id);

    // Update the packing type using CRUD utility
    const result = await CrudOperations.performCrud({
      operation: 'update',
      tableName: PACKING_TYPES_TABLE,
      id: id,
      data: updateData,
      connection: pool,
    });

    return {
      message: 'Packing type updated successfully',
      packingType: result.record,
    };
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new AppError('A packing type with this name already exists', 409);
    }
    throw new AppError(
      `Failed to update packing type: ${error.message}`,
      error.statusCode || 500
    );
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
    const pool = dbConn.tb_pool;

    // Check if packing type exists
    await getPackingTypeById(id);

    // Check if the packing type is in use
    const usageResult = await CrudOperations.performCrud({
      operation: 'read',
      tableName: PRODUCT_PACKINGS_TABLE,
      conditions: { packing_type_id: id },
      connection: pool,
    });

    const usageCount = usageResult.records.length;

    if (usageCount > 0 && !force) {
      throw new AppError(
        `Cannot delete packing type that is in use by ${usageCount} products. Use force=true to override.`,
        400
      );
    }

    // Start transaction
    await dbModel.executeQuery(pool, 'START TRANSACTION');

    try {
      // If force is true and there are usages, delete the associated product packings first
      if (force && usageCount > 0) {
        await CrudOperations.performCrud({
          operation: 'bulkdelete',
          tableName: PRODUCT_PACKINGS_TABLE,
          ids: usageResult.records.map((record) => record.id),
          connection: pool,
        });
      }

      // Delete the packing type using CRUD utility
      await CrudOperations.performCrud({
        operation: 'delete',
        tableName: PACKING_TYPES_TABLE,
        id: id,
        connection: pool,
      });

      // Commit transaction
      await dbModel.executeQuery(pool, 'COMMIT');

      return {
        message: 'Packing type deleted successfully',
        deletedAssociations: force ? usageCount : 0,
      };
    } catch (error) {
      // Rollback transaction on error
      await dbModel.executeQuery(pool, 'ROLLBACK');
      throw error;
    }
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
    const pool = dbConn.tb_pool;
    const page = options.page || 1;
    const limit = options.limit || 20;
    const offset = (page - 1) * limit;

    // Check if packing type exists
    await getPackingTypeById(packingTypeId);

    // For this complex query with joins and aggregations, we'll use direct SQL
    // Get total count for pagination
    const countSQL = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM products p
      JOIN product_packings pp ON p.id = pp.product_id
      WHERE pp.packing_type_id = ?
    `;

    const countResult = await dbModel.executeQuery(pool, countSQL, [
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

    const products = await dbModel.executeQuery(pool, selectSQL, [
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
    const pool = dbConn.tb_pool;

    // Check if packing type exists
    const packingType = await getPackingTypeById(packingTypeId);

    // For this complex query with aggregations, we'll use direct SQL
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

    const stats = await dbModel.executeQuery(pool, statsSQL, [packingTypeId]);

    // Get product count
    const productCountSQL = `
      SELECT COUNT(DISTINCT product_id) as product_count
      FROM ${PRODUCT_PACKINGS_TABLE}
      WHERE packing_type_id = ?
    `;

    const productCount = await dbModel.executeQuery(pool, productCountSQL, [
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
    const pool = dbConn.tb_pool;

    // Use bulkCreate operation from CRUD utility
    const result = await CrudOperations.performCrud({
      operation: 'bulkcreate',
      tableName: PACKING_TYPES_TABLE,
      data: packingTypes,
      connection: pool,
    });

    return {
      total: packingTypes.length,
      successful: result.count,
      failed: packingTypes.length - result.count,
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
        total: packingTypes.length,
        successful: 0,
        failed: 0,
        details: [],
      };

      // Start transaction
      await dbModel.executeQuery(pool, 'START TRANSACTION');

      try {
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
        `Failed to batch create packing types: ${finalError.message}`,
        500
      );
    }
  }
};

/**
 * Inserts default packing types
 * @returns {Promise<Object>} Promise that resolves with insertion results
 */
export const insertDefaultPackingTypes = async () => {
  try {
    const defaultPackingTypes = [
      { name: 'Single Unit', description: 'Individual product packaging' },
      { name: 'Carton', description: 'Bulk packaging carton' },
      { name: 'Pallet', description: 'Pallet packaging for shipping' },
      { name: 'Inner Box', description: 'Inner packaging box' },
      {
        name: 'Master Carton',
        description: 'Master carton for multiple units',
      },
      { name: 'Polybag', description: 'Plastic polybag packaging' },
      { name: 'Blister Pack', description: 'Blister packaging' },
      { name: 'Shrink Wrap', description: 'Shrink wrapped packaging' },
    ];

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
