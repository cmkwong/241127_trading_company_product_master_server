import express from 'express';
import dataRoutes from './data/index.js';
import tableRoutes from './table/index.js';
import masterRoutes from './master/index.js';

const router = express.Router();

// Product table routes
router.use('/table', tableRoutes);

// Product data routes
router.use('/data', dataRoutes);

// Product master labels routes
router.use('/master', masterRoutes);

export default router;
