import DataModelUtils from '../../../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../../tables.js';
import { tradeBusinessDbc } from '../../../dbModel.js';

// Create DataModelUtils instance for master selling unit types
export const masterSellingUnitTypesModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['MASTER_SELLING_UNIT_TYPES'].name,
  tableFields: TABLE_MASTER['MASTER_SELLING_UNIT_TYPES'].fields,
  entityName: 'master selling unit type',
  requiredFields: ['name'],
  validations: {
    name: { required: true },
  },
});
