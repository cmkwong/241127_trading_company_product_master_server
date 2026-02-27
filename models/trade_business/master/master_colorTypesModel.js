import DataModelUtils from '../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../tables.js';
import { tradeBusinessDbc } from '../../dbModel.js';

// Create DataModelUtils instance for color types
export const colorTypeModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['MASTER_COLOR_TYPES'].name,
  tableFields: TABLE_MASTER['MASTER_COLOR_TYPES'].fields,
  entityName: 'color type',
  requiredFields: ['name'],
  validations: {
    name: { required: true },
  },
});
