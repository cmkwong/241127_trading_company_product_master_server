import { v4 as uuidv4 } from 'uuid';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../tables.js';
import { tradeBusinessDbc } from '../../dbModel.js';
import * as ApInvoiceRowDetailImages from './data_ap_invoice_row_detail_images.js';
import * as ApInvoiceRowDetailFiles from './data_ap_invoice_row_detail_files.js';

export const apInvoiceRowDetailModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['AP_INVOICE_ROW_DETAILS'].name,
  tableFields: TABLE_MASTER['AP_INVOICE_ROW_DETAILS'].fields,
  entityName: 'ap invoice row detail',
  entityIdField: 'id',
  requiredFields: ['ap_invoice_id'],
  defaults: { id: uuidv4 },
  childTableConfig: [
    {
      tableName: TABLE_MASTER['AP_INVOICE_ROW_DETAIL_IMAGES'].name,
      model: ApInvoiceRowDetailImages.apInvoiceRowDetailImageModel,
    },
    {
      tableName: TABLE_MASTER['AP_INVOICE_ROW_DETAIL_FILES'].name,
      model: ApInvoiceRowDetailFiles.apInvoiceRowDetailFileModel,
    },
  ],
});
