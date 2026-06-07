import DataModelUtils from '../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../tables.js';
import { tradeBusinessDbc } from '../../dbModel.js';

export const companyInfoModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['MASTER_COMPANY_INFO'].name,
  tableFields: TABLE_MASTER['MASTER_COMPANY_INFO'].fields,
  entityName: 'company_info',
  requiredFields: ['company_name'],
  validations: {
    company_name: { required: true },
  },
  fileConfig: {
    fileUrlField: 'logo_icon_url',
    uploadDir: 'public/master/company_info/{id}/logo/',
    imagesOnly: true,
  },
});
