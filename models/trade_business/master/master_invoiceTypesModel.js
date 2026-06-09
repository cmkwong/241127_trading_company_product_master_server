import DataModelUtils from '../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../tables.js';
import { tradeBusinessDbc } from '../../dbModel.js';

export const invoiceTypeModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['MASTER_INVOICE_TYPES'].name,
  tableFields: TABLE_MASTER['MASTER_INVOICE_TYPES'].fields,
  entityName: 'invoice_type',
  requiredFields: ['code'],
  validations: {
    code: { required: true },
  },
});
