import { v4 as uuidv4 } from 'uuid';
import { TABLE_MASTER } from '../../tables.js';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import { tradeBusinessDbc } from '../../dbModel.js';

export const productVarientSizeModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['PRODUCT_VARIENT_SIZES'].name,
  tableFields: TABLE_MASTER['PRODUCT_VARIENT_SIZES'].fields,
  entityName: 'product varient size',
  entityIdField: 'id',
  requiredFields: ['product_id', 'size_type_id'],
  validations: {
    product_id: { required: true },
    size_type_id: { required: true },
  },
  defaults: {
    id: uuidv4,
  },
});
