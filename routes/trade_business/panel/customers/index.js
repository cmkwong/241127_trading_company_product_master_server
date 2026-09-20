import express from 'express';
import dataRoutes from './data/index.js';
import tableRoutes from './table/index.js';

const router = express.Router();

// Customer table routes
router.use('/table', tableRoutes);

// Customer data routes
router.use('/data', dataRoutes);

export default router;
