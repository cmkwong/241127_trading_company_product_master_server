import DataModelUtils from '../../../utils/dataModelUtils.js';
import { PRODUCT_TABLE_MASTER } from '../../tables.js';
import { tradeBusinessDbc } from '../../dbModel.js';

// Create DataModelUtils instance for product name types
export const productImagesTypeModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: PRODUCT_TABLE_MASTER['MASTER_PRODUCT_IMAGE_TYPES'].name,
  tableFields: PRODUCT_TABLE_MASTER['MASTER_PRODUCT_IMAGE_TYPES'].fields,
  entityName: 'product image type',
  requiredFields: ['name'],
  validations: {
    name: { required: true },
  },
});
