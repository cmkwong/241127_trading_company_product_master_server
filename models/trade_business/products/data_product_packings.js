import { TABLE_MASTER } from '../../tables.js';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import { tradeBusinessDbc } from '../../dbModel.js';
import { packingImagesModel } from './data_product_packing_images.js';

// Create a data model utility for product packings
export const packingModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['PRODUCT_PACKINGS'].name,
  tableFields: TABLE_MASTER['PRODUCT_PACKINGS'].fields,
  entityName: 'product packing',
  entityIdField: 'id',
  requiredFields: [
    'product_id',
    'packing_type_id',
    'length',
    'width',
    'height',
    'weight',
  ],
  validations: {
    length: { min: 0, required: true },
    width: { min: 0, required: true },
    height: { min: 0, required: true },
    weight: { min: 0, required: true },
    packing_type_id: { required: true },
  },
  defaults: {
    quantity: 1,
  },
  childTableConfig: [
    {
      tableName: TABLE_MASTER['PRODUCT_PACKING_IMAGES'].name,
      connectedKeys: { id: 'packingId' }, // parent table -> child table
      model: packingImagesModel,
    },
  ],
});
