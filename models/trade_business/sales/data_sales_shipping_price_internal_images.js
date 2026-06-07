import { v4 as uuidv4 } from 'uuid';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../tables.js';
import { tradeBusinessDbc } from '../../dbModel.js';

export const salesShippingPriceInternalImageModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['SALES_SHIPPING_PRICE_INTERNAL_IMAGES'].name,
  tableFields: TABLE_MASTER['SALES_SHIPPING_PRICE_INTERNAL_IMAGES'].fields,
  entityName: 'sales shipping price internal image',
  entityIdField: 'id',
  requiredFields: ['sales_shipping_price_id', 'image_url', 'image_name'],
  defaults: { id: uuidv4 },
  fileConfig: {
    fileUrlField: 'image_url',
    uploadDir: 'public/quotations/{id}/shipping_prices/internal/',
    imagesOnly: true,
  },
});
