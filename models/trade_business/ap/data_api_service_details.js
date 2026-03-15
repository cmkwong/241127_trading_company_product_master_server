import { v4 as uuidv4 } from 'uuid';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../tables.js';
import { tradeBusinessDbc } from '../../dbModel.js';
import * as ApiServiceFiles from './data_api_service_files.js';

export const apiServiceDetailModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['API_SERVICE_DETAILS'].name,
  tableFields: TABLE_MASTER['API_SERVICE_DETAILS'].fields,
  entityName: 'api service detail',
  entityIdField: 'id',
  requiredFields: ['ap_invoice_id', 'purchase_service_detail_id'],
  defaults: { id: uuidv4 },
  childTableConfig: [
    {
      tableName: TABLE_MASTER['API_SERVICE_FILES'].name,
      model: ApiServiceFiles.apiServiceFileModel,
    },
  ],
});
