import express from 'express';
import { optionalAuth } from '../../../middleware/authController.js';
import productRoutes from './products/index.js';
import userRoutes from './users/index.js';

const router = express.Router();

// Resolve the current user (if any) from the request token. Anonymous visitors
// are allowed and treated as guests.
router.use(optionalAuth);

// User profile / account routes (models, password, cart, favourites, etc.)
router.use('/users', userRoutes);

// Home page product details are served at both the root and under /products:
//   POST /     and POST /products      -> paginated product cards / by ids
//   GET  /:id  and GET  /products/:id  -> single product detail
router.use('/products', productRoutes);
router.use('/', productRoutes);

export default router;
