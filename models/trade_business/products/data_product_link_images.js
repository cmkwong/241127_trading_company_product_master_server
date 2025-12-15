import { TABLE_MASTER } from '../../tables.js';
import DataModelUtils from '../../../utils/dataModelUtils.js';

// Create a data model utility for product link images with file handling
export const productLinkImageModel = new DataModelUtils({
  tableName: TABLE_MASTER['PRODUCT_LINK_IMAGES'].name,
  entityName: 'product link image',
  entityIdField: 'product_link_id',
  requiredFields: ['product_link_id'],
  validations: {
    product_link_id: { required: true },
  },
  fileConfig: {
    fileUrlField: 'image_url',
    uploadDir: 'public/uploads/product_links/{id}',
    imagesOnly: true,
  },
});

// Export standard CRUD operations
export const getProductLinkImageById = (id) =>
  productLinkImageModel.getById(id);
export const getProductLinkImagesByLinkId = (productLinkId) =>
  productLinkImageModel.getAllByParentId(productLinkId);
export const deleteProductLinkImage = (id) => productLinkImageModel.delete(id);
export const deleteProductLinkImagesByLinkId = (productLinkId) =>
  productLinkImageModel.deleteAllByParentId(productLinkId);

// Export file-specific operations
export const addProductLinkImage = (data) => productLinkImageModel.create(data);
export const addProductLinkImageFromBase64 = (data) =>
  productLinkImageModel.addFileFromBase64(data);
export const updateProductLinkImage = (id, data) =>
  productLinkImageModel.update(id, data);
export const updateProductLinkImageWithBase64 = (id, data) =>
  productLinkImageModel.updateFileWithBase64(id, data);
export const updateProductLinkImagesFromBase64 = (
  productLinkId,
  base64Images
) => productLinkImageModel.updateFilesFromBase64(productLinkId, base64Images);
export const reorderProductLinkImages = (productLinkId, orderData) =>
  productLinkImageModel.reorderFiles(productLinkId, orderData);

/**
 * Gets product link images with base64 content by link ID
 * @param {string} productLinkId - The product link ID
 * @param {Object} [options] - Optional compression options
 * @param {boolean} [options.compress=false] - Whether to compress images
 * @param {number} [options.maxWidth=800] - Maximum width for compressed images
 * @param {number} [options.maxHeight=800] - Maximum height for compressed images
 * @param {number} [options.quality=0.7] - JPEG quality (0-1) for compressed images
 * @returns {Promise<Array<Object>>} Promise that resolves with images including base64 content
 */
export const getProductLinkImagesWithBase64ByLinkId = (
  productLinkId,
  options = {}
) =>
  productLinkImageModel.getFilesWithBase64ByParentId(
    productLinkId,
    null,
    options
  );

/**
 * Gets a product link image with base64 content by ID
 * @param {string} id - The image ID
 * @param {Object} [options] - Optional compression options
 * @param {boolean} [options.compress=false] - Whether to compress images
 * @param {number} [options.maxWidth=800] - Maximum width for compressed images
 * @param {number} [options.maxHeight=800] - Maximum height for compressed images
 * @param {number} [options.quality=0.7] - JPEG quality (0-1) for compressed images
 * @returns {Promise<Object>} Promise that resolves with image including base64 content
 */
export const getProductLinkImageWithBase64ById = (id, options = {}) =>
  productLinkImageModel.getFileWithBase64ById(id, options);

/**
 * Upserts (updates or inserts) product link images
 * @param {string} productLinkId - The product link ID
 * @param {Array<string>} images - Array of image URLs
 * @returns {Promise<Array<Object>>} Promise that resolves with the upserted images
 */
export const upsertProductLinkImages = (productLinkId, images) =>
  productLinkImageModel.upsertAll(productLinkId, images);
