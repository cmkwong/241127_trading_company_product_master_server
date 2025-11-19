import { TABLE_MASTER } from '../../tables.js';
import DataModelUtils from '../../../utils/dataModelUtils.js';

// Create a data model utility for customization images with file handling
const customizationImageModel = new DataModelUtils({
  tableName: TABLE_MASTER['PRODUCT_CUSTOMIZATION_IMAGES'].name,
  entityName: 'customization image',
  entityIdField: 'customization_id',
  requiredFields: ['customization_id'],
  validations: {
    customization_id: { required: true },
  },
  fileConfig: {
    fileUrlField: 'image_url',
    uploadDir: 'public/uploads/customizations/{id}',
    imagesOnly: true,
  },
});

// Export the standard CRUD operations
export const getCustomizationImageById = (id) =>
  customizationImageModel.getById(id);
export const getCustomizationImagesByCustomizationId = (customizationId) =>
  customizationImageModel.getAllByParentId(customizationId);
export const deleteCustomizationImage = (id) =>
  customizationImageModel.delete(id);
export const deleteCustomizationImagesByCustomizationId = (customizationId) =>
  customizationImageModel.deleteAllByParentId(customizationId);

// Export file-specific operations
export const addCustomizationImageFromBase64 = (data) =>
  customizationImageModel.addFileFromBase64(data);
export const updateCustomizationImageWithBase64 = (id, data) =>
  customizationImageModel.updateFileWithBase64(id, data);
export const updateCustomizationImagesFromBase64 = (
  customizationId,
  base64Images
) =>
  customizationImageModel.updateFilesFromBase64(customizationId, base64Images);
export const reorderCustomizationImages = (customizationId, orderData) =>
  customizationImageModel.reorderFiles(customizationId, orderData);
