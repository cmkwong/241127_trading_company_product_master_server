import { TABLE_MASTER } from '../../tables.js';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import { tradeBusinessDbc } from '../../dbModel.js';
import { v4 as uuidv4 } from 'uuid';

// Create a data model utility for supplier service images
export const supplierServiceImageModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['SUPPLIER_SERVICE_IMAGES'].name,
  tableFields: TABLE_MASTER['SUPPLIER_SERVICE_IMAGES'].fields,
  entityName: 'supplier service image',
  entityIdField: 'id',
  requiredFields: ['supplier_service_id'],
  validations: {
    supplier_service_id: { required: true },
  },
  defaults: {
    id: uuidv4,
  },
  fileConfig: {
    fileUrlField: 'image_url',
    uploadDir: 'public/suppliers/{id}/supplier_services/',
    imagesOnly: true,
  },
});
