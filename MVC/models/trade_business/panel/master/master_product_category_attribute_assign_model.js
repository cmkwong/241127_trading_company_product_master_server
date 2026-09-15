import DataModelUtils from '../../../../../utils/dataModelUtils.js';
import AppError from '../../../../../utils/appError.js';
import { TABLE_MASTER } from '../../../tables.js';
import { tradeBusinessDbc } from '../../../dbModel.js';

// Create DataModelUtils instance for master product category attributes
export const masterProductCategoryAttributeAssignModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['MASTER_PRODUCT_CATEGORY_ATTRIBUTE_ASSIGN'].name,
  tableFields: TABLE_MASTER['MASTER_PRODUCT_CATEGORY_ATTRIBUTE_ASSIGN'].fields,
  entityName: 'master product category attribute assign',
  requiredFields: ['category_id', 'attribute_id'],
  validations: {
    category_id: { required: true },
    attribute_id: { required: true },
  },
});
