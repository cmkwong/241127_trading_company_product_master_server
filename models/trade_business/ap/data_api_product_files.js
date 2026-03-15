import { v4 as uuidv4 } from 'uuid';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../tables.js';
import { tradeBusinessDbc } from '../../dbModel.js';

export const apiProductFileModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['API_PRODUCT_FILES'].name,
  tableFields: TABLE_MASTER['API_PRODUCT_FILES'].fields,
  entityName: 'api product file',
  entityIdField: 'id',
  requiredFields: ['api_product_detail_id', 'file_name', 'file_url'],
  defaults: { id: uuidv4 },
});
