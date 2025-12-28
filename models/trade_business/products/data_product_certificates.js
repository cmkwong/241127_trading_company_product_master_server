import AppError from '../../../utils/appError.js';
import { v4 as uuidv4 } from 'uuid';
import { TABLE_MASTER } from '../../tables.js';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import * as CertificateFiles from './data_product_certificate_files.js';
import { tradeBusinessDbc } from '../../dbModel.js';

// Create a data model utility for product certificates
export const certificateModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['PRODUCT_CERTIFICATES'].name,
  tableFields: TABLE_MASTER['PRODUCT_CERTIFICATES'].fields,
  entityName: 'product certificate',
  requiredFields: ['product_id', 'certificate_type_id'],
  validations: {
    name: { required: true },
    description: { required: false },
  },
  defaults: {
    id: uuidv4,
  },
  // Add relationship with child table (customization images)
  childTableConfig: [
    {
      tableName: TABLE_MASTER['PRODUCT_CERTIFICATE_FILES'].name,
      // connectedKeys: { id: 'customization_id' }, // parent table -> child table
      // foreignKey: 'certificate_id',
      model: CertificateFiles.certificateFileModel,
    },
  ],
});
