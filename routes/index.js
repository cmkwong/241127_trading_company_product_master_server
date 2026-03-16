import express from 'express';
import authRoutes from './trade_business/auths/index.js';
import productRoutes from './trade_business/products/index.js';
import supplierRoutes from './trade_business/suppliers/index.js';
import customerRoutes from './trade_business/customers/index.js';
import masterRoutes from './trade_business/master/index.js';
import salesRoutes from './trade_business/sales/index.js';
import arRoutes from './trade_business/ar/index.js';
import purchaseRoutes from './trade_business/purchase/index.js';
import apRoutes from './trade_business/ap/index.js';
import generalRoutes from './general/index.js';

const router = express.Router();

// Mount domain-specific routes
router.use('/trade_business/auth', authRoutes);
router.use('/trade_business/master', masterRoutes);
router.use('/trade_business/products', productRoutes);
router.use('/trade_business/suppliers', supplierRoutes);
router.use('/trade_business/customers', customerRoutes);
router.use('/trade_business/sales', salesRoutes);
router.use('/trade_business/ar', arRoutes);
router.use('/trade_business/purchase', purchaseRoutes);
router.use('/trade_business/ap', apRoutes);
router.use('/general', generalRoutes);

export default router;
