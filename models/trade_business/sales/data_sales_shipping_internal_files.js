import { v4 as uuidv4 } from 'uuid';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../tables.js';
import { tradeBusinessDbc } from '../../dbModel.js';

export const salesShippingInternalFileModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['SALES_SHIPPING_INTERNAL_FILES'].name,
  tableFields: TABLE_MASTER['SALES_SHIPPING_INTERNAL_FILES'].fields,
  entityName: 'sales shipping internal file',
  entityIdField: 'id',
  requiredFields: ['sales_shipping_detail_id', 'file_url', 'file_name'],
  defaults: { id: uuidv4 },
  fileConfig: {
    fileUrlField: 'file_url',
    uploadDir: 'public/quotations/{id}/shipping/internal/',
    imagesOnly: false,
  },
});
