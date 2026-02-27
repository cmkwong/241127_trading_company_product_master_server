import { v4 as uuidv4 } from 'uuid';
import { TABLE_MASTER } from '../../tables.js';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import { tradeBusinessDbc } from '../../dbModel.js';

export const productVarientColorImageModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['PRODUCT_VARIENT_COLOR_IMAGES'].name,
  tableFields: TABLE_MASTER['PRODUCT_VARIENT_COLOR_IMAGES'].fields,
  entityName: 'product varient color image',
  entityIdField: 'id',
  requiredFields: ['product_varient_color_id'],
  validations: {
    product_varient_color_id: { required: true },
  },
  defaults: {
    id: uuidv4,
  },
  fileConfig: {
    fileUrlField: 'image_url',
    uploadDir: 'public/products/{id}/colors/',
    imagesOnly: true,
  },
});
