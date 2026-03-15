import { v4 as uuidv4 } from 'uuid';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../tables.js';
import { tradeBusinessDbc } from '../../dbModel.js';
import * as SalesProductImageSelections from './data_sales_product_detail_image_selections.js';

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
      tableName: TABLE_MASTER['SALES_PRODUCT_DETAIL_IMAGE_SELECTIONS'].name,
      model: SalesProductImageSelections.salesProductDetailImageSelectionModel,
    },
  ],
});
