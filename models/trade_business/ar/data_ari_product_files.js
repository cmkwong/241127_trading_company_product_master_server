import { v4 as uuidv4 } from 'uuid';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../tables.js';
import { tradeBusinessDbc } from '../../dbModel.js';

export const ariProductFileModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['ARI_PRODUCT_FILES'].name,
  tableFields: TABLE_MASTER['ARI_PRODUCT_FILES'].fields,
  entityName: 'ari product file',
  entityIdField: 'id',
  requiredFields: ['ari_product_detail_id', 'file_name', 'file_url'],
  defaults: { id: uuidv4 },
});
