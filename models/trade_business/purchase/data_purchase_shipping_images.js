import { v4 as uuidv4 } from 'uuid';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../tables.js';
import { tradeBusinessDbc } from '../../dbModel.js';

export const purchaseShippingImageModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['PURCHASE_SHIPPING_IMAGES'].name,
  tableFields: TABLE_MASTER['PURCHASE_SHIPPING_IMAGES'].fields,
  entityName: 'purchase shipping image',
  entityIdField: 'id',
  requiredFields: ['purchase_shipping_detail_id', 'image_url', 'image_name'],
  defaults: { id: uuidv4 },
});
