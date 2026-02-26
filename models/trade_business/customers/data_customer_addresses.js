import { TABLE_MASTER } from '../../tables.js';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import { tradeBusinessDbc } from '../../dbModel.js';
import { v4 as uuidv4 } from 'uuid';

export const customerAddressModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['CUSTOMER_ADDRESSES'].name,
  tableFields: TABLE_MASTER['CUSTOMER_ADDRESSES'].fields,
  entityName: 'customer address',
  entityIdField: 'id',
  requiredFields: ['customer_id', 'address_type_id', 'address_line1'],
  validations: {
    customer_id: { required: true },
    address_type_id: { required: true },
    address_line1: { required: true },
  },
  defaults: {
    id: uuidv4,
  },
});
