import DataModelUtils from '../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../tables.js';
import { tradeBusinessDbc } from '../../dbModel.js';

// Create DataModelUtils instance for master product logistics attributes
export const masterProductLogisticsAttributesModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['MASTER_PRODUCT_LOGISTICS_ATTRIBUTES'].name,
  tableFields: TABLE_MASTER['MASTER_PRODUCT_LOGISTICS_ATTRIBUTES'].fields,
  entityName: 'master product logistics attribute',
  requiredFields: ['name'],
  validations: {
    name: { required: true },
  },
});
