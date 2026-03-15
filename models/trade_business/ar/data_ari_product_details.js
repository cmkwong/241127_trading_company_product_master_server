import { v4 as uuidv4 } from 'uuid';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../tables.js';
import { tradeBusinessDbc } from '../../dbModel.js';
import * as AriProductFiles from './data_ari_product_files.js';

export const ariProductDetailModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['ARI_PRODUCT_DETAILS'].name,
  tableFields: TABLE_MASTER['ARI_PRODUCT_DETAILS'].fields,
  entityName: 'ari product detail',
  entityIdField: 'id',
  requiredFields: ['ar_invoice_id', 'sales_product_detail_id'],
  defaults: { id: uuidv4 },
  childTableConfig: [
    {
      tableName: TABLE_MASTER['ARI_PRODUCT_FILES'].name,
      model: AriProductFiles.ariProductFileModel,
    },
  ],
});
