import { v4 as uuidv4 } from 'uuid';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../tables.js';
import { tradeBusinessDbc } from '../../dbModel.js';
import * as ApInvoiceRowDetails from './data_ap_invoice_row_details.js';

export const apInvoiceModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['AP_INVOICES'].name,
  tableFields: TABLE_MASTER['AP_INVOICES'].fields,
  entityName: 'ap invoice',
  entityIdField: 'id',
  requiredFields: ['supplier_id', 'purchase_request_id'],
  defaults: { id: uuidv4 },
  childTableConfig: [
    {
      tableName: TABLE_MASTER['AP_INVOICE_ROW_DETAILS'].name,
      model: ApInvoiceRowDetails.apInvoiceRowDetailModel,
    },
  ],
});
