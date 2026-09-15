import { v4 as uuidv4 } from 'uuid';
import DataModelUtils from '../../../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../../tables.js';
import { tradeBusinessDbc } from '../../../dbModel.js';

export const purchaseShippingFileModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['PURCHASE_SHIPPING_FILES'].name,
  tableFields: TABLE_MASTER['PURCHASE_SHIPPING_FILES'].fields,
  entityName: 'purchase shipping file',
  entityIdField: 'id',
  requiredFields: ['purchase_shipping_detail_id', 'file_url', 'file_name'],
  defaults: { id: uuidv4 },
  fileConfig: {
    fileUrlField: 'file_url',
    uploadDir: 'public/purchase/{id}/shipping/',
    imagesOnly: false,
  },
});
