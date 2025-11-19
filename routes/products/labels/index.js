import express from 'express';
import * as labelsController from '../../../controller/trade_business/products/labelsController.js';
import * as authController from '../../../middleware/authController.js';
import endController from '../../../middleware/endController.js';

const router = express.Router();
// In your routes file
router
  .route('/table')
  .get(
    authController.protect,
    labelsController.handleLabelOperation,
    endController
  )
  .post(
    authController.protect,
    labelsController.handleLabelOperation,
    endController
  );

router
  .route('/')
  .get(
    authController.protect,
    labelsController.handleLabelOperation,
    endController
  )
  .post(
    authController.protect,
    labelsController.handleLabelOperation,
    endController
  );

router
  .route('/:id')
  .get(
    authController.protect,
    labelsController.handleLabelOperation,
    endController
  )
  .put(
    authController.protect,
    labelsController.handleLabelOperation,
    endController
  )
  .patch(
    authController.protect,
    labelsController.handleLabelOperation,
    endController
  )
  .delete(
    authController.protect,
    labelsController.handleLabelOperation,
    endController
  );

export default router;
