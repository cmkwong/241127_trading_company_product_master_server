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
