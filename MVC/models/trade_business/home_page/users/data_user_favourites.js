import { v4 as uuidv4 } from 'uuid';
import DataModelUtils from '../../../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../../tables.js';
import { tradeBusinessDbc } from '../../../dbModel.js';

export const userFavouriteModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['USER_FAVOURITES'].name,
  tableFields: TABLE_MASTER['USER_FAVOURITES'].fields,
  entityName: 'user favourite',
  entityIdField: 'id',
  requiredFields: ['user_id', 'product_id'],
  validations: {
    user_id: { required: true },
    product_id: { required: true },
  },
  defaults: { id: uuidv4 },
});