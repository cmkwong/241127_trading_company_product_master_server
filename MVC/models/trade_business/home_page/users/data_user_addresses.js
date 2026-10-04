import { v4 as uuidv4 } from 'uuid';
import DataModelUtils from '../../../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../../tables.js';
import { tradeBusinessDbc } from '../../../dbModel.js';

export const userAddressModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['USER_ADDRESSES'].name,
  tableFields: TABLE_MASTER['USER_ADDRESSES'].fields,
  entityName: 'user address',
  entityIdField: 'id',
  requiredFields: ['user_id', 'recipient_name', 'address_line_1'],
  validations: {
    user_id: { required: true },
    recipient_name: { required: true },
    address_line_1: { required: true },
  },
  defaults: { id: uuidv4 },
});