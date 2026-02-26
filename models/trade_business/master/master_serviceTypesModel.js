import DataModelUtils from '../../../utils/dataModelUtils.js';
import AppError from '../../../utils/appError.js';
import { TABLE_MASTER } from '../../tables.js';
import { tradeBusinessDbc } from '../../dbModel.js';

// Create DataModelUtils instance for service types
export const serviceTypeModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['MASTER_SERVICE_TYPES'].name,
  tableFields: TABLE_MASTER['MASTER_SERVICE_TYPES'].fields,
  entityName: 'service type',
  requiredFields: ['name'],
  validations: {
    name: { required: true },
  },
});
