import DataModelUtils from '../../../utils/dataModelUtils.js';
import AppError from '../../../utils/appError.js';
import { TABLE_MASTER } from '../../tables.js';
import { tradeBusinessDbc } from '../../dbModel.js';

export const customerImageTypeModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['MASTER_CUSTOMER_IMAGE_TYPES'].name,
  tableFields: TABLE_MASTER['MASTER_CUSTOMER_IMAGE_TYPES'].fields,
  entityName: 'customer image type',
  requiredFields: ['name'],
  validations: {
    name: { required: true },
  },
});
