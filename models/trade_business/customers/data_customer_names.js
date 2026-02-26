import { TABLE_MASTER } from '../../tables.js';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import { tradeBusinessDbc } from '../../dbModel.js';
import { v4 as uuidv4 } from 'uuid';

export const customerNameModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['CUSTOMER_NAMES'].name,
  tableFields: TABLE_MASTER['CUSTOMER_NAMES'].fields,
  entityName: 'customer name',
  entityIdField: 'id',
  requiredFields: ['customer_id', 'name_type_id', 'name'],
  validations: {
    customer_id: { required: true },
    name_type_id: { required: true },
    name: { required: true },
  },
  defaults: {
    id: uuidv4,
  },
});
