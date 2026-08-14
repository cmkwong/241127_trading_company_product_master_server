import DataModelUtils from '../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../tables.js';
import { tradeBusinessDbc } from '../../dbModel.js';

// Create DataModelUtils instance for master product customization options
export const masterProductCustomizationOptionsModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['MASTER_PRODUCT_CUSTOMIZATION_OPTIONS'].name,
  tableFields: TABLE_MASTER['MASTER_PRODUCT_CUSTOMIZATION_OPTIONS'].fields,
  entityName: 'master product customization option',
  requiredFields: ['name'],
  validations: {
    name: { required: true },
  },
});
