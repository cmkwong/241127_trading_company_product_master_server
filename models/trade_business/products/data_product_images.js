import { TABLE_MASTER } from '../../tables.js';
import { v4 as uuidv4 } from 'uuid';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import { tradeBusinessDbc } from '../../dbModel.js';

// Create a data model utility for product categories with multiple joins
export const productImagesModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['PRODUCT_IMAGES'].name,
  tableFields: TABLE_MASTER['PRODUCT_IMAGES'].fields,
  entityName: 'product images',
  entityIdField: 'id',
  requiredFields: ['product_id', 'image_url', 'image_type_id'],
  validations: {
    image_type_id: { required: true },
  },
  defaults: {
    id: uuidv4,
  },
  fileConfig: {
    fileUrlField: 'image_url',
    uploadDir: 'public/products/{id}/images/',
    imagesOnly: true,
  },
});
