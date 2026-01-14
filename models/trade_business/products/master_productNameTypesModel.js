import DataModelUtils from '../../../utils/dataModelUtils.js';
import AppError from '../../../utils/appError.js';
import { PRODUCT_TABLE_MASTER } from '../../tables.js';
import { tradeBusinessDbc } from '../../dbModel.js';

// Create DataModelUtils instance for product name types
export const productNameTypeModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: PRODUCT_TABLE_MASTER['MASTER_PRODUCT_NAME_TYPES'].name,
  tableFields: PRODUCT_TABLE_MASTER['MASTER_PRODUCT_NAME_TYPES'].fields,
  entityName: 'product name type',
  requiredFields: ['name'],
  validations: {
    name: { required: true },
  },
});
