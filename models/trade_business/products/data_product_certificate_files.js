import { TABLE_MASTER } from '../../tables.js';
import DataModelUtils from '../../../utils/dataModelUtils.js';

// Create a data model utility for certificate files with file handling
const certificateFileModel = new DataModelUtils({
  tableName: TABLE_MASTER['PRODUCT_CERTIFICATE_FILES'].name,
  entityName: 'certificate file',
  entityIdField: 'certificate_id',
  requiredFields: ['certificate_id', 'file_type'],
  validations: {
    certificate_id: { required: true },
    file_type: { required: true },
  },
  fileConfig: {
    fileUrlField: 'file_url',
    uploadDir: 'public/uploads/certificates/{id}',
    fileTypeField: 'file_type',
    descriptionField: 'description',
    imagesOnly: false,
  },
});

// Export the standard CRUD operations
export const getCertificateFileById = (id) => certificateFileModel.getById(id);
export const getCertificateFilesByCertificateId = (
  certificateId,
  fileType = null
) =>
  fileType
    ? certificateFileModel
        .getAllByParentId(certificateId)
        .then((files) => files.filter((file) => file.file_type === fileType))
    : certificateFileModel.getAllByParentId(certificateId);

/**
 * Gets certificate files with base64 content by certificate ID, with optional compression
 * @param {string} certificateId - The certificate ID
 * @param {string} [fileType=null] - Optional file type filter
 * @param {Object} [options] - Optional compression options
 * @param {boolean} [options.compress=false] - Whether to compress images
 * @param {number} [options.maxWidth=800] - Maximum width for compressed images
 * @param {number} [options.maxHeight=800] - Maximum height for compressed images
 * @param {number} [options.quality=0.7] - JPEG quality (0-1) for compressed images
 * @returns {Promise<Array<Object>>} Promise that resolves with files including base64 content
 */
export const getCertificateFilesWithBase64ByCertificateId = (
  certificateId,
  fileType = null,
  options = {}
) =>
  certificateFileModel.getFilesWithBase64ByParentId(
    certificateId,
    fileType,
    options
  );

/**
 * Gets a certificate file with base64 content by ID, with optional compression
 * @param {string} id - The file ID
 * @param {Object} [options] - Optional compression options
 * @param {boolean} [options.compress=false] - Whether to compress images
 * @param {number} [options.maxWidth=800] - Maximum width for compressed images
 * @param {number} [options.maxHeight=800] - Maximum height for compressed images
 * @param {number} [options.quality=0.7] - JPEG quality (0-1) for compressed images
 * @returns {Promise<Object>} Promise that resolves with file including base64 content
 */
export const getCertificateFileWithBase64ById = (id, options = {}) =>
  certificateFileModel.getFileWithBase64ById(id, options);

export const deleteCertificateFile = (id) => certificateFileModel.delete(id);
export const deleteCertificateFilesByCertificateId = (certificateId) =>
  certificateFileModel.deleteAllByParentId(certificateId);

// Export file-specific operations
export const addCertificateFileFromBase64 = (data) =>
  certificateFileModel.addFileFromBase64(data);
export const updateCertificateFileWithBase64 = (id, data) =>
  certificateFileModel.updateFileWithBase64(id, data);
export const updateCertificateFilesFromBase64 = (
  certificateId,
  base64Files,
  fileType = null
) =>
  certificateFileModel.updateFilesFromBase64(
    certificateId,
    base64Files,
    fileType
  );
export const reorderCertificateFiles = (certificateId, orderData) =>
  certificateFileModel.reorderFiles(certificateId, orderData);
