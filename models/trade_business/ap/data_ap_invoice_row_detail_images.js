import { v4 as uuidv4 } from 'uuid';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../tables.js';
import { tradeBusinessDbc } from '../../dbModel.js';

export const apInvoiceRowDetailImageModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['AP_INVOICE_ROW_DETAIL_IMAGES'].name,
  tableFields: TABLE_MASTER['AP_INVOICE_ROW_DETAIL_IMAGES'].fields,
  entityName: 'ap invoice row detail image',
  entityIdField: 'id',
  requiredFields: ['ap_invoice_row_detail_id', 'image_url', 'image_name'],
  defaults: { id: uuidv4 },
  fileConfig: {
    fileUrlField: 'image_url',
    uploadDir: 'public/ap/{id}/row-details/images/',
    imagesOnly: true,
  },
});
