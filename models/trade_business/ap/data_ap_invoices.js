import { v4 as uuidv4 } from 'uuid';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../tables.js';
import { tradeBusinessDbc } from '../../dbModel.js';
import * as ApiShippingDetails from './data_api_shipping_details.js';
import * as ApiProductDetails from './data_api_product_details.js';
import * as ApiServiceDetails from './data_api_service_details.js';

export const apInvoiceModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['AP_INVOICES'].name,
  tableFields: TABLE_MASTER['AP_INVOICES'].fields,
  entityName: 'ap invoice',
  entityIdField: 'id',
  requiredFields: ['supplier_id'],
  defaults: { id: uuidv4 },
  childTableConfig: [
    {
      tableName: TABLE_MASTER['API_SHIPPING_DETAILS'].name,
      model: ApiShippingDetails.apiShippingDetailModel,
    },
    {
      tableName: TABLE_MASTER['API_PRODUCT_DETAILS'].name,
      model: ApiProductDetails.apiProductDetailModel,
    },
    {
      tableName: TABLE_MASTER['API_SERVICE_DETAILS'].name,
      model: ApiServiceDetails.apiServiceDetailModel,
    },
  ],
});
