import { v4 as uuidv4 } from 'uuid';
import DataModelUtils from '../../../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../../tables.js';
import { tradeBusinessDbc } from '../../../dbModel.js';

export const salesServiceDetailInternalFileModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['SALES_SERVICE_DETAIL_INTERNAL_FILES'].name,
  tableFields: TABLE_MASTER['SALES_SERVICE_DETAIL_INTERNAL_FILES'].fields,
  entityName: 'sales service detail internal file',
  entityIdField: 'id',
  requiredFields: ['sales_service_detail_id', 'file_url', 'file_name'],
  defaults: { id: uuidv4 },
  fileConfig: {
    fileUrlField: 'file_url',
    uploadDir: 'public/quotations/{id}/service_details/internal/',
    imagesOnly: false,
  },
});
