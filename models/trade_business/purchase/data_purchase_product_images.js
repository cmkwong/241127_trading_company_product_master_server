import { v4 as uuidv4 } from 'uuid';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../tables.js';
import { tradeBusinessDbc } from '../../dbModel.js';

export const purchaseProductImageModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['PURCHASE_PRODUCT_IMAGES'].name,
  tableFields: TABLE_MASTER['PURCHASE_PRODUCT_IMAGES'].fields,
  entityName: 'purchase product image',
  entityIdField: 'id',
  requiredFields: ['purchase_product_detail_id', 'image_url', 'image_name'],
  defaults: { id: uuidv4 },
});
