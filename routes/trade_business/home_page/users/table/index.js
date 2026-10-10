import express from 'express';
import * as tableController from '../../../../../MVC/controller/trade_business/home_page/users/tableController.js';
import {
  protect,
  restrictTo,
} from '../../../../../middleware/authController.js';
import endController from '../../../../../middleware/endController.js';

const router = express.Router();

router.use(protect);
router.use(restrictTo('admin', 'system-admin', 'developer'));

router.post('/create-all', tableController.createAllTables, endController);

router.post('/create/users', tableController.createUsersTable, endController);
router.post('/create/user-auths', tableController.createUserAuthsTable, endController);
router.post('/create/addresses', tableController.createUserAddressesTable, endController);
router.post('/create/carts', tableController.createUserCartsTable, endController);
router.post('/create/cart-items', tableController.createUserCartItemsTable, endController);
router.post('/create/favourites', tableController.createUserFavouritesTable, endController);
router.post('/create/product-history', tableController.createUserProductHistoryTable, endController);
router.post('/create/rfqs', tableController.createUserRfqsTable, endController);
router.post('/create/rfq-items', tableController.createUserRfqItemsTable, endController);
router.post('/create/rfq-attachments', tableController.createUserRfqAttachmentsTable, endController);
router.post('/create/memberships', tableController.createUserMembershipsTable, endController);
router.post('/create/notifications', tableController.createUserNotificationsTable, endController);
router.post('/create/payment-methods', tableController.createUserPaymentMethodsTable, endController);

router.delete('/drop-all', tableController.dropAllTables, endController);

router.get('/check-exists', tableController.checkTablesExist, endController);

router.get('/schema', tableController.getTablesSchema, endController);

export default router;