import DataModelUtils from '../../../utils/dataModelUtils.js';
import AppError from '../../../utils/appError.js';
import { PRODUCT_TABLE_MASTER } from '../../tables.js';
import { tradeBusinessDbc } from '../../dbModel.js';

// Create DataModelUtils instance for product keywords
export const masterKeywordModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: PRODUCT_TABLE_MASTER['MASTER_KEYWORDS'].name,
  tableFields: PRODUCT_TABLE_MASTER['MASTER_KEYWORDS'].fields,
  entityName: 'product keyword',
  requiredFields: ['name'],
  validations: {
    name: { required: true },
  },
});
