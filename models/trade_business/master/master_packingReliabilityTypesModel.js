import DataModelUtils from '../../../utils/dataModelUtils.js';
import AppError from '../../../utils/appError.js';
import { TABLE_MASTER } from '../../tables.js';
import { tradeBusinessDbc } from '../../dbModel.js';

// Create DataModelUtils instance for packing reliability types
export const packingReliabilityTypeModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['MASTER_PACKING_RELIABILITY_TYPES'].name,
  tableFields: TABLE_MASTER['MASTER_PACKING_RELIABILITY_TYPES'].fields,
  entityName: 'packing reliability type',
  requiredFields: ['name'],
  validations: {
    name: { required: true },
  },
});
