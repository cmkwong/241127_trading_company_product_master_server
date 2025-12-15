import DataModelUtils from '../../../utils/dataModelUtils.js';
import AppError from '../../../utils/appError.js';
import { TABLE_MASTER } from '../../tables.js';

// Create DataModelUtils instance for product name types
export const productImagesTypeModel = new DataModelUtils({
  tableName: TABLE_MASTER['MASTER_PRODUCT_IMAGE_TYPES'].name,
  entityName: 'product image type',
  entityIdField: 'id',
  requiredFields: ['name'],
  validations: {
    name: { required: true },
  },
});
