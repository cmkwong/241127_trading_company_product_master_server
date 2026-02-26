import { TABLE_MASTER } from '../../tables.js';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import { tradeBusinessDbc } from '../../dbModel.js';
import { v4 as uuidv4 } from 'uuid';

export const customerTypeModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['CUSTOMER_TYPES'].name,
  tableFields: TABLE_MASTER['CUSTOMER_TYPES'].fields,
  entityName: 'customer type',
  entityIdField: 'id',
  requiredFields: ['customer_id', 'customer_type_id'],
  validations: {
    customer_id: { required: true },
    customer_type_id: { required: true },
  },
  defaults: {
    id: uuidv4,
  },
});
