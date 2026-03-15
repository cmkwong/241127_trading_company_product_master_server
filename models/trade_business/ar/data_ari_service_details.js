import { v4 as uuidv4 } from 'uuid';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../tables.js';
import { tradeBusinessDbc } from '../../dbModel.js';
import * as AriServiceFiles from './data_ari_service_files.js';

export const ariServiceDetailModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['ARI_SERVICE_DETAILS'].name,
  tableFields: TABLE_MASTER['ARI_SERVICE_DETAILS'].fields,
  entityName: 'ari service detail',
  entityIdField: 'id',
  requiredFields: ['ar_invoice_id', 'sales_service_detail_id'],
  defaults: { id: uuidv4 },
  childTableConfig: [
    {
      tableName: TABLE_MASTER['ARI_SERVICE_FILES'].name,
      model: AriServiceFiles.ariServiceFileModel,
    },
  ],
});
