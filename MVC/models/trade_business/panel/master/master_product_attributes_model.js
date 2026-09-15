import DataModelUtils from '../../../../../utils/dataModelUtils.js';
import AppError from '../../../../../utils/appError.js';
import { TABLE_MASTER } from '../../../tables.js';
import { tradeBusinessDbc } from '../../../dbModel.js';

// Create DataModelUtils instance for master product category attributes
export const masterProductAttributesModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['MASTER_PRODUCT_ATTRIBUTES'].name,
  tableFields: TABLE_MASTER['MASTER_PRODUCT_ATTRIBUTES'].fields,
  entityName: 'master product attributes',
  requiredFields: ['name'],
  validations: {
    name: { required: true },
  },
});
