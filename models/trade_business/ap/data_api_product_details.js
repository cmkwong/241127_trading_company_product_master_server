import { v4 as uuidv4 } from 'uuid';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../tables.js';
import { tradeBusinessDbc } from '../../dbModel.js';
import * as ApiProductFiles from './data_api_product_files.js';

export const apiProductDetailModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['API_PRODUCT_DETAILS'].name,
  tableFields: TABLE_MASTER['API_PRODUCT_DETAILS'].fields,
  entityName: 'api product detail',
  entityIdField: 'id',
  requiredFields: ['ap_invoice_id', 'purchase_product_detail_id'],
  defaults: { id: uuidv4 },
  childTableConfig: [
    {
      tableName: TABLE_MASTER['API_PRODUCT_FILES'].name,
      model: ApiProductFiles.apiProductFileModel,
    },
  ],
});
