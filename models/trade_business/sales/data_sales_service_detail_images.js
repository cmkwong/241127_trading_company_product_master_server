import { v4 as uuidv4 } from 'uuid';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../tables.js';
import { tradeBusinessDbc } from '../../dbModel.js';

export const salesServiceDetailImageModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['SALES_SERVICE_DETAIL_IMAGES'].name,
  tableFields: TABLE_MASTER['SALES_SERVICE_DETAIL_IMAGES'].fields,
  entityName: 'sales service detail image',
  entityIdField: 'id',
  requiredFields: ['sales_service_detail_id', 'image_url', 'image_name'],
  defaults: { id: uuidv4 },
  fileConfig: {
    fileUrlField: 'image_url',
    uploadDir: 'public/quotations/{id}/service_details/',
    imagesOnly: true,
  },
});
