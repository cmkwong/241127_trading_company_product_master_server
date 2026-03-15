import { v4 as uuidv4 } from 'uuid';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../tables.js';
import { tradeBusinessDbc } from '../../dbModel.js';

export const salesShippingImageModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['SALES_SHIPPING_IMAGES'].name,
  tableFields: TABLE_MASTER['SALES_SHIPPING_IMAGES'].fields,
  entityName: 'sales shipping image',
  entityIdField: 'id',
  requiredFields: ['sales_shipping_detail_id', 'image_url', 'image_name'],
  defaults: { id: uuidv4 },
});
