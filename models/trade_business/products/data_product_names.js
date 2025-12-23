import AppError from '../../../utils/appError.js';
import { v4 as uuidv4 } from 'uuid';
import { TABLE_MASTER } from '../../tables.js';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import { tradeBusinessDbc } from '../../dbModel.js';

// Create a data model utility for product names
export const productNameModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['PRODUCT_NAMES'].name,
  tableFields: TABLE_MASTER['PRODUCT_NAMES'].fields,
  entityName: 'product name',
  entityIdField: 'product_id',
  requiredFields: ['product_id', 'name', 'name_type_id'],
  validations: {
    product_id: { required: true },
    name: { required: true },
    name_type_id: { required: true },
  },
  defaults: {
    id: uuidv4,
  },
  joinConfig: {
    joinTable: 'master_product_name_types',
    joinField: 'name_type_id',
    selectFields: 'master_product_name_types.name as type_name',
    orderBy: 'product_names.name_type_id',
  },
});
