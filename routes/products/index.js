import express from 'express';
import dataRoutes from './data/index.js';
import tableRoutes from './table/index.js';

const router = express.Router();

// Product table routes
router.use('/table', tableRoutes);

// Product data routes
router.use('/data', dataRoutes);

export default router;
