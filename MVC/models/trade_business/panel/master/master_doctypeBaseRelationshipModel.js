import DataModelUtils from '../../../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../../tables.js';
import { tradeBusinessDbc } from '../../../dbModel.js';

// Create DataModelUtils instance for document type base relationships
export const doctypeBaseRelationshipModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['MASTER_DOCTYPE_BASE_RELATIONSHIP'].name,
  tableFields: TABLE_MASTER['MASTER_DOCTYPE_BASE_RELATIONSHIP'].fields,
  entityName: 'doctype_base_relationship',
  requiredFields: ['doctype_id', 'base_doctype_id'],
  validations: {
    doctype_id: { required: true },
    base_doctype_id: { required: true },
  },
});
