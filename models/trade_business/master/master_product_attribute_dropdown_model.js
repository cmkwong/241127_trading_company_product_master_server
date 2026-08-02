import DataModelUtils from '../../../utils/dataModelUtils.js';
import AppError from '../../../utils/appError.js';
import { TABLE_MASTER } from '../../tables.js';
import { tradeBusinessDbc } from '../../dbModel.js';

// Create DataModelUtils instance for master product category attributes
export const masterProductAttributeDropdownModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['MASTER_PRODUCT_ATTRIBUTE_DROPDOWN'].name,
  tableFields: TABLE_MASTER['MASTER_PRODUCT_ATTRIBUTE_DROPDOWN'].fields,
  entityName: 'master product attribute dropdown',
  requiredFields: ['attribute_id', 'value'],
  validations: {
    attribute_id: { required: true },
    value: { required: true },
  },
});
