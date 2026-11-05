import { v4 as uuidv4 } from 'uuid';
import DataModelUtils from '../../../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../../tables.js';
import { tradeBusinessDbc } from '../../../dbModel.js';
import * as CatalogProductRows from './data_catalog_product_rows.js';

export const catalogModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['CATALOGS'].name,
  tableFields: TABLE_MASTER['CATALOGS'].fields,
  entityName: 'catalog',
  entityIdField: 'id',
  requiredFields: [],
  defaults: { id: uuidv4 },
  childTableConfig: [
    {
      tableName: TABLE_MASTER['CATALOG_PRODUCT_ROWS'].name,
      model: CatalogProductRows.catalogProductRowModel,
    },
  ],
});
