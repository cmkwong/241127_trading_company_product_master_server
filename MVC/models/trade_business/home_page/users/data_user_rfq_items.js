import { v4 as uuidv4 } from 'uuid';
import DataModelUtils from '../../../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../../tables.js';
import { tradeBusinessDbc } from '../../../dbModel.js';

export const userRfqItemModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['USER_RFQ_ITEMS'].name,
  tableFields: TABLE_MASTER['USER_RFQ_ITEMS'].fields,
  entityName: 'user rfq item',
  entityIdField: 'id',
  requiredFields: ['rfq_id', 'product_id', 'target_qty'],
  validations: {
    rfq_id: { required: true },
    product_id: { required: true },
    target_qty: { required: true },
  },
  defaults: { id: uuidv4 },
});