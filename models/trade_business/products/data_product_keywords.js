import { v4 as uuidv4 } from 'uuid';
import { PRODUCT_TABLE_MASTER } from '../../tables.js';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import { tradeBusinessDbc } from '../../dbModel.js';

// Create a data model utility for product names
export const productKeywordModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: PRODUCT_TABLE_MASTER['PRODUCT_KEYWORDS'].name,
  tableFields: PRODUCT_TABLE_MASTER['PRODUCT_KEYWORDS'].fields,
  entityName: 'product keyword',
  entityIdField: 'id',
  requiredFields: ['product_id', 'name', 'keyword_id'],
  validations: {
    product_id: { required: true },
    name: { required: true },
    keyword_id: { required: true },
  },
  defaults: {
    id: uuidv4,
  },
  joinConfig: {
    joinTable: 'master_keywords',
    joinField: 'keyword_id',
    selectFields: 'master_keywords.name as keyword_name',
    orderBy: 'master_keywords.id',
  },
});
