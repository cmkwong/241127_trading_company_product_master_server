import DataModelUtils from '../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../tables.js';
import { tradeBusinessDbc } from '../../dbModel.js';

export const capacityTypeModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['MASTER_CAPACITY_TYPES'].name,
  tableFields: TABLE_MASTER['MASTER_CAPACITY_TYPES'].fields,
  entityName: 'capacity type',
  requiredFields: ['value', 'unit'],
  validations: {
    value: { required: true },
    unit: { required: true },
  },
});
