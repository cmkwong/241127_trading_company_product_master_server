import { TABLE_MASTER } from '../../../tables.js';
import DataModelUtils from '../../../../../utils/dataModelUtils.js';
import { tradeBusinessDbc } from '../../../dbModel.js';
import { v4 as uuidv4 } from 'uuid';

// Create a data model utility for supplier service images
export const supplierServiceFileModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['SUPPLIER_SERVICE_FILES'].name,
  tableFields: TABLE_MASTER['SUPPLIER_SERVICE_FILES'].fields,
  entityName: 'supplier service file',
  entityIdField: 'id',
  requiredFields: ['supplier_service_id'],
  validations: {
    supplier_service_id: { required: true },
  },
  defaults: {
    id: uuidv4,
  },
  fileConfig: {
    fileUrlField: 'file_url',
    uploadDir: 'public/suppliers/{id}/supplier_services/',
    imagesOnly: false,
  },
});
