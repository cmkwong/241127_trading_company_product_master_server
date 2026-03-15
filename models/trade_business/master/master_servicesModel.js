import DataModelUtils from '../../../utils/dataModelUtils.js';
import AppError from '../../../utils/appError.js';
import { TABLE_MASTER } from '../../tables.js';
import { tradeBusinessDbc } from '../../dbModel.js';

// Create DataModelUtils instance for master services
export const masterServiceModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['MASTER_SERVICES'].name,
  tableFields: TABLE_MASTER['MASTER_SERVICES'].fields,
  entityName: 'master service',
  requiredFields: ['service_name'],
  validations: {
    service_name: { required: true },
  },
});
