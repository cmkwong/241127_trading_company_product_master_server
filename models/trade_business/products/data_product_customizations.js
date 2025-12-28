import { v4 as uuidv4 } from 'uuid';
import { PRODUCT_TABLE_MASTER } from '../../tables.js';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import * as CustomizationImages from './data_product_customization_images.js';
import { tradeBusinessDbc } from '../../dbModel.js';

// Create a data model utility for product customizations
export const customizationModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: PRODUCT_TABLE_MASTER['PRODUCT_CUSTOMIZATIONS'].name,
  tableFields: PRODUCT_TABLE_MASTER['PRODUCT_CUSTOMIZATIONS'].fields,
  entityName: 'customization',
  requiredFields: ['product_id', 'name'],
  validations: {
    name: { required: true },
    code: { required: false },
    remark: { required: false },
  },
  defaults: {
    id: uuidv4,
  },
  // Add relationship with child table (customization images)
  childTableConfig: [
    {
      tableName: PRODUCT_TABLE_MASTER['PRODUCT_CUSTOMIZATION_IMAGES'].name,
      model: CustomizationImages.customizationImageModel,
    },
  ],
});
