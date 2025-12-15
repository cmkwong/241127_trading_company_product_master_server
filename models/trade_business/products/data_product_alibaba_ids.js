import { TABLE_MASTER } from '../../tables.js';
import DataModelUtils from '../../../utils/dataModelUtils.js';

// Create a data model utility for product Alibaba IDs
export const alibabaIdModel = new DataModelUtils({
  tableName: TABLE_MASTER['PRODUCT_ALIBABA_IDS'].name,
  entityName: 'product Alibaba ID',
  entityIdField: 'product_id',
  requiredFields: ['product_id'],
  validations: {
    alibaba_id: { required: true },
  },
});

// Export the standard CRUD operations using the model
export const createProductAlibabaId = (data) => alibabaIdModel.create(data);
export const getProductAlibabaIdById = (id) => alibabaIdModel.getById(id);
export const getProductAlibabaIdsByProductId = (productId) =>
  alibabaIdModel.getAllByParentId(productId);
export const updateProductAlibabaId = (id, data) =>
  alibabaIdModel.update(id, data);
export const deleteProductAlibabaId = (id) => alibabaIdModel.delete(id);
export const deleteProductAlibabaIdsByProductId = (productId) =>
  alibabaIdModel.deleteAllByParentId(productId);
export const upsertProductAlibabaIds = (productId, alibabaIds) =>
  alibabaIdModel.upsertAll(productId, alibabaIds);
