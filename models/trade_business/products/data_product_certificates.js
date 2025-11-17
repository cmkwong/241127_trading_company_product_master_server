import * as dbConn from '../../../utils/dbConn.js';
import AppError from '../../../utils/appError.js';
import CrudOperations from '../../../utils/crud.js';
import { v4 as uuidv4 } from 'uuid';

// Import certificate files module
import * as CertificateFiles from './data_product_certificate_files.js';

// Table name constant for consistency
const CERTIFICATES_TABLE = 'product_certificates';

/**
 * Gets product certificates by product ID
 * @param {string} productId - The product ID
 * @param {boolean} [includeFiles=false] - Whether to include certificate files
 * @returns {Promise<Array<Object>>} Promise that resolves with the product certificates
 */
export const getProductCertificatesByProductId = async (
  productId,
  includeFiles = false
) => {
  try {
    const pool = dbConn.tb_pool;

    const sql = `
      SELECT * FROM ${CERTIFICATES_TABLE}
      WHERE product_id = ?
    `;

    const result = await pool.query(sql, [productId]);
    const certificates = result[0];

    // Include certificate files if requested
    if (includeFiles && certificates.length > 0) {
      for (const certificate of certificates) {
        certificate.files = await CertificateFiles.getProductCertificateFilesByCertificateId(
          certificate.id
        );
      }
    }

    return certificates;
  } catch (error) {
    throw new AppError(
      `Failed to get product certificates: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Creates a product certificate
 * @param {Object} data - The certificate data
 * @param {string} data.product_id - The product ID
 * @param {string} data.name - The certificate name
 * @param {string} [data.description] - Optional certificate description
 * @param {Array<{file_url: string, file_name: string}>} [data.files] - Optional array of certificate files
 * @returns {Promise<Object>} Promise that resolves with the created certificate
 */
export const createProductCertificate = async (data) => {
  try {
    const pool = dbConn.tb_pool;

    // Start transaction
    await pool.query('START TRANSACTION');

    try {
      // Create certificate
      const certificateId = uuidv4();
      const certificateData = {
        id: certificateId,
        product_id: data.product_id,
        name: data.name,
        description: data.description || null,
      };

      await CrudOperations.performCrud({
        operation: 'create',
        tableName: CERTIFICATES_TABLE,
        data: certificateData,
        connection: pool,
      });

      // Add certificate files if provided
      if (data.files && data.files.length > 0) {
        await CertificateFiles.upsertProductCertificateFiles(certificateId, data.files);
      }

      // Commit transaction
      await pool.query('COMMIT');

      // Get the created certificate with files
      const certificate = await getProductCertificateById(certificateId, true);

      return certificate;
    } catch (error) {
      // Rollback transaction on error
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    throw new AppError(
      `Failed to create product certificate: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Gets a product certificate by ID
 * @param {string} id - The certificate ID
 * @param {boolean} [includeFiles=false] - Whether to include certificate files
 * @returns {Promise<Object>} Promise that resolves with the certificate data
 */
export const getProductCertificateById = async (id, includeFiles = false) => {
  try {
    const pool = dbConn.tb_pool;

    // Get the certificate
    const result = await CrudOperations.performCrud({
      operation: 'read',
      tableName: CERTIFICATES_TABLE,
      id: id,
      connection: pool,
    });

    if (!result.record) {
      throw new AppError('Certificate not found', 404);
    }

    const certificate = result.record;

    // Include certificate files if requested
    if (includeFiles) {
      certificate.files = await CertificateFiles.getProductCertificateFilesByCertificateId(id);
    }

    return certificate;
  } catch (error) {
    throw new AppError(
      `Failed to get product certificate: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Updates a product certificate
 * @param {string} id - The certificate ID
 * @param {Object} data - The certificate data to update
 * @param {string} [data.name] - The updated certificate name
 * @param {string} [data.description] - The updated certificate description
 * @param {Array<{file_url: string, file_name: string}>} [data.files] - Updated array of certificate files
 * @returns {Promise<Object>} Promise that resolves with the updated certificate
 */
export const updateProductCertificate = async (id, data) => {
  try {
    const pool = dbConn.tb_pool;

    // Check if certificate exists
    await getProductCertificateById(id);

    // Start transaction
    await pool.query('START TRANSACTION');

    try {
      // Update certificate data if provided
      if (data.name !== undefined || data.description !== undefined) {
        const updateData = {};

        if (data.name !== undefined) {
          updateData.name = data.name;
        }

        if (data.description !== undefined) {
          updateData.description = data.description;
        }

        await CrudOperations.performCrud({
          operation: 'update',
          tableName: CERTIFICATES_TABLE,
          id: id,
          data: updateData,
          connection: pool,
        });
      }

      // Update certificate files if provided
      if (data.files !== undefined) {
        await CertificateFiles.upsertProductCertificateFiles(id, data.files);
      }

      // Commit transaction
      await pool.query('COMMIT');

      // Get the updated certificate with files
      const certificate = await getProductCertificateById(id, true);

      return certificate;
    } catch (error) {
      // Rollback transaction on error
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    throw new AppError(
      `Failed to update product certificate: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Deletes a product certificate
 * @param {string} id - The certificate ID
 * @returns {Promise<Object>} Promise that resolves with deletion result
 */
export const deleteProductCertificate = async (id) => {
  try {
    const pool = dbConn.tb_pool;

    // Check if certificate exists
    await getProductCertificateById(id);

    // Delete the certificate (cascade will delete all related files)
    await CrudOperations.performCrud({
      operation: 'delete',
      tableName: CERTIFICATES_TABLE,
      id: id,
      connection: pool,
    });

    return {
      message: 'Certificate deleted successfully',
      certificateId: id,
    };
  } catch (error) {
    throw new AppError(
      `Failed to delete product certificate: ${error.message}`,
      error.statusCode || 500
    );
  }
};