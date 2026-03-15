import { v4 as uuidv4 } from 'uuid';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../tables.js';
import { tradeBusinessDbc } from '../../dbModel.js';
import * as PurchaseProductImages from './data_purchase_product_images.js';

export const purchaseProductDetailModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['PURCHASE_PRODUCT_DETAILS'].name,
  tableFields: TABLE_MASTER['PURCHASE_PRODUCT_DETAILS'].fields,
  entityName: 'purchase product detail',
  entityIdField: 'id',
  requiredFields: ['purchase_request_id', 'product_id'],
  defaults: { id: uuidv4 },
  childTableConfig: [
    {
      tableName: TABLE_MASTER['PURCHASE_PRODUCT_IMAGES'].name,
      model: PurchaseProductImages.purchaseProductImageModel,
    },
  ],
});
