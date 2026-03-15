import { v4 as uuidv4 } from 'uuid';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../tables.js';
import { tradeBusinessDbc } from '../../dbModel.js';

export const salesServiceDetailImageSelectionModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['SALES_SERVICE_DETAIL_IMAGE_SELECTIONS'].name,
  tableFields: TABLE_MASTER['SALES_SERVICE_DETAIL_IMAGE_SELECTIONS'].fields,
  entityName: 'sales service image selection',
  entityIdField: 'id',
  requiredFields: ['sales_service_detail_id', 'image_id'],
  defaults: { id: uuidv4 },
});
