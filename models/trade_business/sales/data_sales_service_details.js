import { v4 as uuidv4 } from 'uuid';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../tables.js';
import { tradeBusinessDbc } from '../../dbModel.js';
import * as SalesServiceImageSelections from './data_sales_service_detail_image_selections.js';

export const salesServiceDetailModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['SALES_SERVICE_DETAILS'].name,
  tableFields: TABLE_MASTER['SALES_SERVICE_DETAILS'].fields,
  entityName: 'sales service detail',
  entityIdField: 'id',
  requiredFields: ['sales_quotation_id', 'service_id'],
  defaults: { id: uuidv4 },
  childTableConfig: [
    {
      tableName: TABLE_MASTER['SALES_SERVICE_DETAIL_IMAGE_SELECTIONS'].name,
      model: SalesServiceImageSelections.salesServiceDetailImageSelectionModel,
    },
  ],
});
