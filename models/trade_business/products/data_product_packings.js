import { TABLE_MASTER } from '../../tables.js';
import DataModelUtils from '../../../utils/dataModelUtils.js';

// Create a data model utility for product packings
export const packingModel = new DataModelUtils({
  tableName: TABLE_MASTER['PRODUCT_PACKINGS'].name,
  tableFields: TABLE_MASTER['PRODUCT_PACKINGS'].fields,
  entityName: 'product packing',
  entityIdField: 'product_id',
  requiredFields: [
    'product_id',
    'packing_type_id',
    'length',
    'width',
    'height',
    'weight',
  ],
  validations: {
    length: { min: 0, required: true },
    width: { min: 0, required: true },
    height: { min: 0, required: true },
    weight: { min: 0, required: true },
    packing_type_id: { required: true },
  },
  defaults: {
    quantity: 1,
  },
  joinConfig: [
    {
      joinTable: 'master_packing_types',
      joinField: 'packing_type_id',
      selectFields:
        'master_packing_types.name as packing_type_name, master_packing_types.description as packing_type_description',
      orderBy: 'packing_type_id',
    },
  ],
});

// Export the standard CRUD operations using the model
export const createProductPacking = (data) => packingModel.create(data);
export const getProductPackingById = (id) => packingModel.getById(id);
export const getProductPackingsByProductId = (productId) =>
  packingModel.getAllByParentId(productId);
export const updateProductPacking = (id, data) => packingModel.update(id, data);
export const deleteProductPacking = (id) => packingModel.delete(id);
export const deleteProductPackingsByProductId = (productId) =>
  packingModel.deleteAllByParentId(productId);
export const upsertProductPackings = (productId, packings) =>
  packingModel.upsertAll(productId, packings);
