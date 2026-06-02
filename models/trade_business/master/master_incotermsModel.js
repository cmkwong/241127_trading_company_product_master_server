import DataModelUtils from '../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../tables.js';
import { tradeBusinessDbc } from '../../dbModel.js';

export const incotermModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['MASTER_INCOTERMS'].name,
  tableFields: TABLE_MASTER['MASTER_INCOTERMS'].fields,
  entityName: 'incoterm',
  requiredFields: ['code', 'name'],
  validations: {
    code: { required: true },
    name: { required: true },
  },
});
