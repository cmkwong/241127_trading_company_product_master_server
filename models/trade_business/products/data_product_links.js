import { v4 as uuidv4 } from 'uuid';
import { PRODUCT_TABLE_MASTER } from '../../tables.js';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import * as ProductLinkImages from './data_product_link_images.js';
import { tradeBusinessDbc } from '../../dbModel.js';

// Create a data model utility for product links
export const productLinkModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: PRODUCT_TABLE_MASTER['PRODUCT_LINKS'].name,
  tableFields: PRODUCT_TABLE_MASTER['PRODUCT_LINKS'].fields,
  entityName: 'product link',
  requiredFields: ['product_id', 'link'],
  validations: {
    product_id: { required: true },
    link: { required: true },
  },
  defaults: {
    id: uuidv4,
  },
  childTableConfig: [
    {
      tableName: PRODUCT_TABLE_MASTER['PRODUCT_LINK_IMAGES'].name,
      model: ProductLinkImages.productLinkImageModel,
    },
  ],
});
