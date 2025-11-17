import express from 'express';
import * as categoriesController from '../../../controller/trade_business/products/master_categoriesController.js';
import * as certificateTypesController from '../../../controller/trade_business/products/master_certificateTypesController.js';
import * as packingTypesController from '../../../controller/trade_business/products/master_packingTypesController.js';
import endController from '../../../controller/endController.js';

const router = express.Router();

// Category routes
router
  .route('/categories')
  .get(categoriesController.getAllCategories, endController)
  .post(categoriesController.createCategory, endController);

router
  .route('/categories/:id')
  .get(categoriesController.getCategoryById, endController)
  .patch(categoriesController.updateCategory, endController)
  .delete(categoriesController.deleteCategory, endController);

router.get(
  '/categories/:id/products',
  categoriesController.getProductsByCategory,
  endController
);
router.get(
  '/categories/:id/children',
  categoriesController.getChildCategories,
  endController
);
router.get(
  '/categories/:id/path',
  categoriesController.getCategoryPath,
  endController
);
router.get(
  '/category-tree',
  categoriesController.getCategoryTree,
  endController
);
router.post(
  '/categories/batch',
  categoriesController.batchCreateCategories,
  endController
);
router.post(
  '/categories/defaults',
  categoriesController.insertDefaultCategories,
  endController
);
router.get(
  '/categories/check-exists',
  categoriesController.checkCategoryExists,
  endController
);

// Certificate Types routes
router
  .route('/certificate-types')
  .get(certificateTypesController.getCertificateTypes, endController)
  .post(certificateTypesController.createCertificateType, endController);

router
  .route('/certificate-types/:id')
  .get(certificateTypesController.getCertificateTypes, endController)
  .patch(certificateTypesController.updateCertificateType, endController)
  .delete(certificateTypesController.deleteCertificateType, endController);

router.get(
  '/certificate-types/:id/products',
  certificateTypesController.getProductsByCertificateType,
  endController
);
router.post(
  '/certificate-types/defaults',
  certificateTypesController.insertDefaultCertificateTypes,
  endController
);
router.get(
  '/certificate-types/check-exists',
  certificateTypesController.checkCertificateTypeExists,
  endController
);

// Packing Types routes
router
  .route('/packing-types')
  .get(packingTypesController.getPackingTypes, endController)
  .post(packingTypesController.createPackingType, endController);

router
  .route('/packing-types/:id')
  .get(packingTypesController.getPackingTypes, endController)
  .patch(packingTypesController.updatePackingType, endController)
  .delete(packingTypesController.deletePackingType, endController);

router.get(
  '/packing-types/:id/products',
  packingTypesController.getProductsByPackingType,
  endController
);
router.get(
  '/packing-types/:id/statistics',
  packingTypesController.getPackingStatistics,
  endController
);
router.post(
  '/packing-types/defaults',
  packingTypesController.insertDefaultPackingTypes,
  endController
);
router.get(
  '/packing-types/check-exists',
  packingTypesController.checkPackingTypeExists,
  endController
);

export default router;
