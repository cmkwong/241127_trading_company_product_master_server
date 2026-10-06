import { v4 as uuidv4 } from 'uuid';
import DataModelUtils from '../../../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../../tables.js';
import { tradeBusinessDbc } from '../../../dbModel.js';

export const userRoleModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['USER_ROLES'].name,
  tableFields: TABLE_MASTER['USER_ROLES'].fields,
  entityName: 'user role',
  entityIdField: 'id',
  requiredFields: ['user_id', 'role'],
  validations: {
    user_id: { required: true },
    role: { required: true },
  },
  defaults: { id: uuidv4 },
});

/**
 * Fetch all roles assigned to a user.
 * @param {string} userId
 * @returns {Promise<string[]>} list of role values (empty when none)
 */
export const getRolesByUserId = async (userId) => {
  if (!userId) return [];
  const rows = await userRoleModel.executeQuery(
    `SELECT role FROM ${userRoleModel.tableName} WHERE user_id = ?;`,
    [userId],
  );
  return (rows || []).map((row) => row.role);
};

/**
 * Fetch the primary (first) role assigned to a user, or null when none.
 * @param {string} userId
 * @returns {Promise<string|null>}
 */
export const getPrimaryRoleByUserId = async (userId) => {
  const roles = await getRolesByUserId(userId);
  return roles?.[0] || null;
};
