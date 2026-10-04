import { v4 as uuidv4 } from 'uuid';
import DataModelUtils from '../../../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../../tables.js';
import { tradeBusinessDbc } from '../../../dbModel.js';

import * as UserRfqItems from './data_user_rfq_items.js';
import * as UserRfqAttachments from './data_user_rfq_attachments.js';

export const userRfqModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['USER_RFQS'].name,
  tableFields: TABLE_MASTER['USER_RFQS'].fields,
  entityName: 'user rfq',
  entityIdField: 'id',
  requiredFields: ['user_id', 'rfq_number'],
  validations: {
    user_id: { required: true },
    rfq_number: { required: true },
  },
  defaults: { id: uuidv4 },
  childTableConfig: [
    {
      tableName: TABLE_MASTER['USER_RFQ_ITEMS'].name,
      model: UserRfqItems.userRfqItemModel,
    },
    {
      tableName: TABLE_MASTER['USER_RFQ_ATTACHMENTS'].name,
      model: UserRfqAttachments.userRfqAttachmentModel,
    },
  ],
});