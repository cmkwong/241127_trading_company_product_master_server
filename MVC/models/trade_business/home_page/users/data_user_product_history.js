import { v4 as uuidv4 } from 'uuid';
import DataModelUtils from '../../../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../../tables.js';
import { tradeBusinessDbc } from '../../../dbModel.js';

export const userProductHistoryModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['USER_PRODUCT_HISTORY'].name,
  tableFields: TABLE_MASTER['USER_PRODUCT_HISTORY'].fields,
  entityName: 'user product history',
  entityIdField: 'id',
  requiredFields: ['user_id', 'product_id'],
  validations: {
    user_id: { required: true },
    product_id: { required: true },
  },
  defaults: { id: uuidv4 },
});