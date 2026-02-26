import { v4 as uuidv4 } from 'uuid';
import { TABLE_MASTER } from '../../tables.js';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import * as ProductLinkImages from './data_product_link_images.js';
import { tradeBusinessDbc } from '../../dbModel.js';

// Create a data model utility for product links
export const productLinkModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['PRODUCT_LINKS'].name,
  tableFields: TABLE_MASTER['PRODUCT_LINKS'].fields,
  entityName: 'product link',
  entityIdField: 'id',
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
      tableName: TABLE_MASTER['PRODUCT_LINK_IMAGES'].name,
      model: ProductLinkImages.productLinkImageModel,
    },
  ],
});
