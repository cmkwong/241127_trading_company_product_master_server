import { v4 as uuidv4 } from 'uuid';
import DataModelUtils from '../../../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../../tables.js';
import { tradeBusinessDbc } from '../../../dbModel.js';

export const userRfqAttachmentModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['USER_RFQ_ATTACHMENTS'].name,
  tableFields: TABLE_MASTER['USER_RFQ_ATTACHMENTS'].fields,
  entityName: 'user rfq attachment',
  entityIdField: 'id',
  requiredFields: ['rfq_id', 'file_name', 'file_url'],
  validations: {
    rfq_id: { required: true },
    file_name: { required: true },
    file_url: { required: true },
  },
  defaults: { id: uuidv4 },
  fileConfig: {
    fileUrlField: 'file_url',
    uploadDir: 'public/users/{id}/rfqs/',
    fileTypeField: 'file_type',
    descriptionField: 'description',
    imagesOnly: false,
  },
});