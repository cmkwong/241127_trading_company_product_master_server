import { v4 as uuidv4 } from 'uuid';
import DataModelUtils from '../../../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../../tables.js';
import { tradeBusinessDbc } from '../../../dbModel.js';

export const catalogProductRowAttributeDisplayModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['CATALOG_PRODUCT_ROW_ATTRIBUTE_DISPLAYS'].name,
  tableFields: TABLE_MASTER['CATALOG_PRODUCT_ROW_ATTRIBUTE_DISPLAYS'].fields,
  entityName: 'catalog product row attribute display',
  entityIdField: 'id',
  requiredFields: ['catalog_product_row_id'],
  defaults: { id: uuidv4 },
});
