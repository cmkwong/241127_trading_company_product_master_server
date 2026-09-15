import { v4 as uuidv4 } from 'uuid';
import DataModelUtils from '../../../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../../tables.js';
import { tradeBusinessDbc } from '../../../dbModel.js';

export const purchaseServiceFileModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['PURCHASE_SERVICE_FILES'].name,
  tableFields: TABLE_MASTER['PURCHASE_SERVICE_FILES'].fields,
  entityName: 'purchase service file',
  entityIdField: 'id',
  requiredFields: ['purchase_service_detail_id', 'file_url', 'file_name'],
  defaults: { id: uuidv4 },
  fileConfig: {
    fileUrlField: 'file_url',
    uploadDir: 'public/purchase/{id}/service/',
    imagesOnly: false,
  },
});
