import { TABLE_MASTER } from '../../tables.js';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import { tradeBusinessDbc } from '../../dbModel.js';
import { v4 as uuidv4 } from 'uuid';

// Create a data model utility for supplier links
export const supplierLinkModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['SUPPLIER_LINKS'].name,
  tableFields: TABLE_MASTER['SUPPLIER_LINKS'].fields,
  entityName: 'supplier link',
  entityIdField: 'id',
  requiredFields: ['supplier_id', 'link'],
  validations: {
    supplier_id: { required: true },
    link: { required: true },
  },
  defaults: {
    id: uuidv4,
  },
});
