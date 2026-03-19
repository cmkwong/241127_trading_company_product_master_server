import { v4 as uuidv4 } from 'uuid';
import { TABLE_MASTER } from '../../tables.js';
import { tradeBusinessDbc } from '../../dbModel.js';
import DataModelUtils from '../../../utils/dataModelUtils.js';

// Import related supplier data models
import * as SupplierAddresses from './data_supplier_addresses.js';
import * as SupplierContacts from './data_supplier_contacts.js';
import * as SupplierLinks from './data_supplier_links.js';
import * as SupplierServices from './data_supplier_services.js';
import * as SupplierTypes from './data_supplier_types.js';

// Create a data model utility for suppliers
export const supplierModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['SUPPLIERS'].name,
  tableFields: TABLE_MASTER['SUPPLIERS'].fields,
  entityName: 'supplier',
  entityIdField: 'id',
  requiredFields: ['supplier_code', 'name'],
  validations: {
    supplier_code: { required: true },
    name: { required: true },
  },
  defaults: {
    id: uuidv4,
  },
  childTableConfig: [
    {
      tableName: TABLE_MASTER['SUPPLIER_TYPES'].name,
      model: SupplierTypes.supplierTypeModel,
    },
    {
      tableName: TABLE_MASTER['SUPPLIER_ADDRESSES'].name,
      model: SupplierAddresses.supplierAddressModel,
    },
    {
      tableName: TABLE_MASTER['SUPPLIER_CONTACTS'].name,
      model: SupplierContacts.supplierContactModel,
    },
    {
      tableName: TABLE_MASTER['SUPPLIER_LINKS'].name,
      model: SupplierLinks.supplierLinkModel,
    },
    {
      tableName: TABLE_MASTER['SUPPLIER_SERVICES'].name,
      model: SupplierServices.supplierServiceModel,
    },
  ],
});
