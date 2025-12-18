import { v4 as uuidv4 } from 'uuid';
import { TABLE_MASTER } from '../../tables.js';
import DataModelUtils from '../../../utils/dataModelUtils.js';

// Create a data model utility for customization images with file handling
export const customizationImageModel = new DataModelUtils({
  tableName: TABLE_MASTER['PRODUCT_CUSTOMIZATION_IMAGES'].name,
  tableFields: TABLE_MASTER['PRODUCT_CUSTOMIZATION_IMAGES'].fields,
  entityName: 'customization image',
  entityIdField: 'customization_id',
  requiredFields: ['customization_id', 'image_url'],
  validations: {
    image_url: { required: true },
  },
  defaults: {
    id: uuidv4,
  },
  fileConfig: {
    fileUrlField: 'image_url',
    uploadDir: 'public/products/{id}/customizations/',
    imagesOnly: true,
  },
});

// Export the standard CRUD operations
export const getCustomizationImageById = (id) =>
  customizationImageModel.getById(id);
export const getCustomizationImagesByCustomizationId = (
  customizationId,
  fileType = null
) => customizationImageModel.getAllByParentId(customizationId);
export const deleteCustomizationImage = (id) =>
  customizationImageModel.delete(id);
export const deleteCustomizationImagesByCustomizationId = (customizationId) =>
  customizationImageModel.deleteAllByParentId(customizationId);
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

/**
 * Gets customization images with base64 content by customization ID
 * @param {string} customizationId - The customization ID
 * @param {Object} [options] - Optional compression options
 * @param {boolean} [options.compress=false] - Whether to compress images
 * @param {number} [options.maxWidth=800] - Maximum width for compressed images
 * @param {number} [options.maxHeight=800] - Maximum height for compressed images
 * @param {number} [options.quality=0.7] - JPEG quality (0-1) for compressed images
 * @returns {Promise<Array<Object>>} Promise that resolves with images including base64 content
 */
export const getCustomizationImagesWithBase64ByCustomizationId = (
  customizationId,
  options = {}
) =>
  customizationImageModel.getFilesWithBase64ByParentId(
    customizationId,
    null,
    options
  );

/**
 * Gets a customization image with base64 content by ID
 * @param {string} id - The image ID
 * @param {Object} [options] - Optional compression options
 * @param {boolean} [options.compress=false] - Whether to compress images
 * @param {number} [options.maxWidth=800] - Maximum width for compressed images
 * @param {number} [options.maxHeight=800] - Maximum height for compressed images
 * @param {number} [options.quality=0.7] - JPEG quality (0-1) for compressed images
 * @returns {Promise<Object>} Promise that resolves with image including base64 content
 */
export const getCustomizationImageWithBase64ById = (id, options = {}) =>
  customizationImageModel.getFileWithBase64ById(id, options);

/**
 * Upserts (updates or inserts) customization images
 * @param {string} customizationId - The customization ID
 * @param {Array<string>} images - Array of image URLs
 * @returns {Promise<Array<Object>>} Promise that resolves with the upserted images
 */
export const upsertCustomizationImages = (customizationId, images) =>
  customizationImageModel.upsertAll(customizationId, images);
