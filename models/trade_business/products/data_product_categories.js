import * as dbConn from '../../../utils/dbConn.js';
import AppError from '../../../utils/appError.js';
import { v4 as uuidv4 } from 'uuid';
import { TABLE_MASTER } from '../../tables.js';

// Table name constant for consistency
const PRODUCT_CATEGORIES_TABLE = TABLE_MASTER['PRODUCT_CATEGORIES'];

/**
 * Gets product categories by product ID
 * @param {string} productId - The product ID
 * @returns {Promise<Array<Object>>} Promise that resolves with the product categories
 */
export const getProductCategoriesByProductId = async (productId) => {
  try {
    const pool = dbConn.tb_pool;

    const sql = `
      SELECT pc.*, c.name as category_name
      FROM ${PRODUCT_CATEGORIES_TABLE} pc
      LEFT JOIN categories c ON pc.category_id = c.id
      WHERE pc.product_id = ?
    `;

    const result = await pool.query(sql, [productId]);
    return result[0];
  } catch (error) {
    throw new AppError(
      `Failed to get product categories: ${error.message}`,
      error.statusCode || 500
    );
  }
};
/**
 * Upserts product categories
 * @param {string} productId - The product ID
 * @param {Array<{category_id: string}>} categories - The categories to upsert
 * @returns {Promise<void>} Promise that resolves when the operation is complete
 */
export const upsertProductCategories = async (productId, categories) => {
  try {
    const pool = dbConn.tb_pool;

    // Prepare the data for bulk upsert
    const categoryData =
      categories && categories.length > 0
        ? categories.map((category) => ({
            id: uuidv4(),
            product_id: productId,
            category_id: category.category_id,
          }))
        : [];

    // Use the bulkUpsert operation
    await CrudOperations.performCrud({
      operation: 'bulkUpsert',
      tableName: PRODUCT_CATEGORIES_TABLE,
      data: categoryData,
      conditions: { product_id: productId },
      connection: pool,
    });

    return {
      message: 'Product categories updated successfully',
      count: categoryData.length,
    };
  } catch (error) {
    throw new AppError(
      `Failed to upsert product categories: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Gets products by category ID
 * @param {string} categoryId - The category ID
 * @returns {Promise<Array<string>>} Promise that resolves with array of product IDs
 */
export const getProductIdsByCategoryId = async (categoryId) => {
  try {
    const pool = dbConn.tb_pool;

    const sql = `
      SELECT product_id FROM ${PRODUCT_CATEGORIES_TABLE}
      WHERE category_id = ?
    `;

    const result = await pool.query(sql, [categoryId]);
    return result[0].map((item) => item.product_id);
  } catch (error) {
    throw new AppError(
      `Failed to get products by category: ${error.message}`,
      error.statusCode || 500
    );
  }
};
