import { v4 as uuidv4 } from 'uuid';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../tables.js';
import { tradeBusinessDbc } from '../../dbModel.js';
import * as SalesShippingPriceImages from './data_sales_shipping_price_images.js';
import * as SalesShippingPriceInternalImages from './data_sales_shipping_price_internal_images.js';

export const salesShippingPriceModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['SALES_SHIPPING_PRICES'].name,
  tableFields: TABLE_MASTER['SALES_SHIPPING_PRICES'].fields,
  entityName: 'sales shipping price',
  entityIdField: 'id',
  requiredFields: ['sales_shipping_detail_id'],
  defaults: { id: uuidv4 },
  childTableConfig: [
    {
      tableName: TABLE_MASTER['SALES_SHIPPING_PRICE_IMAGES'].name,
      model: SalesShippingPriceImages.salesShippingPriceImageModel,
    },
    {
      tableName: TABLE_MASTER['SALES_SHIPPING_PRICE_INTERNAL_IMAGES'].name,
      model:
        SalesShippingPriceInternalImages.salesShippingPriceInternalImageModel,
    },
  ],
});
