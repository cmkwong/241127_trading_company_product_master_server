import { v4 as uuidv4 } from 'uuid';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../tables.js';
import { tradeBusinessDbc } from '../../dbModel.js';

export const apiShippingFileModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['API_SHIPPING_FILES'].name,
  tableFields: TABLE_MASTER['API_SHIPPING_FILES'].fields,
  entityName: 'api shipping file',
  entityIdField: 'id',
  requiredFields: ['api_shipping_detail_id', 'file_name', 'file_url'],
  defaults: { id: uuidv4 },
});
