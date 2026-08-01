import { v4 as uuidv4 } from 'uuid';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../tables.js';
import { tradeBusinessDbc } from '../../dbModel.js';

export const purchaseProductFileModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['PURCHASE_PRODUCT_FILES'].name,
  tableFields: TABLE_MASTER['PURCHASE_PRODUCT_FILES'].fields,
  entityName: 'purchase product file',
  entityIdField: 'id',
  requiredFields: ['purchase_product_detail_id', 'file_url', 'file_name'],
  defaults: { id: uuidv4 },
  fileConfig: {
    fileUrlField: 'file_url',
    uploadDir: 'public/purchase/{id}/product/',
    imagesOnly: false,
  },
});
