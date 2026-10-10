import { v4 as uuidv4 } from 'uuid';
import DataModelUtils from '../../../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../../tables.js';
import { tradeBusinessDbc } from '../../../dbModel.js';

export const userPaymentMethodModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['USER_PAYMENT_METHODS'].name,
  tableFields: TABLE_MASTER['USER_PAYMENT_METHODS'].fields,
  entityName: 'user payment method',
  entityIdField: 'id',
  requiredFields: ['user_id', 'method_type'],
  validations: {
    user_id: { required: true },
    method_type: { required: true },
  },
  defaults: { id: uuidv4 },
});
