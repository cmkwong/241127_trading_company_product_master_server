import { v4 as uuidv4 } from 'uuid';
import DataModelUtils from '../../../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../../tables.js';
import { tradeBusinessDbc } from '../../../dbModel.js';

export const salesPackingItemImageModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['SALES_PACKING_ITEM_IMAGES'].name,
  tableFields: TABLE_MASTER['SALES_PACKING_ITEM_IMAGES'].fields,
  entityName: 'sales packing item image',
  entityIdField: 'id',
  requiredFields: ['sales_packing_item_id', 'image_url', 'image_name'],
  defaults: { id: uuidv4 },
  fileConfig: {
    fileUrlField: 'image_url',
    uploadDir: 'public/quotations/{id}/packing_items/',
    imagesOnly: true,
  },
});
