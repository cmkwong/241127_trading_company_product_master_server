import DataModelUtils from '../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../tables.js';
import { tradeBusinessDbc } from '../../dbModel.js';

// Create DataModelUtils instance for product status master
export const productStatusModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['MASTER_PRODUCT_STATUS'].name,
  tableFields: TABLE_MASTER['MASTER_PRODUCT_STATUS'].fields,
  entityName: 'product status',
  requiredFields: ['name'],
  validations: {
    name: { required: true },
  },
});
