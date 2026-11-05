import { v4 as uuidv4 } from 'uuid';
import DataModelUtils from '../../../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../../tables.js';
import { tradeBusinessDbc } from '../../../dbModel.js';
import * as CatalogProductRowImages from './data_catalog_product_row_images.js';
import * as CatalogProductRowAttributeDisplays from './data_catalog_product_row_attribute_displays.js';

export const catalogProductRowModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['CATALOG_PRODUCT_ROWS'].name,
  tableFields: TABLE_MASTER['CATALOG_PRODUCT_ROWS'].fields,
  entityName: 'catalog product row',
  entityIdField: 'id',
  requiredFields: ['catalog_id'],
  defaults: { id: uuidv4 },
  childTableConfig: [
    {
      tableName: TABLE_MASTER['CATALOG_PRODUCT_ROW_IMAGES'].name,
      model: CatalogProductRowImages.catalogProductRowImageModel,
    },
    {
      tableName: TABLE_MASTER['CATALOG_PRODUCT_ROW_ATTRIBUTE_DISPLAYS'].name,
      model:
        CatalogProductRowAttributeDisplays.catalogProductRowAttributeDisplayModel,
    },
  ],
});
