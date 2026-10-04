import { v4 as uuidv4 } from 'uuid';
import DataModelUtils from '../../../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../../tables.js';
import { tradeBusinessDbc } from '../../../dbModel.js';

import * as UserCartItems from './data_user_cart_items.js';

export const userCartModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['USER_CARTS'].name,
  tableFields: TABLE_MASTER['USER_CARTS'].fields,
  entityName: 'user cart',
  entityIdField: 'id',
  requiredFields: ['user_id'],
  validations: {
    user_id: { required: true },
  },
  defaults: { id: uuidv4 },
  childTableConfig: [
    {
      tableName: TABLE_MASTER['USER_CART_ITEMS'].name,
      model: UserCartItems.userCartItemModel,
    },
  ],
});