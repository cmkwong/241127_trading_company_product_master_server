import { v4 as uuidv4 } from 'uuid';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../tables.js';
import { tradeBusinessDbc } from '../../dbModel.js';

export const salesShippingPriceModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['SALES_SHIPPING_PRICES'].name,
  tableFields: TABLE_MASTER['SALES_SHIPPING_PRICES'].fields,
  entityName: 'sales shipping price',
  entityIdField: 'id',
  requiredFields: ['sales_shipping_detail_id'],
  defaults: { id: uuidv4 },
});
