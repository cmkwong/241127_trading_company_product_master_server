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
  requiredFields: ['product_id', 'certificate_type_id'],
  validations: {
    name: { required: true },
    description: { required: false },
  },
});

/**
 * Gets product certificates by product ID
 * @param {string} productId - The product ID
 * @param {boolean} [includeFiles=false] - Whether to include certificate files
 * @param {boolean} [includeBase64=false] - Whether to include base64 file content
 * @returns {Promise<Array<Object>>} Promise that resolves with the product certificates
 */
export const getProductCertificatesByProductId = async (
  productId,
  includeFiles = false,
  includeBase64 = false
) => {
  try {
    // Get certificates using the model
    const certificates = await certificateModel.getAllByParentId(productId);

    // Include certificate files if requested
    if (includeFiles && certificates.length > 0) {
      for (const certificate of certificates) {
        if (includeBase64) {
          certificate.files =
            await CertificateFiles.getCertificateFilesWithBase64ByCertificateId(
              certificate.id
            );
        } else {
          certificate.files =
            await CertificateFiles.getCertificateFilesByCertificateId(
              certificate.id
            );
        }
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

    return await certificateModel.withTransaction(async () => {
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

      // Get the updated certificate with files
      const certificate = await getProductCertificateById(id, true);

      return certificate;
    });
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

    return await certificateModel.withTransaction(async () => {
      // Delete certificate files first
      await CertificateFiles.deleteCertificateFilesByCertificateId(id);

      // Then delete the certificate
      await certificateModel.delete(id);

      return {
        message: 'Certificate and its files deleted successfully',
        certificateId: id,
      };
    });
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
    // Get all certificates for this product
    const certificates = await getProductCertificatesByProductId(productId);

    if (certificates.length === 0) {
      return {
        message: 'No certificates found for this product',
        count: 0,
      };
    }

    return await certificateModel.withTransaction(async () => {
      // For each certificate, delete its files first
      for (const certificate of certificates) {
        await CertificateFiles.deleteCertificateFilesByCertificateId(
          certificate.id
        );
      }

      // Then delete all certificates
      const result = await certificateModel.deleteAllByParentId(productId);

      return {
        message: 'Product certificates and their files deleted successfully',
        count: certificates.length,
      };
    });
  } catch (error) {
    throw new AppError(
      `Failed to delete product certificates: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Updates or creates certificates for a product (upsert operation)
 * @param {string} productId - The product ID
 * @param {Array<Object>} certificates - Array of certificate objects
 * @returns {Promise<Object>} Promise that resolves with upsert result
 */
export const upsertProductCertificates = async (productId, certificates) => {
  try {
    return await certificateModel.withTransaction(async () => {
      // Get existing certificates
      const existingCertificates = await getProductCertificatesByProductId(
        productId
      );

      // Delete all existing certificates and their files
      if (existingCertificates.length > 0) {
        for (const certificate of existingCertificates) {
          // Delete files first
          await CertificateFiles.deleteCertificateFilesByCertificateId(
            certificate.id
          );
        }
        // Delete certificates
        await certificateModel.deleteAllByParentId(productId);
      }

      // Create new certificates
      const createdCertificates = [];

      for (const certificateData of certificates) {
        // Ensure product_id is set
        certificateData.product_id = productId;

        // Extract files
        const files = certificateData.files || [];
        const dataToCreate = { ...certificateData };
        delete dataToCreate.files;

        // Generate ID if not provided
        if (!dataToCreate.id) {
          dataToCreate.id = uuidv4();
        }

        // Create certificate
        await certificateModel.create(dataToCreate);

        // Add files
        if (files.length > 0) {
          await CertificateFiles.upsertCertificateFiles(dataToCreate.id, files);
        }

        // Get complete certificate with files
        const certificate = await getProductCertificateById(
          dataToCreate.id,
          true
        );
        createdCertificates.push(certificate);
      }

      return {
        message: 'Product certificates updated successfully',
        deleted: existingCertificates.length,
        created: createdCertificates.length,
        productCertificates: createdCertificates,
      };
    });
  } catch (error) {
    throw new AppError(
      `Failed to update product certificates: ${error.message}`,
      error.statusCode || 500
    );
  }
};
