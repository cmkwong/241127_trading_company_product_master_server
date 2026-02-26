import DataModelUtils from '../../../utils/dataModelUtils.js';
import AppError from '../../../utils/appError.js';
import { TABLE_MASTER } from '../../tables.js';
import { tradeBusinessDbc } from '../../dbModel.js';

export const customerNameTypeModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['MASTER_CUSTOMER_NAME_TYPES'].name,
  tableFields: TABLE_MASTER['MASTER_CUSTOMER_NAME_TYPES'].fields,
  entityName: 'customer name type',
  requiredFields: ['name'],
  validations: {
    name: { required: true },
  },
});
