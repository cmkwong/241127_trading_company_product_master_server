import express from 'express';
import * as userController from '../../../../../MVC/controller/trade_business/home_page/users/data_usersController.js';
import * as authController from '../../../../../middleware/authController.js';
import endController from '../../../../../middleware/endController.js';

const router = express.Router();

router.use(authController.protect);

router
  .route('/')
  .get(
    authController.restrictTo('admin', 'manager', 'product-manager'),
    userController.getAllUsers,
  )
  .post(
    authController.restrictTo('admin', 'manager', 'product-manager'),
    userController.createUser,
    endController,
  );

router
  .route('/comparison-keys')
  .get(
    authController.restrictTo('admin', 'manager', 'product-manager'),
    userController.getUserComparisonKeys,
    endController,
  );

router.post(
  '/truncate',
  authController.restrictTo('admin'),
  userController.truncateUserTables,
);

router
  .route('/ids')
  .post(userController.getUserById, endController)
  .patch(userController.updateUser, endController)
  .delete(userController.deleteUser, endController);

export default router;