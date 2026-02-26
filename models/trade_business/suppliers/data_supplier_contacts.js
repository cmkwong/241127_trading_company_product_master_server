import { TABLE_MASTER } from '../../tables.js';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import { tradeBusinessDbc } from '../../dbModel.js';
import { v4 as uuidv4 } from 'uuid';

// Create a data model utility for supplier contacts
export const supplierContactModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['SUPPLIER_CONTACTS'].name,
  tableFields: TABLE_MASTER['SUPPLIER_CONTACTS'].fields,
  entityName: 'supplier contact',
  entityIdField: 'id',
  requiredFields: ['supplier_id', 'contact_type_id', 'contact_name'],
  validations: {
    supplier_id: { required: true },
    contact_type_id: { required: true },
    contact_name: { required: true },
  },
  defaults: {
    id: uuidv4,
  },
});
