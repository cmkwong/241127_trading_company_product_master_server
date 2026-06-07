import { v4 as uuidv4 } from 'uuid';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../tables.js';
import { tradeBusinessDbc } from '../../dbModel.js';
import * as SalesProductImages from './data_sales_product_detail_images.js';
import * as SalesProductInternalImages from './data_sales_product_detail_internal_images.js';

export const salesProductDetailModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['SALES_PRODUCT_DETAILS'].name,
  tableFields: TABLE_MASTER['SALES_PRODUCT_DETAILS'].fields,
  entityName: 'sales product detail',
  entityIdField: 'id',
  requiredFields: ['sales_quotation_id', 'product_id'],
  defaults: { id: uuidv4 },
  childTableConfig: [
    {
      tableName: TABLE_MASTER['SALES_PRODUCT_DETAIL_IMAGES'].name,
      model: SalesProductImages.salesProductDetailImageModel,
    },
    {
      tableName: TABLE_MASTER['SALES_PRODUCT_DETAIL_INTERNAL_IMAGES'].name,
      model: SalesProductInternalImages.salesProductDetailInternalImageModel,
    },
  ],
});
