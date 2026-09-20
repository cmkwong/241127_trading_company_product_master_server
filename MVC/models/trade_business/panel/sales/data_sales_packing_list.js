import { v4 as uuidv4 } from 'uuid';
import DataModelUtils from '../../../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../../tables.js';
import { tradeBusinessDbc } from '../../../dbModel.js';
import * as SalesPackingItemImages from './data_sales_packing_item_images.js';
import * as SalesPackingItemInternalImages from './data_sales_packing_item_internal_images.js';
import * as SalesPackingItemInternalFiles from './data_sales_packing_item_internal_files.js';

export const salesPackingListModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['SALES_PACKING_ITEMS'].name,
  tableFields: TABLE_MASTER['SALES_PACKING_ITEMS'].fields,
  entityName: 'sales packing list item',
  entityIdField: 'id',
  requiredFields: ['sales_quotation_id'],
  defaults: { id: uuidv4 },
  childTableConfig: [
    {
      tableName: TABLE_MASTER['SALES_PACKING_ITEM_IMAGES'].name,
      model: SalesPackingItemImages.salesPackingItemImageModel,
    },
    {
      tableName: TABLE_MASTER['SALES_PACKING_ITEM_INTERNAL_IMAGES'].name,
      model:
        SalesPackingItemInternalImages.salesPackingItemInternalImageModel,
    },
    {
      tableName: TABLE_MASTER['SALES_PACKING_ITEM_INTERNAL_FILES'].name,
      model: SalesPackingItemInternalFiles.salesPackingItemInternalFileModel,
    },
  ],
});
