import DataModelUtils from '../../../utils/dataModelUtils.js';
import AppError from '../../../utils/appError.js';
import { TABLE_MASTER } from '../../tables.js';
import { tradeBusinessDbc } from '../../dbModel.js';

// Create DataModelUtils instance for supplier link types
export const supplierLinkTypeModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['MASTER_SUPPLIER_LINK_TYPES'].name,
  tableFields: TABLE_MASTER['MASTER_SUPPLIER_LINK_TYPES'].fields,
  entityName: 'supplier link type',
  requiredFields: ['name'],
  validations: {
    name: { required: true },
  },
});
