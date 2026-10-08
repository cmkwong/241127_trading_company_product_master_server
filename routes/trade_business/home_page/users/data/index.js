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
  endController,
);

router
  .route('/ids')
  .post(
    authController.restrictTo('admin'),
    userController.getUserById,
    endController,
  )
  .patch(
    authController.restrictTo('admin'),
    userController.updateUser,
    endController,
  )
  .delete(
    authController.restrictTo('admin'),
    userController.deleteUser,
    endController,
  );

// Self-service: the logged-in user may read only their own record. The caller
// is identified solely by the verified token (their email address); no id or
// email is accepted from the request.
router.get(
  '/info',
  authController.restrictTo('user-self'),
  userController.getSelfUser,
  endController,
);

export default router;
