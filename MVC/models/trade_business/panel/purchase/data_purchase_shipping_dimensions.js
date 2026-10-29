import { v4 as uuidv4 } from 'uuid';
import DataModelUtils from '../../../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../../tables.js';
import { tradeBusinessDbc } from '../../../dbModel.js';

export const purchaseShippingDimensionModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['PURCHASE_SHIPPING_DIMENSIONS'].name,
  tableFields: TABLE_MASTER['PURCHASE_SHIPPING_DIMENSIONS'].fields,
  entityName: 'purchase shipping dimension',
  entityIdField: 'id',
  requiredFields: ['purchase_shipping_detail_id'],
  defaults: { id: uuidv4 },
});
