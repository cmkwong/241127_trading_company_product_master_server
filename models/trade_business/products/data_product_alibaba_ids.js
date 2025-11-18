import * as dbConn from '../../../utils/dbConn.js';
import AppError from '../../../utils/appError.js';
import CrudOperations from '../../../utils/crud.js';
import { v4 as uuidv4 } from 'uuid';
import { TABLE_MASTER } from '../../tables.js';

// Table name constant for consistency
const ALIBABA_IDS_TABLE = TABLE_MASTER['PRODUCT_ALIBABA_IDS'].name;

/**
 * Gets product Alibaba IDs by product ID
 * @param {string} productId - The product ID
 * @returns {Promise<Array<Object>>} Promise that resolves with the product Alibaba IDs
 */
export const getProductAlibabaIdsByProductId = async (productId) => {
  try {
    const pool = dbConn.tb_pool;

    const sql = `
      SELECT * FROM ${ALIBABA_IDS_TABLE}
      WHERE product_id = ?
    `;

    const result = await pool.query(sql, [productId]);
    return result[0];
  } catch (error) {
    throw new AppError(
      `Failed to get product Alibaba IDs: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Upserts product Alibaba IDs
 * @param {string} productId - The product ID
 * @param {Array<{alibaba_id: string, url: string}>} alibabaIds - The Alibaba IDs to upsert
 * @returns {Promise<Object>} Promise that resolves with the upsert result
 */
export const upsertProductAlibabaIds = async (productId, alibabaIds) => {
  try {
    const pool = dbConn.tb_pool;

    // Prepare the data for bulk upsert
    const alibabaIdData =
      alibabaIds && alibabaIds.length > 0
        ? alibabaIds.map((item) => ({
            id: uuidv4(),
            product_id: productId,
            ...item,
          }))
        : [];

    // Use the bulkUpsert operation from CRUD utility
    const result = await CrudOperations.performCrud({
      operation: 'bulkUpsert',
      tableName: ALIBABA_IDS_TABLE,
      data: alibabaIdData,
      conditions: { product_id: productId },
      connection: pool,
    });

    return {
      message: 'Product Alibaba IDs updated successfully',
      count: alibabaIdData.length,
      ids: result.ids,
    };
  } catch (error) {
    throw new AppError(
      `Failed to upsert product Alibaba IDs: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Gets product by Alibaba ID
 * @param {string} alibabaId - The Alibaba ID
 * @returns {Promise<string|null>} Promise that resolves with product ID or null if not found
 */
export const getProductIdByAlibabaId = async (alibabaId) => {
  try {
    const pool = dbConn.tb_pool;

    const sql = `
      SELECT product_id FROM ${ALIBABA_IDS_TABLE}
      WHERE alibaba_id = ?
      LIMIT 1
    `;

    const result = await pool.query(sql, [alibabaId]);

    if (result[0].length > 0) {
      return result[0][0].product_id;
    }

    return null;
  } catch (error) {
    throw new AppError(
      `Failed to get product by Alibaba ID: ${error.message}`,
      error.statusCode || 500
    );
  }
};
