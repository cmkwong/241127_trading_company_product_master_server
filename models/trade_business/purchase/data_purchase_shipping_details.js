import { v4 as uuidv4 } from 'uuid';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../tables.js';
import { tradeBusinessDbc } from '../../dbModel.js';
import * as PurchaseShippingImages from './data_purchase_shipping_images.js';

export const purchaseShippingDetailModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['PURCHASE_SHIPPING_DETAILS'].name,
  tableFields: TABLE_MASTER['PURCHASE_SHIPPING_DETAILS'].fields,
  entityName: 'purchase shipping detail',
  entityIdField: 'id',
  requiredFields: ['purchase_request_id'],
  defaults: { id: uuidv4 },
  childTableConfig: [
    {
      tableName: TABLE_MASTER['PURCHASE_SHIPPING_IMAGES'].name,
      model: PurchaseShippingImages.purchaseShippingImageModel,
    },
  ],
});
