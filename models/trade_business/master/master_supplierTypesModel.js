import DataModelUtils from '../../../utils/dataModelUtils.js';
import AppError from '../../../utils/appError.js';
import { PRODUCT_TABLE_MASTER } from '../../tables.js';
import { tradeBusinessDbc } from '../../dbModel.js';

// Create DataModelUtils instance for supplier types
export const supplierTypeModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: PRODUCT_TABLE_MASTER['MASTER_SUPPLIER_TYPES'].name,
  tableFields: PRODUCT_TABLE_MASTER['MASTER_SUPPLIER_TYPES'].fields,
  entityName: 'supplier type',
  requiredFields: ['name'],
  validations: {
    name: { required: true },
  },
});
