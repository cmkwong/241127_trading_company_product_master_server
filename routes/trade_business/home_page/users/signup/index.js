import express from 'express';
import * as userController from '../../../../../MVC/controller/trade_business/home_page/users/data_usersController.js';

const router = express.Router();

// Public self-service registration — no protect / restrictTo middleware.
router.post('/', userController.signupUser);

export default router;
