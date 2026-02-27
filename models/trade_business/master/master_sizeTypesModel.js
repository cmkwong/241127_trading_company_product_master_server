import DataModelUtils from '../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../tables.js';
import { tradeBusinessDbc } from '../../dbModel.js';

// Create DataModelUtils instance for size types
export const sizeTypeModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['MASTER_SIZE_TYPES'].name,
  tableFields: TABLE_MASTER['MASTER_SIZE_TYPES'].fields,
  entityName: 'size type',
  requiredFields: ['name'],
  validations: {
    name: { required: true },
  },
});
