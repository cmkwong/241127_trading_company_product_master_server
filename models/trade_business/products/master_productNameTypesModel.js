import * as dbConn from '../../../utils/dbConn.js';
import * as dbModel from '../../../models/dbModel.js';
import AppError from '../../../utils/appError.js';
import CrudOperations from '../../../utils/crud.js';
import { TABLE_MASTER } from '../../tables.js';

// Table name constant for consistency
const PRODUCT_NAME_TYPES_TABLE = TABLE_MASTER['MASTER_PRODUCT_NAME_TYPES'].name;
const PRODUCT_NAMES_TABLE = TABLE_MASTER['PRODUCT_NAMES'].name;

/**
 * Creates a new product name type
 * @param {Object} nameTypeData - The product name type data to create
 * @param {string} nameTypeData.name - The name of the product name type
 * @param {string} [nameTypeData.description] - Optional description of the product name type
 * @returns {Promise<Object>} Promise that resolves with the created product name type
 */
export const createProductNameType = async (nameTypeData) => {
  try {
    const pool = dbConn.tb_pool;

    // Validate required fields
    if (!nameTypeData.name) {
      throw new AppError('Product name type name is required', 400);
    }

    // Create the product name type using CRUD utility
    const result = await CrudOperations.performCrud({
      operation: 'create',
      tableName: PRODUCT_NAME_TYPES_TABLE,
      data: nameTypeData,
      connection: pool,
    });

    return {
      message: 'Product name type created successfully',
      productNameType: result.record,
    };
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new AppError(
        'A product name type with this name already exists',
        409
      );
    }
    throw new AppError(
      `Failed to create product name type: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Gets a product name type by ID
 * @param {string} id - The ID of the product name type to retrieve
 * @returns {Promise<Object>} Promise that resolves with the product name type data
 */
export const getProductNameTypeById = async (id) => {
  try {
    const pool = dbConn.tb_pool;

    // Get the product name type using CRUD utility
    const result = await CrudOperations.performCrud({
      operation: 'read',
      tableName: PRODUCT_NAME_TYPES_TABLE,
      id: id,
      connection: pool,
    });

    if (!result.record) {
      throw new AppError('Product name type not found', 404);
    }

    return result.record;
  } catch (error) {
    throw new AppError(
      `Failed to get product name type: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Gets all product name types with optional filtering and pagination
 * @param {Object} [options] - Query options
 * @param {string} [options.search] - Search term for product name type name
 * @param {number} [options.page=1] - Page number for pagination
 * @param {number} [options.limit=100] - Number of results per page
 * @returns {Promise<Object>} Promise that resolves with the product name types and pagination info
 */
export const getAllProductNameTypes = async (options = {}) => {
  try {
    const pool = dbConn.tb_pool;

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
      FROM ${PRODUCT_NAME_TYPES_TABLE}
      WHERE ${whereClause}
    `;

    const countResult = await dbModel.executeQuery(pool, countSQL, params);
    const total = countResult[0].total;

    // Get product name types with pagination and usage count
    const selectSQL = `
      SELECT pt.id, pt.name, pt.description,
             (SELECT COUNT(*) FROM ${PRODUCT_NAMES_TABLE} WHERE name_type_id = pt.id) as usage_count
      FROM ${PRODUCT_NAME_TYPES_TABLE} pt
      WHERE ${whereClause}
      ORDER BY pt.name ASC
      LIMIT ? OFFSET ?
    `;

    // Add pagination parameters
    const page = options.page || 1;
    const limit = options.limit || 100;
    const offset = (page - 1) * limit;
    const queryParams = [...params, limit, offset];
    const productNameTypes = await dbModel.executeQuery(
      pool,
      selectSQL,
      queryParams
    );

    return {
      productNameTypes,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw new AppError(
      `Failed to get product name types: ${error.message}`,
      500
    );
  }
};

/**
 * Updates a product name type
 * @param {string} id - The ID of the product name type to update
 * @param {Object} updateData - The product name type data to update
 * @param {string} [updateData.name] - The updated name of the product name type
 * @param {string} [updateData.description] - The updated description of the product name type
 * @returns {Promise<Object>} Promise that resolves with the updated product name type
 */
export const updateProductNameType = async (id, updateData) => {
  try {
    const pool = dbConn.tb_pool;

    // Check if product name type exists
    await getProductNameTypeById(id);

    // Update the product name type using CRUD utility
    const result = await CrudOperations.performCrud({
      operation: 'update',
      tableName: PRODUCT_NAME_TYPES_TABLE,
      id: id,
      data: updateData,
      connection: pool,
    });

    return {
      message: 'Product name type updated successfully',
      productNameType: result.record,
    };
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new AppError(
        'A product name type with this name already exists',
        409
      );
    }
    throw new AppError(
      `Failed to update product name type: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Deletes a product name type
 * @param {string} id - The ID of the product name type to delete
 * @param {boolean} [force=false] - Whether to force deletion even if in use
 * @returns {Promise<Object>} Promise that resolves with deletion result
 */
export const deleteProductNameType = async (id, force = false) => {
  try {
    const pool = dbConn.tb_pool;

    // Check if product name type exists
    await getProductNameTypeById(id);

    // Check if the product name type is in use
    const usageResult = await CrudOperations.performCrud({
      operation: 'read',
      tableName: PRODUCT_NAMES_TABLE,
      conditions: { name_type_id: id },
      connection: pool,
    });

    const usageCount = usageResult.records.length;

    if (usageCount > 0 && !force) {
      throw new AppError(
        `Cannot delete product name type that is in use by ${usageCount} products. Use force=true to override.`,
        400
      );
    }

    // Start transaction
    await dbModel.executeQuery(pool, 'START TRANSACTION');

    try {
      // If force is true and there are usages, delete the associated product names first
      if (force && usageCount > 0) {
        await CrudOperations.performCrud({
          operation: 'bulkdelete',
          tableName: PRODUCT_NAMES_TABLE,
          ids: usageResult.records.map((record) => record.id),
          connection: pool,
        });
      }

      // Delete the product name type using CRUD utility
      await CrudOperations.performCrud({
        operation: 'delete',
        tableName: PRODUCT_NAME_TYPES_TABLE,
        id: id,
        connection: pool,
      });

      // Commit transaction
      await dbModel.executeQuery(pool, 'COMMIT');

      return {
        message: 'Product name type deleted successfully',
        deletedAssociations: force ? usageCount : 0,
      };
    } catch (error) {
      // Rollback transaction on error
      await dbModel.executeQuery(pool, 'ROLLBACK');
      throw error;
    }
  } catch (error) {
    throw new AppError(
      `Failed to delete product name type: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Gets products using a specific product name type
 * @param {string} nameTypeId - The ID of the product name type
 * @param {Object} [options] - Query options
 * @param {number} [options.page=1] - Page number for pagination
 * @param {number} [options.limit=20] - Number of results per page
 * @returns {Promise<Object>} Promise that resolves with products and pagination info
 */
export const getProductsByNameType = async (nameTypeId, options = {}) => {
  try {
    const pool = dbConn.tb_pool;
    const page = options.page || 1;
    const limit = options.limit || 20;
    const offset = (page - 1) * limit;

    // Check if product name type exists
    await getProductNameTypeById(nameTypeId);

    // Get total count for pagination
    const countSQL = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM products p
      JOIN product_names pn ON p.id = pn.product_id
      WHERE pn.name_type_id = ?
    `;

    const countResult = await dbModel.executeQuery(pool, countSQL, [
      nameTypeId,
    ]);
    const total = countResult[0].total;

    // Get products with pagination
    const selectSQL = `
      SELECT p.id, p.product_id, p.icon_url, p.remark,
             pn.name as name_of_this_type,
             (SELECT GROUP_CONCAT(DISTINCT pn2.name ORDER BY pn2.name_type_id SEPARATOR '|') 
              FROM product_names pn2 
              WHERE pn2.product_id = p.id) as all_names
      FROM products p
      JOIN product_names pn ON p.id = pn.product_id
      WHERE pn.name_type_id = ?
      GROUP BY p.id
      ORDER BY p.product_id ASC
      LIMIT ? OFFSET ?
    `;

    const products = await dbModel.executeQuery(pool, selectSQL, [
      nameTypeId,
      limit,
      offset,
    ]);

    // Format product names
    products.forEach((product) => {
      if (product.all_names) {
        product.all_names = product.all_names.split('|');
      } else {
        product.all_names = [];
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
      `Failed to get products by name type: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Batch creates multiple product name types
 * @param {Array<Object>} nameTypes - Array of product name type objects to create
 * @returns {Promise<Object>} Promise that resolves with creation results
 */
export const batchCreateProductNameTypes = async (nameTypes) => {
  try {
    const pool = dbConn.tb_pool;

    // Use bulkCreate operation from CRUD utility
    const result = await CrudOperations.performCrud({
      operation: 'bulkcreate',
      tableName: PRODUCT_NAME_TYPES_TABLE,
      data: nameTypes,
      connection: pool,
    });

    return {
      total: nameTypes.length,
      successful: result.count,
      failed: nameTypes.length - result.count,
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
        total: nameTypes.length,
        successful: 0,
        failed: 0,
        details: [],
      };

      // Start transaction
      await dbModel.executeQuery(pool, 'START TRANSACTION');

      try {
        for (const nameType of nameTypes) {
          try {
            const result = await createProductNameType(nameType);
            results.successful++;
            results.details.push({
              name: nameType.name,
              success: true,
              id: result.productNameType.id,
            });
          } catch (error) {
            results.failed++;
            results.details.push({
              name: nameType.name,
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
        `Failed to batch create product name types: ${finalError.message}`,
        500
      );
    }
  }
};

/**
 * Inserts default product name types
 * @returns {Promise<Object>} Promise that resolves with insertion results
 */
export const insertDefaultProductNameTypes = async () => {
  try {
    // Import product name types from data file
    const sampleProducts = await import('../../../datas/products.js');
    const defaultNameTypes = sampleProducts.default.master_product_name_types;

    const results = await batchCreateProductNameTypes(defaultNameTypes);

    return {
      message: 'Default product name types inserted successfully',
      results,
    };
  } catch (error) {
    throw new AppError(
      `Failed to insert default product name types: ${error.message}`,
      500
    );
  }
};
