import { TABLE_MASTER } from '../../tables.js';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import { tradeBusinessDbc } from '../../dbModel.js';
import { v4 as uuidv4 } from 'uuid';

// Create a data model utility for product link images with file handling
export const productLinkImageModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['PRODUCT_LINK_IMAGES'].name,
  tableFields: TABLE_MASTER['PRODUCT_LINK_IMAGES'].fields,
  entityName: 'product link image',
  entityIdField: 'id',
  requiredFields: ['product_link_id'],
  validations: {
    product_link_id: { required: true },
  },
  defaults: {
    id: uuidv4,
  },
  fileConfig: {
    fileUrlField: 'image_url',
    uploadDir: 'public/products/{id}/product_links/',
    imagesOnly: true,
  },
});
