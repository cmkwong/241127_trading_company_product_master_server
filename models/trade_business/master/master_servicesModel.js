import DataModelUtils from '../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../tables.js';
import { tradeBusinessDbc } from '../../dbModel.js';
import { masterServiceImageModel } from './master_serviceImagesModel.js';

// Create DataModelUtils instance for master services
export const masterServiceModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['MASTER_SERVICES'].name,
  tableFields: TABLE_MASTER['MASTER_SERVICES'].fields,
  entityName: 'master service',
  requiredFields: ['service_name'],
  validations: {
    service_name: { required: true },
  },
  childTableConfig: [
    {
      tableName: TABLE_MASTER['MASTER_SERVICE_IMAGES'].name,
      connectedKeys: { id: 'service_id' }, // parent table -> child table
      model: masterServiceImageModel,
    },
  ],
});
