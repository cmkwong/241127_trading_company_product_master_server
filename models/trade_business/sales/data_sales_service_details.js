import { v4 as uuidv4 } from 'uuid';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../tables.js';
import { tradeBusinessDbc } from '../../dbModel.js';
import * as SalesServiceImages from './data_sales_service_detail_images.js';
import * as SalesServiceInternalImages from './data_sales_service_detail_internal_images.js';

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
      tableName: TABLE_MASTER['SALES_SERVICE_DETAIL_IMAGES'].name,
      model: SalesServiceImages.salesServiceDetailImageModel,
    },
    {
      tableName: TABLE_MASTER['SALES_SERVICE_DETAIL_INTERNAL_IMAGES'].name,
      model: SalesServiceInternalImages.salesServiceDetailInternalImageModel,
    },
  ],
});
