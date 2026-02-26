import { v4 as uuidv4 } from 'uuid';
import { TABLE_MASTER } from '../../tables.js';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import * as SupplierServiceImages from './data_supplier_service_images.js';
import { tradeBusinessDbc } from '../../dbModel.js';

// Create a data model utility for supplier services
export const supplierServiceModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['SUPPLIER_SERVICES'].name,
  tableFields: TABLE_MASTER['SUPPLIER_SERVICES'].fields,
  entityName: 'supplier service',
  entityIdField: 'id',
  requiredFields: ['supplier_id', 'service_type_id'],
  validations: {
    supplier_id: { required: true },
    service_type_id: { required: true },
  },
  defaults: {
    id: uuidv4,
  },
  childTableConfig: [
    {
      tableName: TABLE_MASTER['SUPPLIER_SERVICE_IMAGES'].name,
      model: SupplierServiceImages.supplierServiceImageModel,
    },
  ],
});
