import { v4 as uuidv4 } from 'uuid';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../tables.js';
import { tradeBusinessDbc } from '../../dbModel.js';
import * as PurchaseServiceImages from './data_purchase_service_images.js';

export const purchaseServiceDetailModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['PURCHASE_SERVICE_DETAILS'].name,
  tableFields: TABLE_MASTER['PURCHASE_SERVICE_DETAILS'].fields,
  entityName: 'purchase service detail',
  entityIdField: 'id',
  requiredFields: ['purchase_request_id', 'service_id'],
  defaults: { id: uuidv4 },
  childTableConfig: [
    {
      tableName: TABLE_MASTER['PURCHASE_SERVICE_IMAGES'].name,
      model: PurchaseServiceImages.purchaseServiceImageModel,
    },
  ],
});
