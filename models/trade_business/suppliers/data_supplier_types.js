import { v4 as uuidv4 } from 'uuid';
import { TABLE_MASTER } from '../../tables.js';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import { tradeBusinessDbc } from '../../dbModel.js';

// Create a data model utility for supplier type assignments
export const supplierTypeModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['SUPPLIER_TYPES'].name,
  tableFields: TABLE_MASTER['SUPPLIER_TYPES'].fields,
  entityName: 'supplier type',
  entityIdField: 'id',
  requiredFields: ['supplier_id', 'supplier_type_id'],
  validations: {
    supplier_id: { required: true },
    supplier_type_id: { required: true },
  },
  defaults: {
    id: uuidv4,
  },
});
