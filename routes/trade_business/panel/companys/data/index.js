import express from 'express';
import * as companyController from '../../../../../MVC/controller/trade_business/panel/companys/data_companysController.js';
import * as authController from '../../../../../middleware/authController.js';
import endController from '../../../../../middleware/endController.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authController.protect);

// Routes that don't require ID payload validation
router
  .route('/')
  .post(
    authController.restrictTo('admin', 'manager', 'product-manager'),
    companyController.createCompany,
    endController,
  );

router.post(
  '/list',
  authController.restrictTo('admin', 'manager', 'product-manager'),
  companyController.getAllCompanys,
);

// defaults / samples
router
  .route('/defaults')
  .post(
    authController.restrictTo('admin', 'manager', 'product-manager'),
    companyController.importDefaultCompanys,
    endController,
  );

router
  .route('/samples')
  .post(
    authController.restrictTo('admin', 'manager', 'product-manager'),
    companyController.importDefaultCompanys,
    endController,
  );

router
  .route('/comparison-keys')
  .get(
    authController.restrictTo('admin', 'manager', 'product-manager'),
    companyController.getCompanyComparisonKeys,
    endController,
  );

// Truncate all company data - ADMIN ONLY
router.post(
  '/truncate',
  authController.restrictTo('admin'),
  companyController.truncateCompanyTables,
  endController,
);

// Routes that require ID payload
router
  .route('/get/ids')
  .post(companyController.getCompanyById, endController);

router
  .route('/ids')
  .patch(companyController.updateCompany, endController)
  .delete(companyController.deleteCompany, endController);

export default router;
