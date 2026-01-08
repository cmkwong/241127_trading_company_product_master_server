import { PRODUCT_TABLE_MASTER } from '../../tables.js';
import { v4 as uuidv4 } from 'uuid';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import { tradeBusinessDbc } from '../../dbModel.js';

// Create a data model utility for product categories with multiple joins
export const productImagesModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: PRODUCT_TABLE_MASTER['PRODUCT_IMAGES'].name,
  tableFields: PRODUCT_TABLE_MASTER['PRODUCT_IMAGES'].fields,
  entityName: 'product images',
  entityIdField: 'id',
  requiredFields: ['product_id', 'image_type_id'],
  validations: {
    category_id: { required: true },
    bulk_id: { required: false },
  },
  defaults: {
    id: uuidv4,
  },
  joinConfig: [
    {
      joinTable: 'master_product_image_types',
      joinField: 'image_type_id',
      targetField: 'id', // Optional, defaults to 'id'
      selectFields:
        'master_product_image_types.name as product_image_type_name, master_product_image_types.description as type_description, master_product_image_types.parent_id', // TODO - change into object for easily debug OR just select all fields
      orderBy: 'master_product_image_types.name',
    },
  ],
});
