import express from 'express';
import authRoutes from './auths/index.js';
import productRoutes from './products/index.js';
import supplierRoutes from './suppliers/index.js';
import masterRoutes from './master/index.js';

const router = express.Router();

// Mount domain-specific routes
router.use('/auth', authRoutes);
router.use('/master', masterRoutes);
router.use('/products', productRoutes);
router.use('/suppliers', supplierRoutes);

export default router;
