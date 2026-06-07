import { v4 as uuidv4 } from 'uuid';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../tables.js';
import { tradeBusinessDbc } from '../../dbModel.js';

export const salesProductDetailInternalImageModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['SALES_PRODUCT_DETAIL_INTERNAL_IMAGES'].name,
  tableFields: TABLE_MASTER['SALES_PRODUCT_DETAIL_INTERNAL_IMAGES'].fields,
  entityName: 'sales product detail internal image',
  entityIdField: 'id',
  requiredFields: ['sales_product_detail_id', 'image_url', 'image_name'],
  defaults: { id: uuidv4 },
  fileConfig: {
    fileUrlField: 'image_url',
    uploadDir: 'public/quotations/{id}/product_details/internal/',
    imagesOnly: true,
  },
});
