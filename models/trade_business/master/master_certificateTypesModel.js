import DataModelUtils from '../../../utils/dataModelUtils.js';
import AppError from '../../../utils/appError.js';
import { PRODUCT_TABLE_MASTER } from '../../tables.js';
import { tradeBusinessDbc } from '../../dbModel.js';

// Create DataModelUtils instance for certificate types
export const certificateTypeModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: PRODUCT_TABLE_MASTER['MASTER_CERTIFICATE_TYPES'].name,
  tableFields: PRODUCT_TABLE_MASTER['MASTER_CERTIFICATE_TYPES'].fields,
  entityName: 'certificate type',
  requiredFields: ['name'],
  validations: {
    name: { required: true },
  },
});
