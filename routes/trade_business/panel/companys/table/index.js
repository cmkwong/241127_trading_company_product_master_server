import express from 'express';
import * as tableController from '../../../../../MVC/controller/trade_business/panel/companys/tableController.js';
import {
  protect,
  restrictTo,
} from '../../../../../middleware/authController.js';
import endController from '../../../../../middleware/endController.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Restrict all table operations to admin users only
router.use(restrictTo('admin', 'system-admin', 'developer'));

// Route for creating all company tables
router.post('/create-all', tableController.createAllTables, endController);

// Routes for creating individual tables
router.post(
  '/create/companys',
  tableController.createCompanyTable,
  endController,
);
router.post(
  '/create/addresses',
  tableController.createCompanyAddressTable,
  endController,
);

// Route for dropping all company tables
router.delete('/drop-all', tableController.dropAllTables, endController);

// Route for checking if all company tables exist
router.get('/check-exists', tableController.checkTablesExist, endController);

// Route for getting schema information for all company tables
router.get('/schema', tableController.getTablesSchema, endController);

export default router;
