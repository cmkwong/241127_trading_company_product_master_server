import express from 'express';
import dataRoutes from './data/index.js';
import tableRoutes from './table/index.js';

const router = express.Router();

router.use('/table', tableRoutes);
router.use('/data', dataRoutes);

export default router;
