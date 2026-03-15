import express from 'express';
import authRoutes from './auths/index.js';
import productRoutes from './products/index.js';
import supplierRoutes from './suppliers/index.js';
import customerRoutes from './customers/index.js';
import masterRoutes from './master/index.js';
import salesRoutes from './sales/index.js';
import arRoutes from './ar/index.js';
import purchaseRoutes from './purchase/index.js';
import apRoutes from './ap/index.js';

const router = express.Router();

// Mount domain-specific routes
router.use('/auth', authRoutes);
router.use('/master', masterRoutes);
router.use('/products', productRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/customers', customerRoutes);
router.use('/sales', salesRoutes);
router.use('/ar', arRoutes);
router.use('/purchase', purchaseRoutes);
router.use('/ap', apRoutes);

export default router;
