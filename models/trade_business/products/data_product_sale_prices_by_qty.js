import { v4 as uuidv4 } from 'uuid';
import { TABLE_MASTER } from '../../tables.js';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import { tradeBusinessDbc } from '../../dbModel.js';

// Create a data model utility for product sale prices by quantity
export const productSalePricesByQtyModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['PRODUCT_SALE_PRICES_BY_QTY'].name,
  tableFields: TABLE_MASTER['PRODUCT_SALE_PRICES_BY_QTY'].fields,
  entityName: 'product sale price by quantity',
  entityIdField: 'id',
  requiredFields: ['product_id', 'min_order_qty', 'currency_id', 'sale_price'],
  validations: {
    product_id: { required: true },
    min_order_qty: { required: true },
    currency_id: { required: true },
    sale_price: { required: true },
  },
  defaults: {
    id: uuidv4,
  },
});
