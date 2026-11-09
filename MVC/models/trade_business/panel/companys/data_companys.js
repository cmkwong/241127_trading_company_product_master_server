import { v4 as uuidv4 } from 'uuid';
import { TABLE_MASTER } from '../../../tables.js';
import { tradeBusinessDbc } from '../../../dbModel.js';
import DataModelUtils from '../../../../../utils/dataModelUtils.js';

import * as CompanyAddresses from './data_company_addresses.js';

// Create a data model utility for companys
export const companyModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['COMPANYS'].name,
  tableFields: TABLE_MASTER['COMPANYS'].fields,
  entityName: 'company',
  entityIdField: 'id',
  requiredFields: ['name'],
  validations: {
    name: { required: true },
    icon_url: { required: false },
  },
  defaults: {
    id: uuidv4,
  },
  fileConfig: {
    fileUrlField: 'icon_url',
    uploadDir: 'public/companys/{id}/icon/',
    imagesOnly: true,
  },
  childTableConfig: [
    {
      tableName: TABLE_MASTER['COMPANY_ADDRESS'].name,
      model: CompanyAddresses.companyAddressModel,
    },
  ],
});
