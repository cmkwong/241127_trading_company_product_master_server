import DataModelUtils from '../../../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../../tables.js';
import { tradeBusinessDbc } from '../../../dbModel.js';

// Create DataModelUtils instance for countries
export const countryModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['MASTER_COUNTRIES'].name,
  tableFields: TABLE_MASTER['MASTER_COUNTRIES'].fields,
  entityName: 'country',
  requiredFields: ['name'],
  validations: {
    name: { required: true },
  },
});
