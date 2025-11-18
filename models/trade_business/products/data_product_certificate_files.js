import * as dbConn from '../../../utils/dbConn.js';
import AppError from '../../../utils/appError.js';
import { v4 as uuidv4 } from 'uuid';
import { TABLE_MASTER } from '../../tables.js';

// Table name constant for consistency
const CERTIFICATE_FILES_TABLE = TABLE_MASTER['PRODUCT_CERTIFICATE_FILES'].name;

/**
 * Gets certificate files by certificate ID
 * @param {string} certificateId - The certificate ID
 * @returns {Promise<Array<Object>>} Promise that resolves with the certificate files
 */
export const getProductCertificateFilesByCertificateId = async (
  certificateId
) => {
  try {
    const pool = dbConn.tb_pool;

    const sql = `
      SELECT * FROM ${CERTIFICATE_FILES_TABLE}
      WHERE certificate_id = ?
    `;

    const result = await pool.query(sql, [certificateId]);
    return result[0];
  } catch (error) {
    throw new AppError(
      `Failed to get certificate files: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Upserts certificate files
 * @param {string} certificateId - The certificate ID
 * @param {Array<{file_url: string, file_name: string}>} files - The files to upsert
 * @returns {Promise<void>} Promise that resolves when the operation is complete
 */
export const upsertProductCertificateFiles = async (certificateId, files) => {
  try {
    const pool = dbConn.tb_pool;

    // Delete existing files for this certificate
    const deleteSQL = `DELETE FROM ${CERTIFICATE_FILES_TABLE} WHERE certificate_id = ?`;
    await pool.query(deleteSQL, [certificateId]);

    // Insert new files
    if (files && files.length > 0) {
      const insertSQL = `INSERT INTO ${CERTIFICATE_FILES_TABLE} (id, certificate_id, file_url, file_name) VALUES ?`;
      const values = files.map((file) => [
        uuidv4(),
        certificateId,
        file.file_url,
        file.file_name || null,
      ]);

      await pool.query(insertSQL, [values]);
    }
  } catch (error) {
    throw new AppError(
      `Failed to upsert certificate files: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Gets a certificate file by ID
 * @param {string} id - The file ID
 * @returns {Promise<Object>} Promise that resolves with the file data
 */
export const getProductCertificateFileById = async (id) => {
  try {
    const pool = dbConn.tb_pool;

    const sql = `
      SELECT * FROM ${CERTIFICATE_FILES_TABLE}
      WHERE id = ?
    `;

    const result = await pool.query(sql, [id]);

    if (result[0].length === 0) {
      throw new AppError('Certificate file not found', 404);
    }

    return result[0][0];
  } catch (error) {
    throw new AppError(
      `Failed to get certificate file: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Deletes a certificate file
 * @param {string} id - The file ID
 * @returns {Promise<Object>} Promise that resolves with deletion result
 */
export const deleteProductCertificateFile = async (id) => {
  try {
    const pool = dbConn.tb_pool;

    // Check if file exists
    await getProductCertificateFileById(id);

    const sql = `DELETE FROM ${CERTIFICATE_FILES_TABLE} WHERE id = ?`;
    await pool.query(sql, [id]);

    return {
      message: 'Certificate file deleted successfully',
      fileId: id,
    };
  } catch (error) {
    throw new AppError(
      `Failed to delete certificate file: ${error.message}`,
      error.statusCode || 500
    );
  }
};
