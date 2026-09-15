import DataModelUtils from '../../../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../../tables.js';
import { tradeBusinessDbc } from '../../../dbModel.js';

// Create DataModelUtils instance for document types
export const doctypeModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['MASTER_DOCTYPE'].name,
  tableFields: TABLE_MASTER['MASTER_DOCTYPE'].fields,
  entityName: 'doctype',
  requiredFields: ['name'],
  validations: {
    name: { required: true },
  },
});
