import { TABLE_MASTER } from '../../tables.js';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import { tradeBusinessDbc } from '../../dbModel.js';
import { v4 as uuidv4 } from 'uuid';

// Create a data model utility for product packing images
export const packingFilesModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['PRODUCT_PACKING_FILES'].name,
  tableFields: TABLE_MASTER['PRODUCT_PACKING_FILES'].fields,
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
    fileUrlField: 'file_url',
    uploadDir: 'public/products/{id}/packings/',
    imagesOnly: false,
  },
});
