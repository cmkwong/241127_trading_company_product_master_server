import { v4 as uuidv4 } from 'uuid';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../tables.js';
import { tradeBusinessDbc } from '../../dbModel.js';

export const salesShippingPriceInternalFileModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['SALES_SHIPPING_PRICE_INTERNAL_FILES'].name,
  tableFields: TABLE_MASTER['SALES_SHIPPING_PRICE_INTERNAL_FILES'].fields,
  entityName: 'sales shipping price internal file',
  entityIdField: 'id',
  requiredFields: ['sales_shipping_price_id', 'file_url', 'file_name'],
  defaults: { id: uuidv4 },
  fileConfig: {
    fileUrlField: 'file_url',
    uploadDir: 'public/quotations/{id}/shipping_prices/internal/',
    imagesOnly: false,
  },
});
