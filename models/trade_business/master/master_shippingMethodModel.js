import DataModelUtils from '../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../tables.js';
import { tradeBusinessDbc } from '../../dbModel.js';

export const shippingMethodModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['MASTER_SHIPPING_METHOD'].name,
  tableFields: TABLE_MASTER['MASTER_SHIPPING_METHOD'].fields,
  entityName: 'shipping_method',
  requiredFields: ['name'],
  validations: {
    name: { required: true },
  },
});
