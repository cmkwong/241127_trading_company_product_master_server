import { v4 as uuidv4 } from 'uuid';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../tables.js';
import { tradeBusinessDbc } from '../../dbModel.js';

export const purchaseServiceImageModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['PURCHASE_SERVICE_IMAGES'].name,
  tableFields: TABLE_MASTER['PURCHASE_SERVICE_IMAGES'].fields,
  entityName: 'purchase service image',
  entityIdField: 'id',
  requiredFields: ['purchase_service_detail_id', 'image_url', 'image_name'],
  defaults: { id: uuidv4 },
});
