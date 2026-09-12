import DataModelUtils from '../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../tables.js';
import { tradeBusinessDbc } from '../../dbModel.js';

// Create DataModelUtils instance for membership tiers
export const membershipTierModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['MASTER_MEMBERSHIP_TIERS'].name,
  tableFields: TABLE_MASTER['MASTER_MEMBERSHIP_TIERS'].fields,
  entityName: 'membership_tier',
  requiredFields: ['name'],
  validations: {
    name: { required: true },
  },
});
