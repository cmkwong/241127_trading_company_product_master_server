import { PRODUCT_TABLE_MASTER } from '../../tables.js';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import { tradeBusinessDbc } from '../../dbModel.js';
import { v4 as uuidv4 } from 'uuid';

// Create a data model utility for certificate files with file handling
export const certificateFileModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: PRODUCT_TABLE_MASTER['PRODUCT_CERTIFICATE_FILES'].name,
  tableFields: PRODUCT_TABLE_MASTER['PRODUCT_CERTIFICATE_FILES'].fields,
  entityName: 'certificate file',
  entityIdField: 'id',
  requiredFields: ['certificate_id'],
  validations: {
    certificate_id: { required: true },
    file_type: { required: true },
  },
  defaults: {
    id: uuidv4,
  },
  fileConfig: {
    fileUrlField: 'file_url',
    uploadDir: 'public/{id}/certificates/',
    fileTypeField: 'file_type',
    descriptionField: 'description',
    imagesOnly: false,
  },
});
