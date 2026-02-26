import DataModelUtils from '../../../utils/dataModelUtils.js';
import AppError from '../../../utils/appError.js';
import { TABLE_MASTER } from '../../tables.js';
import { tradeBusinessDbc } from '../../dbModel.js';

// Create DataModelUtils instance for contact types
export const contactTypeModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['MASTER_CONTACT_TYPES'].name,
  tableFields: TABLE_MASTER['MASTER_CONTACT_TYPES'].fields,
  entityName: 'contact type',
  requiredFields: ['name'],
  validations: {
    name: { required: true },
  },
});
