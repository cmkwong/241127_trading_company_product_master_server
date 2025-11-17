import * as dbConn from '../../../utils/dbConn.js';
import AppError from '../../../utils/appError.js';
import { v4 as uuidv4 } from 'uuid';

// Table name constant for consistency
const ALIBABA_IDS_TABLE = 'product_alibaba_ids';

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
 * @returns {Promise<void>} Promise that resolves when the operation is complete
 */
export const upsertProductAlibabaIds = async (productId, alibabaIds) => {
  try {
    const pool = dbConn.tb_pool;

    // Delete existing Alibaba IDs for this product
    const deleteSQL = `DELETE FROM ${ALIBABA_IDS_TABLE} WHERE product_id = ?`;
    await pool.query(deleteSQL, [productId]);

    // Insert new Alibaba IDs
    if (alibabaIds && alibabaIds.length > 0) {
      const insertSQL = `INSERT INTO ${ALIBABA_IDS_TABLE} (id, product_id, alibaba_id, url) VALUES ?`;
      const values = alibabaIds.map((item) => [
        uuidv4(),
        productId,
        item.alibaba_id,
        item.url || null,
      ]);

      await pool.query(insertSQL, [values]);
    }
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