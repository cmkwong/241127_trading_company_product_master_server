import { v4 as uuidv4 } from 'uuid';
import DataModelUtils from '../../../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../../tables.js';
import { tradeBusinessDbc } from '../../../dbModel.js';

import * as UserAuths from './data_user_auths.js';
import * as UserRoles from './data_user_roles.js';
import * as UserAddresses from './data_user_addresses.js';
import * as UserCarts from './data_user_carts.js';
import * as UserFavourites from './data_user_favourites.js';
import * as UserProductHistory from './data_user_product_history.js';
import * as UserRfqs from './data_user_rfqs.js';
import * as UserMemberships from './data_user_memberships.js';
import * as UserNotifications from './data_user_notifications.js';

export const userModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['USERS'].name,
  tableFields: TABLE_MASTER['USERS'].fields,
  entityName: 'user',
  entityIdField: 'id',
  requiredFields: ['user_name', 'email', 'display_name'],
  validations: {
    user_name: { required: true },
    email: { required: true },
    display_name: { required: true },
  },
  defaults: { id: uuidv4 },
  childTableConfig: [
    {
      tableName: TABLE_MASTER['USER_AUTHS'].name,
      model: UserAuths.userAuthModel,
    },
    {
      tableName: TABLE_MASTER['USER_ROLES'].name,
      model: UserRoles.userRoleModel,
    },
    {
      tableName: TABLE_MASTER['USER_ADDRESSES'].name,
      model: UserAddresses.userAddressModel,
    },
    {
      tableName: TABLE_MASTER['USER_CARTS'].name,
      model: UserCarts.userCartModel,
    },
    {
      tableName: TABLE_MASTER['USER_FAVOURITES'].name,
      model: UserFavourites.userFavouriteModel,
    },
    {
      tableName: TABLE_MASTER['USER_PRODUCT_HISTORY'].name,
      model: UserProductHistory.userProductHistoryModel,
    },
    {
      tableName: TABLE_MASTER['USER_RFQS'].name,
      model: UserRfqs.userRfqModel,
    },
    {
      tableName: TABLE_MASTER['USER_MEMBERSHIPS'].name,
      model: UserMemberships.userMembershipModel,
    },
    {
      tableName: TABLE_MASTER['USER_NOTIFICATIONS'].name,
      model: UserNotifications.userNotificationModel,
    },
  ],
});