import AppError from '../../../utils/appError.js';
import { v4 as uuidv4 } from 'uuid';
import { TABLE_MASTER } from '../../tables.js';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import * as CertificateFiles from './data_product_certificate_files.js';

// Create a data model utility for product certificates
const certificateModel = new DataModelUtils({
  tableName: TABLE_MASTER['PRODUCT_CERTIFICATES'].name,
  entityName: 'product certificate',
  entityIdField: 'product_id',
  requiredFields: ['product_id', 'name'],
  validations: {
    name: { required: true },
    description: { required: false },
  },
});

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
    // Get certificates using the model
    const certificates = await certificateModel.getAllByParentId(productId);
    // Include certificate files if requested
    if (includeFiles && certificates.length > 0) {
      for (const certificate of certificates) {
        certificate.files =
          await CertificateFiles.getCertificateFilesByCertificateId(
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
    // Start transaction
    await certificateModel.beginTransaction();
    try {
      // Generate ID if not provided
      const certificateId = data.id || uuidv4();

      // Create a copy of the data to avoid modifying the original
      const certificateData = { ...data, id: certificateId };

      // Extract files from the data as they're handled separately
      const files = certificateData.files;
      delete certificateData.files;

      // Create certificate
      await certificateModel.create(certificateData);
      // Add certificate files if provided
      if (files && files.length > 0) {
        await CertificateFiles.upsertCertificateFiles(certificateId, files);
      }

      // Commit transaction
      await certificateModel.commitTransaction();
      // Get the created certificate with files
      const certificate = await getProductCertificateById(certificateId, true);

      return certificate;
    } catch (error) {
      // Rollback transaction on error
      await certificateModel.rollbackTransaction();
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
    // Get the certificate using the model
    const certificate = await certificateModel.getById(id);
    // Include certificate files if requested
    if (includeFiles) {
      certificate.files =
        await CertificateFiles.getCertificateFilesByCertificateId(id);
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
    // Check if certificate exists
    await certificateModel.getById(id);

    // Start transaction
    await certificateModel.beginTransaction();
    try {
      // Create a copy of the data to avoid modifying the original
      const updateData = { ...data };

      // Extract files from the data as they're handled separately
      const files = updateData.files;
      delete updateData.files;

      // Only update if there are fields to update
      if (Object.keys(updateData).length > 0) {
        // Update certificate
        await certificateModel.update(id, updateData);
      }
      // Update certificate files if provided
      if (files !== undefined) {
        await CertificateFiles.upsertCertificateFiles(id, files);
      }

      // Commit transaction
      await certificateModel.commitTransaction();
      // Get the updated certificate with files
      const certificate = await getProductCertificateById(id, true);

      return certificate;
    } catch (error) {
      // Rollback transaction on error
      await certificateModel.rollbackTransaction();
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
    // Check if certificate exists
    await certificateModel.getById(id);

    // Delete the certificate (cascade will delete all related files)
    await certificateModel.delete(id);
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

/**
 * Deletes all certificates for a product
 * @param {string} productId - The product ID
 * @returns {Promise<Object>} Promise that resolves with deletion result
 */
export const deleteProductCertificatesByProductId = async (productId) => {
  try {
    return await certificateModel.deleteAllByParentId(productId);
  } catch (error) {
    throw new AppError(
      `Failed to delete product certificates: ${error.message}`,
      error.statusCode || 500
    );
  }
};
