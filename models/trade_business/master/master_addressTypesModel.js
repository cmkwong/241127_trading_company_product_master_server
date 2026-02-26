import DataModelUtils from '../../../utils/dataModelUtils.js';
import AppError from '../../../utils/appError.js';
import { TABLE_MASTER } from '../../tables.js';
import { tradeBusinessDbc } from '../../dbModel.js';

// Create DataModelUtils instance for address types
export const addressTypeModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['MASTER_ADDRESS_TYPES'].name,
  tableFields: TABLE_MASTER['MASTER_ADDRESS_TYPES'].fields,
  entityName: 'address type',
  requiredFields: ['name'],
  validations: {
    name: { required: true },
  },
});
