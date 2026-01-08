import { v4 as uuidv4 } from 'uuid';
import { PRODUCT_TABLE_MASTER } from '../../tables.js';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import { tradeBusinessDbc } from '../../dbModel.js';

// Create a data model utility for customization images with file handling
export const customizationImageModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: PRODUCT_TABLE_MASTER['PRODUCT_CUSTOMIZATION_IMAGES'].name,
  tableFields: PRODUCT_TABLE_MASTER['PRODUCT_CUSTOMIZATION_IMAGES'].fields,
  entityName: 'customization image',
  entityIdField: 'id',
  requiredFields: ['customization_id', 'image_url'],
  validations: {
    image_url: { required: true },
  },
  defaults: {
    id: uuidv4,
  },
  fileConfig: {
    fileUrlField: 'image_url',
    uploadDir: 'public/{id}/customizations/',
    imagesOnly: true,
  },
});
