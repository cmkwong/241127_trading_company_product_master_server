import { v4 as uuidv4 } from 'uuid';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../tables.js';
import { tradeBusinessDbc } from '../../dbModel.js';

export const apiServiceFileModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['API_SERVICE_FILES'].name,
  tableFields: TABLE_MASTER['API_SERVICE_FILES'].fields,
  entityName: 'api service file',
  entityIdField: 'id',
  requiredFields: ['api_service_detail_id', 'file_name', 'file_url'],
  defaults: { id: uuidv4 },
});
