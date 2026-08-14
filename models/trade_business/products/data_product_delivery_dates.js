import { v4 as uuidv4 } from 'uuid';
import { TABLE_MASTER } from '../../tables.js';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import { tradeBusinessDbc } from '../../dbModel.js';

// Create a data model utility for product delivery dates
export const productDeliveryDatesModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['PRODUCT_DELIVERY_DATES'].name,
  tableFields: TABLE_MASTER['PRODUCT_DELIVERY_DATES'].fields,
  entityName: 'product delivery date',
  entityIdField: 'id',
  requiredFields: ['product_id', 'min_order_qty', 'delivery_day'],
  validations: {
    product_id: { required: true },
    min_order_qty: { required: true },
    delivery_day: { required: true },
  },
  defaults: {
    id: uuidv4,
  },
});
