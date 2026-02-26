import { TABLE_MASTER } from '../../tables.js';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import { tradeBusinessDbc } from '../../dbModel.js';
import { v4 as uuidv4 } from 'uuid';

export const customerContactModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['CUSTOMER_CONTACTS'].name,
  tableFields: TABLE_MASTER['CUSTOMER_CONTACTS'].fields,
  entityName: 'customer contact',
  entityIdField: 'id',
  requiredFields: ['customer_id', 'contact_type_id', 'contact_name'],
  validations: {
    customer_id: { required: true },
    contact_type_id: { required: true },
    contact_name: { required: true },
  },
  defaults: {
    id: uuidv4,
  },
});
