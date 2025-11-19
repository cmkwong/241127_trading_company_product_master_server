import { TABLE_MASTER } from '../../tables.js';
import DataModelUtils from '../../../utils/dataModelUtils.js';

// Create a data model utility for product link images with file handling
const productLinkImageModel = new DataModelUtils({
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
