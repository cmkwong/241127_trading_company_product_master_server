import { TABLE_MASTER } from '../../../tables.js';
import DataModelUtils from '../../../../../utils/dataModelUtils.js';
import { tradeBusinessDbc } from '../../../dbModel.js';
import { v4 as uuidv4 } from 'uuid';

// Create a data model utility for company addresses
export const companyAddressModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['COMPANY_ADDRESS'].name,
  tableFields: TABLE_MASTER['COMPANY_ADDRESS'].fields,
  entityName: 'company address',
  entityIdField: 'id',
  requiredFields: ['company_id', 'address_type_id', 'address_line1'],
  validations: {
    company_id: { required: true },
    address_type_id: { required: true },
    address_line1: { required: true },
  },
  defaults: {
    id: uuidv4,
  },
});
