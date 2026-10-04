import express from 'express';
import dataRoutes from './data/index.js';
import tableRoutes from './table/index.js';
import passwordRoutes from './password/index.js';

const router = express.Router();

// User table routes
router.use('/table', tableRoutes);

// User password routes
router.use('/password', passwordRoutes);

// User data routes
router.use('/data', dataRoutes);

export default router;