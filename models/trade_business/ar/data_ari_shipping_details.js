import { v4 as uuidv4 } from 'uuid';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../tables.js';
import { tradeBusinessDbc } from '../../dbModel.js';
import * as AriShippingFiles from './data_ari_shipping_files.js';

export const ariShippingDetailModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['ARI_SHIPPING_DETAILS'].name,
  tableFields: TABLE_MASTER['ARI_SHIPPING_DETAILS'].fields,
  entityName: 'ari shipping detail',
  entityIdField: 'id',
  requiredFields: ['ar_invoice_id', 'sales_shipping_detail_id'],
  defaults: { id: uuidv4 },
  childTableConfig: [
    {
      tableName: TABLE_MASTER['ARI_SHIPPING_FILES'].name,
      model: AriShippingFiles.ariShippingFileModel,
    },
  ],
});
