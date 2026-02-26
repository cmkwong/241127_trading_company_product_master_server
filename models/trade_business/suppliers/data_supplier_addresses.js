import { TABLE_MASTER } from '../../tables.js';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import { tradeBusinessDbc } from '../../dbModel.js';
import { v4 as uuidv4 } from 'uuid';

// Create a data model utility for supplier addresses
export const supplierAddressModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['SUPPLIER_ADDRESSES'].name,
  tableFields: TABLE_MASTER['SUPPLIER_ADDRESSES'].fields,
  entityName: 'supplier address',
  entityIdField: 'id',
  requiredFields: ['supplier_id', 'address_type_id', 'address_line1'],
  validations: {
    supplier_id: { required: true },
    address_type_id: { required: true },
    address_line1: { required: true },
  },
  defaults: {
    id: uuidv4,
  },
});
