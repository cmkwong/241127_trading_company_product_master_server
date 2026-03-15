import { v4 as uuidv4 } from 'uuid';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../tables.js';
import { tradeBusinessDbc } from '../../dbModel.js';
import * as SalesShippingPrices from './data_sales_shipping_prices.js';
import * as SalesShippingImages from './data_sales_shipping_images.js';

export const salesShippingDetailModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['SALES_SHIPPING_DETAILS'].name,
  tableFields: TABLE_MASTER['SALES_SHIPPING_DETAILS'].fields,
  entityName: 'sales shipping detail',
  entityIdField: 'id',
  requiredFields: ['sales_quotation_id'],
  defaults: { id: uuidv4 },
  childTableConfig: [
    {
      tableName: TABLE_MASTER['SALES_SHIPPING_PRICES'].name,
      model: SalesShippingPrices.salesShippingPriceModel,
    },
    {
      tableName: TABLE_MASTER['SALES_SHIPPING_IMAGES'].name,
      model: SalesShippingImages.salesShippingImageModel,
    },
  ],
});
