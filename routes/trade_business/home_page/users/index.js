import express from 'express';
import dataRoutes from './data/index.js';
import tableRoutes from './table/index.js';
import passwordRoutes from './password/index.js';
import signupRoutes from './signup/index.js';

const router = express.Router();

// Public self-service registration routes
router.use('/signup', signupRoutes);

// User table routes
router.use('/table', tableRoutes);

// User password routes
router.use('/password', passwordRoutes);

// User data routes
router.use('/data', dataRoutes);

export default router;