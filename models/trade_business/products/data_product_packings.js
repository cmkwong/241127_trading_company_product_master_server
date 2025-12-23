import { TABLE_MASTER } from '../../tables.js';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import { tradeBusinessDbc } from '../../dbModel.js';

// Create a data model utility for product packings
export const packingModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['PRODUCT_PACKINGS'].name,
  tableFields: TABLE_MASTER['PRODUCT_PACKINGS'].fields,
  entityName: 'product packing',
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
  joinConfig: [
    {
      joinTable: 'master_packing_types',
      joinField: 'packing_type_id',
      selectFields:
        'master_packing_types.name as packing_type_name, master_packing_types.description as packing_type_description',
      orderBy: 'packing_type_id',
    },
  ],
});
