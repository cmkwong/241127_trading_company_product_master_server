import { v4 as uuidv4 } from 'uuid';
import DataModelUtils from '../../../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../../tables.js';
import { tradeBusinessDbc } from '../../../dbModel.js';

export const salesPackingDimensionModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['SALES_PACKING_DIMENSIONS'].name,
  tableFields: TABLE_MASTER['SALES_PACKING_DIMENSIONS'].fields,
  entityName: 'sales packing dimension',
  entityIdField: 'id',
  requiredFields: ['sales_packing_item_id'],
  defaults: { id: uuidv4 },
});
