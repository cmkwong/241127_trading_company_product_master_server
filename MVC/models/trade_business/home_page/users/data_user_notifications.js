import { v4 as uuidv4 } from 'uuid';
import DataModelUtils from '../../../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../../tables.js';
import { tradeBusinessDbc } from '../../../dbModel.js';

export const userNotificationModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['USER_NOTIFICATIONS'].name,
  tableFields: TABLE_MASTER['USER_NOTIFICATIONS'].fields,
  entityName: 'user notification',
  entityIdField: 'id',
  requiredFields: ['user_id'],
  validations: {
    user_id: { required: true },
  },
  defaults: { id: uuidv4 },
});