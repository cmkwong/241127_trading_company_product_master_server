import DataModelUtils from '../../../utils/dataModelUtils.js';
import AppError from '../../../utils/appError.js';
import { TABLE_MASTER } from '../../tables.js';
import { tradeBusinessDbc } from '../../dbModel.js';

// Create DataModelUtils instance for master service images
export const masterServiceImageModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['MASTER_SERVICE_IMAGES'].name,
  tableFields: TABLE_MASTER['MASTER_SERVICE_IMAGES'].fields,
  entityName: 'master service image',
  requiredFields: ['service_id', 'image_name', 'image_url'],
  validations: {
    service_id: { required: true },
    image_name: { required: true },
    image_url: { required: true },
  },
  fileConfig: {
    fileUrlField: 'image_url',
    uploadDir: 'public/master/services/{id}/images/',
    imagesOnly: true,
  },
});
