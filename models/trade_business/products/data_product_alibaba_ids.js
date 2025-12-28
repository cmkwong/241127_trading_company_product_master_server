import { PRODUCT_TABLE_MASTER } from '../../tables.js';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import { tradeBusinessDbc } from '../../dbModel.js';

// Create a data model utility for product Alibaba IDs
export const alibabaIdModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: PRODUCT_TABLE_MASTER['PRODUCT_ALIBABA_IDS'].name,
  tableFields: PRODUCT_TABLE_MASTER['PRODUCT_ALIBABA_IDS'].fields,
  entityName: 'product Alibaba ID',
  entityIdField: 'product_id',
  requiredFields: ['product_id'],
  validations: {
    alibaba_id: { required: true },
  },
});
