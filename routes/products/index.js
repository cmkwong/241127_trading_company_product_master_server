import express from 'express';
import dataRoutes from './data/index.js';
import tableRoutes from './table/index.js';
import labelsRoutes from './labels/index.js';
import masterRoutes from './master/index.js';

const router = express.Router();

// Mount labels routes
router.use('/labels', labelsRoutes);

// Product table routes
router.route('/table', tableRoutes);

// Product data routes
router.route('/data', dataRoutes);

// Product master labels routes
router.route('/master', masterRoutes);

export default router;
