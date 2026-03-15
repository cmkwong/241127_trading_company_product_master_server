import { v4 as uuidv4 } from 'uuid';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../tables.js';
import { tradeBusinessDbc } from '../../dbModel.js';
import * as ApiShippingFiles from './data_api_shipping_files.js';

export const apiShippingDetailModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['API_SHIPPING_DETAILS'].name,
  tableFields: TABLE_MASTER['API_SHIPPING_DETAILS'].fields,
  entityName: 'api shipping detail',
  entityIdField: 'id',
  requiredFields: ['ap_invoice_id', 'purchase_shipping_detail_id'],
  defaults: { id: uuidv4 },
  childTableConfig: [
    {
      tableName: TABLE_MASTER['API_SHIPPING_FILES'].name,
      model: ApiShippingFiles.apiShippingFileModel,
    },
  ],
});
