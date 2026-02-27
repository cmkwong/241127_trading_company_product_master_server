import { v4 as uuidv4 } from 'uuid';
import { TABLE_MASTER } from '../../tables.js';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import { tradeBusinessDbc } from '../../dbModel.js';
import { productVarientColorImageModel } from './data_product_varient_color_images.js';

export const productVarientColorModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['PRODUCT_VARIENT_COLORS'].name,
  tableFields: TABLE_MASTER['PRODUCT_VARIENT_COLORS'].fields,
  entityName: 'product varient color',
  entityIdField: 'id',
  requiredFields: ['product_id', 'color_type_id'],
  validations: {
    product_id: { required: true },
    color_type_id: { required: true },
  },
  defaults: {
    id: uuidv4,
  },
  childTableConfig: [
    {
      tableName: TABLE_MASTER['PRODUCT_VARIENT_COLOR_IMAGES'].name,
      model: productVarientColorImageModel,
    },
  ],
});
