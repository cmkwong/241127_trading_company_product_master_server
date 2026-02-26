import { v4 as uuidv4 } from 'uuid';
import { TABLE_MASTER } from '../../tables.js';
import { tradeBusinessDbc } from '../../dbModel.js';
import DataModelUtils from '../../../utils/dataModelUtils.js';

import * as CustomerNames from './data_customer_names.js';
import * as CustomerTypes from './data_customer_types.js';
import * as CustomerAddresses from './data_customer_addresses.js';
import * as CustomerContacts from './data_customer_contacts.js';
import * as CustomerImages from './data_customer_images.js';

export const customerModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['CUSTOMERS'].name,
  tableFields: TABLE_MASTER['CUSTOMERS'].fields,
  entityName: 'customer',
  entityIdField: 'id',
  requiredFields: ['customer_code'],
  validations: {
    customer_code: { required: true },
  },
  defaults: {
    id: uuidv4,
  },
  childTableConfig: [
    {
      tableName: TABLE_MASTER['CUSTOMER_NAMES'].name,
      model: CustomerNames.customerNameModel,
    },
    {
      tableName: TABLE_MASTER['CUSTOMER_TYPES'].name,
      model: CustomerTypes.customerTypeModel,
    },
    {
      tableName: TABLE_MASTER['CUSTOMER_ADDRESSES'].name,
      model: CustomerAddresses.customerAddressModel,
    },
    {
      tableName: TABLE_MASTER['CUSTOMER_CONTACTS'].name,
      model: CustomerContacts.customerContactModel,
    },
    {
      tableName: TABLE_MASTER['CUSTOMER_IMAGES'].name,
      model: CustomerImages.customerImageModel,
    },
  ],
});
