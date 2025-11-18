import * as dbConn from '../../../utils/dbConn.js';
import AppError from '../../../utils/appError.js';
import CrudOperations from '../../../utils/crud.js';
import { v4 as uuidv4 } from 'uuid';
import { TABLE_MASTER } from '../../tables.js';

// Table name constant for consistency
const TABLE_NAME = TABLE_MASTER['PRODUCT_NAMES'].name;

/**
 * Creates a new product name
 * @param {Object} data - The product name data
 * @param {string} data.product_id - The product ID this name belongs to
 * @param {string} data.name - The product name
 * @param {number} data.name_type_id - The name type ID (e.g., 1 for English, 2 for Chinese)
 * @param {string} [data.id] - Optional UUID (generated if not provided)
 * @returns {Promise<Object>} Promise that resolves with the created product name
 */
export const createProductName = async (data) => {
  try {
    const pool = dbConn.tb_pool;

    // Validate required fields
    if (!data.product_id) {
      throw new AppError('Product ID is required', 400);
    }

    if (!data.name) {
      throw new AppError('Product name is required', 400);
    }

    if (!data.name_type_id) {
      throw new AppError('Name type ID is required', 400);
    }

    // Generate UUID if not provided
    const nameData = {
      ...data,
      id: data.id || uuidv4(),
    };

    // Check if a name of this type already exists for this product
    const existingName = await getProductNameByTypeAndProductId(
      data.product_id,
      data.name_type_id
    );

    if (existingName) {
      throw new AppError(
        `A name of type ${data.name_type_id} already exists for this product`,
        409
      );
    }

    // Create the product name using CRUD utility
    const result = await CrudOperations.performCrud({
      operation: 'create',
      tableName: TABLE_NAME,
      data: nameData,
      connection: pool,
    });

    return {
      message: 'Product name created successfully',
      productName: result.record,
    };
  } catch (error) {
    throw new AppError(
      `Failed to create product name: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Gets a product name by ID
 * @param {string} id - The ID of the product name to retrieve
 * @returns {Promise<Object>} Promise that resolves with the product name data
 */
export const getProductNameById = async (id) => {
  try {
    const pool = dbConn.tb_pool;

    // Get the product name using CRUD utility
    const result = await CrudOperations.performCrud({
      operation: 'read',
      tableName: TABLE_NAME,
      id: id,
      connection: pool,
    });

    if (!result.record) {
      throw new AppError('Product name not found', 404);
    }

    return result.record;
  } catch (error) {
    throw new AppError(
      `Failed to get product name: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Gets a product name by product ID and name type ID
 * @param {string} productId - The product ID
 * @param {number} nameTypeId - The name type ID
 * @returns {Promise<Object|null>} Promise that resolves with the product name data or null if not found
 */
export const getProductNameByTypeAndProductId = async (
  productId,
  nameTypeId
) => {
  try {
    const pool = dbConn.tb_pool;

    // Get the product name using CRUD utility
    const result = await CrudOperations.performCrud({
      operation: 'read',
      tableName: TABLE_NAME,
      conditions: { product_id: productId, name_type_id: nameTypeId },
      connection: pool,
    });

    return result.records.length > 0 ? result.records[0] : null;
  } catch (error) {
    throw new AppError(
      `Failed to get product name: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Gets all names for a product
 * @param {string} productId - The product ID to get names for
 * @returns {Promise<Array>} Promise that resolves with the product names
 */
export const getProductNamesByProductId = async (productId) => {
  try {
    const pool = dbConn.tb_pool;

    // For this query with joins, we'll use direct SQL
    const sql = `
      SELECT pn.id, pn.product_id, pn.name, pn.name_type_id, nt.name as type_name
      FROM ${TABLE_NAME} pn
      LEFT JOIN name_types nt ON pn.name_type_id = nt.id
      WHERE pn.product_id = ?
      ORDER BY pn.name_type_id
    `;

    const result = await pool.query(sql, [productId]);
    return result[0];
  } catch (error) {
    throw new AppError(
      `Failed to get product names: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Updates a product name
 * @param {string} id - The ID of the product name to update
 * @param {Object} data - The product name data to update
 * @param {string} [data.name] - The updated name
 * @param {number} [data.name_type_id] - The updated name type ID
 * @returns {Promise<Object>} Promise that resolves with the updated product name
 */
export const updateProductName = async (id, data) => {
  try {
    const pool = dbConn.tb_pool;

    // Get existing product name
    const existingName = await getProductNameById(id);

    // Check if changing name type and if that type already exists for this product
    if (
      data.name_type_id !== undefined &&
      data.name_type_id !== existingName.name_type_id
    ) {
      const nameWithSameType = await getProductNameByTypeAndProductId(
        existingName.product_id,
        data.name_type_id
      );

      if (nameWithSameType) {
        throw new AppError(
          `A name of type ${data.name_type_id} already exists for this product`,
          409
        );
      }
    }

    // Update the product name using CRUD utility
    const result = await CrudOperations.performCrud({
      operation: 'update',
      tableName: TABLE_NAME,
      id: id,
      data: data,
      connection: pool,
    });

    return {
      message: 'Product name updated successfully',
      productName: result.record,
    };
  } catch (error) {
    throw new AppError(
      `Failed to update product name: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Deletes a product name
 * @param {string} id - The ID of the product name to delete
 * @returns {Promise<Object>} Promise that resolves with deletion result
 */
export const deleteProductName = async (id) => {
  try {
    const pool = dbConn.tb_pool;

    // Check if product name exists
    await getProductNameById(id);

    // Delete the product name using CRUD utility
    await CrudOperations.performCrud({
      operation: 'delete',
      tableName: TABLE_NAME,
      id: id,
      connection: pool,
    });

    return {
      message: 'Product name deleted successfully',
      id,
    };
  } catch (error) {
    throw new AppError(
      `Failed to delete product name: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Updates or creates product names (upsert operation)
 * @param {string} productId - The product ID
 * @param {Array<{name_type_id: number, name: string}>} names - Array of name objects
 * @returns {Promise<Object>} Promise that resolves with upsert result
 */
export const upsertProductNames = async (productId, names) => {
  try {
    const pool = dbConn.tb_pool;

    // Start transaction
    await pool.query('START TRANSACTION');

    try {
      // Get existing names for this product
      const existingNames = await getProductNamesByProductId(productId);
      const existingNamesByType = {};

      existingNames.forEach((name) => {
        existingNamesByType[name.name_type_id] = name;
      });

      const results = {
        created: [],
        updated: [],
      };

      // Process each name
      for (const nameData of names) {
        const existingName = existingNamesByType[nameData.name_type_id];

        if (existingName) {
          // Update existing name if it's different
          if (existingName.name !== nameData.name) {
            const result = await CrudOperations.performCrud({
              operation: 'update',
              tableName: TABLE_NAME,
              id: existingName.id,
              data: { name: nameData.name },
              connection: pool,
            });

            results.updated.push(result.record);
          } else {
            results.updated.push(existingName);
          }
        } else {
          // Create new name
          const result = await CrudOperations.performCrud({
            operation: 'create',
            tableName: TABLE_NAME,
            data: {
              id: uuidv4(),
              product_id: productId,
              name_type_id: nameData.name_type_id,
              name: nameData.name,
            },
            connection: pool,
          });

          results.created.push(result.record);
        }
      }

      // Commit transaction
      await pool.query('COMMIT');

      return {
        message: 'Product names updated successfully',
        created: results.created.length,
        updated: results.updated.length,
        names: await getProductNamesByProductId(productId),
      };
    } catch (error) {
      // Rollback transaction on error
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    throw new AppError(
      `Failed to update product names: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Deletes all names for a product
 * @param {string} productId - The product ID to delete names for
 * @returns {Promise<Object>} Promise that resolves with deletion result
 */
export const deleteProductNamesByProductId = async (productId) => {
  try {
    const pool = dbConn.tb_pool;

    // Get all names for this product
    const productNames = await getProductNamesByProductId(productId);

    if (productNames.length === 0) {
      return {
        message: 'No product names found for this product',
        count: 0,
      };
    }

    // Delete the product names
    await CrudOperations.performCrud({
      operation: 'delete',
      tableName: TABLE_NAME,
      conditions: { product_id: productId },
      connection: pool,
    });

    return {
      message: 'Product names deleted successfully',
      count: productNames.length,
    };
  } catch (error) {
    throw new AppError(
      `Failed to delete product names: ${error.message}`,
      error.statusCode || 500
    );
  }
};
