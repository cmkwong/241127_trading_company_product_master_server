import { v4 as uuidv4 } from 'uuid';
import DataModelUtils from '../../../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../../tables.js';
import { tradeBusinessDbc } from '../../../dbModel.js';

export const salesPackingItemInternalImageModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['SALES_PACKING_ITEM_INTERNAL_IMAGES'].name,
  tableFields: TABLE_MASTER['SALES_PACKING_ITEM_INTERNAL_IMAGES'].fields,
  entityName: 'sales packing item internal image',
  entityIdField: 'id',
  requiredFields: ['sales_packing_item_id', 'image_url', 'image_name'],
  defaults: { id: uuidv4 },
  fileConfig: {
    fileUrlField: 'image_url',
    uploadDir: 'public/quotations/{id}/packing_items/internal/',
    imagesOnly: true,
  },
});
