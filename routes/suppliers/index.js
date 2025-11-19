import express from 'express';
import * as authController from '../../middleware/authController.js';
import endController from '../../middleware/endController.js';
import schemaRoutes from './schema/index.js';

// Import supplier controller when available
// import * as supplierController from '../../controller/trade_business/suppliers/supplierController.js';

const router = express.Router();

// Mount schema routes
router.use('/schema', schemaRoutes);

// Placeholder for supplier data routes
router.route('/placeholder').get(
  authController.protect,
  (req, res, next) => {
    res.prints = { message: 'Supplier data routes to be implemented' };
    next();
  },
  endController
);

// Add supplier data routes here when controller is available

export default router;
