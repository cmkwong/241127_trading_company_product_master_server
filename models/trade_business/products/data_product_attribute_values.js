import { v4 as uuidv4 } from 'uuid';
import { TABLE_MASTER } from '../../tables.js';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import { tradeBusinessDbc } from '../../dbModel.js';

// Create a data model utility for product attribute values
export const productAttributeValueModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['PRODUCT_ATTRIBUTE_VALUES'].name,
  tableFields: TABLE_MASTER['PRODUCT_ATTRIBUTE_VALUES'].fields,
  entityName: 'product attribute value',
  entityIdField: 'id',
  requiredFields: ['product_id', 'attribute_id', 'value'],
  validations: {
    product_id: { required: true },
    attribute_id: { required: true },
    value: { required: true },
  },
  defaults: {
    id: uuidv4,
  },
});
