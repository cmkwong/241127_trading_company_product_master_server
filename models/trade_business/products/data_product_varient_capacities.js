import { v4 as uuidv4 } from 'uuid';
import { TABLE_MASTER } from '../../tables.js';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import { tradeBusinessDbc } from '../../dbModel.js';

export const productVarientCapacityModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['PRODUCT_VARIENT_CAPACITIES'].name,
  tableFields: TABLE_MASTER['PRODUCT_VARIENT_CAPACITIES'].fields,
  entityName: 'product varient capacity',
  entityIdField: 'id',
  requiredFields: ['product_id', 'capacity_type_id'],
  validations: {
    product_id: { required: true },
    capacity_type_id: { required: true },
  },
  defaults: {
    id: uuidv4,
  },
});
