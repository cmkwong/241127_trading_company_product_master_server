import DataModelUtils from '../../../utils/dataModelUtils.js';
import AppError from '../../../utils/appError.js';
import { TABLE_MASTER } from '../../tables.js';
import { tradeBusinessDbc } from '../../dbModel.js';

// Create DataModelUtils instance for packing types
export const packingTypeModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['MASTER_PACKING_TYPES'].name,
  tableFields: TABLE_MASTER['MASTER_PACKING_TYPES'].fields,
  entityName: 'packing type',
  requiredFields: ['name'],
  validations: {
    name: { required: true },
  },
});
