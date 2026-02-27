import DataModelUtils from '../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../tables.js';
import { tradeBusinessDbc } from '../../dbModel.js';

// Create DataModelUtils instance for currencies
export const currencyModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['MASTER_CURRENCIES'].name,
  tableFields: TABLE_MASTER['MASTER_CURRENCIES'].fields,
  entityName: 'currency',
  requiredFields: ['code', 'name'],
  validations: {
    code: { required: true },
    name: { required: true },
  },
});
