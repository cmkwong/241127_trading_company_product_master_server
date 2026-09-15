import { v4 as uuidv4 } from 'uuid';
import DataModelUtils from '../../../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../../tables.js';
import { tradeBusinessDbc } from '../../../dbModel.js';

export const salesDocModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['SALES_DOCS'].name,
  tableFields: TABLE_MASTER['SALES_DOCS'].fields,
  entityName: 'sales doc',
  entityIdField: 'id',
  requiredFields: ['sales_quotation_id', 'file_url', 'file_name'],
  defaults: { id: uuidv4 },
  fileConfig: {
    fileUrlField: 'file_url',
    uploadDir: 'public/quotations/{id}/docs/',
    imagesOnly: false,
  },
});
