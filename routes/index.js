import express from 'express';
import authRoutes from './auths/index.js';
import productRoutes from './products/index.js';
import supplierRoutes from './suppliers/index.js';

const router = express.Router();

// Mount domain-specific routes
router.use('/auth', authRoutes);
router.use('/product', productRoutes);
router.use('/supplier', supplierRoutes);

export default router;
