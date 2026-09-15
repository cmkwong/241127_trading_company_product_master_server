import { v4 as uuidv4 } from 'uuid';
import DataModelUtils from '../../../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../../tables.js';
import { tradeBusinessDbc } from '../../../dbModel.js';

export const salesProductDetailInternalFileModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['SALES_PRODUCT_DETAIL_INTERNAL_FILES'].name,
  tableFields: TABLE_MASTER['SALES_PRODUCT_DETAIL_INTERNAL_FILES'].fields,
  entityName: 'sales product detail internal file',
  entityIdField: 'id',
  requiredFields: ['sales_product_detail_id', 'file_url', 'file_name'],
  defaults: { id: uuidv4 },
  fileConfig: {
    fileUrlField: 'file_url',
    uploadDir: 'public/quotations/{id}/product_details/internal/',
    imagesOnly: false,
  },
});
