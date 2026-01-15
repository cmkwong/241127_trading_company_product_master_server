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
  fileConfig: {
    fileUrlField: 'image_url',
    uploadDir: 'public/{id}/products/{image_type}/',
    uploadDir_mapping: {
      id: {
        tableName: 'products',
        field: 'id',
        linkField: 'product_id', // FK in product_images that links to products.id
      },
      image_type: {
        tableName: 'product_images',
        field: 'image_type_id',
        joinConfig: {
          joinTable: 'master_product_image_types',
          joinField: 'id',
          selectFields: 'master_product_image_types.name',
        },
      },
    },
    imagesOnly: true,
  },
});
