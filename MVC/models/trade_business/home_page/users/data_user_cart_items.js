import { v4 as uuidv4 } from 'uuid';
import DataModelUtils from '../../../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../../tables.js';
import { tradeBusinessDbc } from '../../../dbModel.js';

export const userCartItemModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['USER_CART_ITEMS'].name,
  tableFields: TABLE_MASTER['USER_CART_ITEMS'].fields,
  entityName: 'user cart item',
  entityIdField: 'id',
  requiredFields: ['cart_id', 'product_id', 'qty'],
  validations: {
    cart_id: { required: true },
    product_id: { required: true },
    qty: { required: true },
  },
  defaults: { id: uuidv4 },
});