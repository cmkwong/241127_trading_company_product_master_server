import { v4 as uuidv4 } from 'uuid';
import { TABLE_MASTER } from '../../tables.js';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import { tradeBusinessDbc } from '../../dbModel.js';

export const productCostModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['PRODUCT_COSTS'].name,
  tableFields: TABLE_MASTER['PRODUCT_COSTS'].fields,
  entityName: 'product cost',
  entityIdField: 'id',
  requiredFields: [
    'product_id',
    'product_varient_size_id',
    'product_varient_color_id',
    'product_varient_capacity_id',
    'unit_cost',
    'currency_id',
  ],
  validations: {
    product_id: { required: true },
    product_varient_size_id: { required: true },
    product_varient_color_id: { required: true },
    product_varient_capacity_id: { required: true },
    unit_cost: { min: 0, required: true },
    currency_id: { required: true },
  },
  defaults: {
    id: uuidv4,
    min_order_qty: 1,
  },
});
