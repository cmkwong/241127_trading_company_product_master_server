import { v4 as uuidv4 } from 'uuid';
import { TABLE_MASTER } from '../../../tables.js';
import DataModelUtils from '../../../../../utils/dataModelUtils.js';
import { tradeBusinessDbc } from '../../../dbModel.js';

export const productCostModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['PRODUCT_COSTS'].name,
  tableFields: TABLE_MASTER['PRODUCT_COSTS'].fields,
  entityName: 'product cost',
  entityIdField: 'id',
  requiredFields: [
    'product_id',
    'size_type_id',
    'color_type_id',
    'capacity_type_id',
    'currency_id',
  ],
  validations: {
    product_id: { required: true },
    size_type_id: { required: true },
    color_type_id: { required: true },
    capacity_type_id: { required: true },
    unit_cost: { min: 0 },
    currency_id: { required: true },
  },
  defaults: {
    id: uuidv4,
  },
});
