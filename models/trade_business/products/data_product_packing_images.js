import { PRODUCT_TABLE_MASTER } from '../../tables.js';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import { tradeBusinessDbc } from '../../dbModel.js';
import { v4 as uuidv4 } from 'uuid';

// Create a data model utility for product packing images
export const packingImagesModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: PRODUCT_TABLE_MASTER['PRODUCT_PACKING_IMAGES'].name,
  tableFields: PRODUCT_TABLE_MASTER['PRODUCT_PACKING_IMAGES'].fields,
  entityName: 'product packing image',
  entityIdField: 'id',
  requiredFields: ['packing_id'],
  validations: {
    packing_id: { required: true },
  },
  defaults: {
    id: uuidv4,
  },
  fileConfig: {
    fileUrlField: 'image_url',
    uploadDir: 'public/{id}/packings/',
    imagesOnly: true,
  },
});
