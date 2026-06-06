import DataModelUtils from '../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../tables.js';
import { tradeBusinessDbc } from '../../dbModel.js';

export const exchangeRateHkdModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['MASTER_EXCHANGE_RATE_HKD'].name,
  tableFields: TABLE_MASTER['MASTER_EXCHANGE_RATE_HKD'].fields,
  entityName: 'exchange_rate_hkd',
  requiredFields: ['HKD', 'USD', 'CNY', 'EUR', 'GBP', 'Date'],
  validations: {
    HKD: { required: true },
    USD: { required: true },
    CNY: { required: true },
    EUR: { required: true },
    GBP: { required: true },
    Date: { required: true },
  },
});
