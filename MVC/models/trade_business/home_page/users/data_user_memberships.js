import { v4 as uuidv4 } from 'uuid';
import DataModelUtils from '../../../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../../tables.js';
import { tradeBusinessDbc } from '../../../dbModel.js';

export const userMembershipModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['USER_MEMBERSHIPS'].name,
  tableFields: TABLE_MASTER['USER_MEMBERSHIPS'].fields,
  entityName: 'user membership',
  entityIdField: 'id',
  requiredFields: ['user_id', 'tier_id'],
  validations: {
    user_id: { required: true },
    tier_id: { required: true },
  },
  defaults: { id: uuidv4 },
});