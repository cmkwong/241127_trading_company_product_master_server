import { v4 as uuidv4 } from 'uuid';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../tables.js';
import { tradeBusinessDbc } from '../../dbModel.js';

export const apInvoiceRowDetailFileModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['AP_INVOICE_ROW_DETAIL_FILES'].name,
  tableFields: TABLE_MASTER['AP_INVOICE_ROW_DETAIL_FILES'].fields,
  entityName: 'ap invoice row detail file',
  entityIdField: 'id',
  requiredFields: ['ap_invoice_row_detail_id', 'file_name', 'file_url'],
  defaults: { id: uuidv4 },
  fileConfig: {
    fileUrlField: 'file_url',
    fileTypeField: 'file_type',
    descriptionField: 'description',
    uploadDir: 'public/ap/{id}/row-details/files/',
    imagesOnly: false,
  },
});
