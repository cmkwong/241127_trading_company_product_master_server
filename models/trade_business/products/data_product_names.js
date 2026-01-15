import { v4 as uuidv4 } from 'uuid';
import { PRODUCT_TABLE_MASTER } from '../../tables.js';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import { tradeBusinessDbc } from '../../dbModel.js';

// Create a data model utility for product names
export const productNameModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: PRODUCT_TABLE_MASTER['PRODUCT_NAMES'].name,
  tableFields: PRODUCT_TABLE_MASTER['PRODUCT_NAMES'].fields,
  entityName: 'product name',
  entityIdField: 'id',
  requiredFields: ['product_id', 'name', 'name_type_id'],
  validations: {
    product_id: { required: true },
    name: { required: true },
    name_type_id: { required: true },
  },
  defaults: {
    id: uuidv4,
  },
});
