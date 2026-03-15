import { v4 as uuidv4 } from 'uuid';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../tables.js';
import { tradeBusinessDbc } from '../../dbModel.js';
import * as SalesShippingDetails from './data_sales_shipping_details.js';
import * as SalesProductDetails from './data_sales_product_details.js';
import * as SalesServiceDetails from './data_sales_service_details.js';

export const salesQuotationModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['SALES_QUOTATIONS'].name,
  tableFields: TABLE_MASTER['SALES_QUOTATIONS'].fields,
  entityName: 'sales quotation',
  entityIdField: 'id',
  requiredFields: ['customer_id'],
  defaults: { id: uuidv4 },
  childTableConfig: [
    {
      tableName: TABLE_MASTER['SALES_SHIPPING_DETAILS'].name,
      model: SalesShippingDetails.salesShippingDetailModel,
    },
    {
      tableName: TABLE_MASTER['SALES_PRODUCT_DETAILS'].name,
      model: SalesProductDetails.salesProductDetailModel,
    },
    {
      tableName: TABLE_MASTER['SALES_SERVICE_DETAILS'].name,
      model: SalesServiceDetails.salesServiceDetailModel,
    },
  ],
});
