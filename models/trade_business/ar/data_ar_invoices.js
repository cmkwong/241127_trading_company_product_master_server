import { v4 as uuidv4 } from 'uuid';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../tables.js';
import { tradeBusinessDbc } from '../../dbModel.js';
import * as AriShippingDetails from './data_ari_shipping_details.js';
import * as AriProductDetails from './data_ari_product_details.js';
import * as AriServiceDetails from './data_ari_service_details.js';

export const arInvoiceModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['AR_INVOICES'].name,
  tableFields: TABLE_MASTER['AR_INVOICES'].fields,
  entityName: 'ar invoice',
  entityIdField: 'id',
  requiredFields: ['customer_id'],
  defaults: { id: uuidv4 },
  childTableConfig: [
    {
      tableName: TABLE_MASTER['ARI_SHIPPING_DETAILS'].name,
      model: AriShippingDetails.ariShippingDetailModel,
    },
    {
      tableName: TABLE_MASTER['ARI_PRODUCT_DETAILS'].name,
      model: AriProductDetails.ariProductDetailModel,
    },
    {
      tableName: TABLE_MASTER['ARI_SERVICE_DETAILS'].name,
      model: AriServiceDetails.ariServiceDetailModel,
    },
  ],
});
