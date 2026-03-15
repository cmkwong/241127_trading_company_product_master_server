import { v4 as uuidv4 } from 'uuid';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../tables.js';
import { tradeBusinessDbc } from '../../dbModel.js';
import * as PurchaseShippingDetails from './data_purchase_shipping_details.js';
import * as PurchaseProductDetails from './data_purchase_product_details.js';
import * as PurchaseServiceDetails from './data_purchase_service_details.js';

export const purchaseRequestModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['PURCHASE_REQUESTS'].name,
  tableFields: TABLE_MASTER['PURCHASE_REQUESTS'].fields,
  entityName: 'purchase request',
  entityIdField: 'id',
  requiredFields: ['supplier_id'],
  defaults: { id: uuidv4 },
  childTableConfig: [
    {
      tableName: TABLE_MASTER['PURCHASE_SHIPPING_DETAILS'].name,
      model: PurchaseShippingDetails.purchaseShippingDetailModel,
    },
    {
      tableName: TABLE_MASTER['PURCHASE_PRODUCT_DETAILS'].name,
      model: PurchaseProductDetails.purchaseProductDetailModel,
    },
    {
      tableName: TABLE_MASTER['PURCHASE_SERVICE_DETAILS'].name,
      model: PurchaseServiceDetails.purchaseServiceDetailModel,
    },
  ],
});
