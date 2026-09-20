import express from 'express';
import authRoutes from './trade_business/panel/auths/index.js';
import productRoutes from './trade_business/panel/products/index.js';
import supplierRoutes from './trade_business/panel/suppliers/index.js';
import customerRoutes from './trade_business/panel/customers/index.js';
import masterRoutes from './trade_business/panel/master/index.js';
import salesRoutes from './trade_business/panel/sales/index.js';
import arRoutes from './trade_business/panel/ar/index.js';
import purchaseRoutes from './trade_business/panel/purchase/index.js';
import apRoutes from './trade_business/panel/ap/index.js';
import generalRoutes from './general/index.js';
import homeRoutes from './trade_business/home_page/index.js';

const router = express.Router();

// trade business panel routes
router.use('/trade_business/panel/auth', authRoutes);
router.use('/trade_business/panel/master', masterRoutes);
router.use('/trade_business/panel/products', productRoutes);
router.use('/trade_business/panel/suppliers', supplierRoutes);
router.use('/trade_business/panel/customers', customerRoutes);
router.use('/trade_business/panel/sales', salesRoutes);
router.use('/trade_business/panel/ar', arRoutes);
router.use('/trade_business/panel/purchase', purchaseRoutes);
router.use('/trade_business/panel/ap', apRoutes);

// trade business home-page routes
router.use('/trade_business/home_page', homeRoutes);

// general
router.use('/general', generalRoutes);

export default router;
