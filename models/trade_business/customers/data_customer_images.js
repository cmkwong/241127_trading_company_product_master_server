import { TABLE_MASTER } from '../../tables.js';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import { tradeBusinessDbc } from '../../dbModel.js';
import { v4 as uuidv4 } from 'uuid';

export const customerImageModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['CUSTOMER_IMAGES'].name,
  tableFields: TABLE_MASTER['CUSTOMER_IMAGES'].fields,
  entityName: 'customer image',
  entityIdField: 'id',
  requiredFields: ['customer_id', 'image_type_id', 'image_name'],
  validations: {
    customer_id: { required: true },
    image_type_id: { required: true },
    image_name: { required: true },
  },
  defaults: {
    id: uuidv4,
  },
  fileConfig: {
    fileUrlField: 'image_url',
    uploadDir: 'public/customers/{id}/images/',
    imagesOnly: true,
  },
});
