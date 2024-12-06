import express from 'express';
import * as ssme_monthlyReport from '../controller/ssmeController/report_monthly.js';
import * as ssme_unitValues from '../controller/ssmeController/unitValues.js';
import * as ssme_units from '../controller/ssmeController/units.js';
import * as ssme_general from '../controller/ssmeController/general.js';
import * as machineController from '../controller/machineController.js';
import * as serverController from '../controller/serverController.js';
import * as authController from '../controller/authController.js';
const router = express.Router();

// ------------------------ web-supervisor
// ----------- unit
router
  .route('/units/createTable')
  .get(authController.protect, ssme_units.createTable);
router
  .route('/units/fetchAndUpload')
  .get(
    authController.protect,
    machineController.getPlantnoAlliance,
    machineController.getPlantData,
    authController.fetchWsvToken,
    ssme_units.fetchUnit,
    ssme_units.uploadUnit
  );
router
  .route('/units/getAlive')
  .get(authController.protect, ssme_units.getUnitGuids);
router
  .route('/units/plantno')
  .get(
    authController.protect,
    ssme_general.checkPeriodList,
    machineController.getDistinctPlantno
  );

// ----------- unitValues
router
  .route('/unitValues/createTable')
  .get(authController.protect, ssme_unitValues.createUnitValuesTable);
router
  .route('/unitValues/fetchAndUpload')
  .get(
    authController.protect,
    ssme_units.getUnitGuids,
    ssme_unitValues.fetchAndUploadUnitValues
  );
router
  .route('/unitValues/upload')
  .post(authController.protect, ssme_unitValues.upload);
router
  .route('/unitValues/get')
  .get(
    authController.protect,
    ssme_general.checkPeriodList,
    serverController.checkStreaming,
    ssme_unitValues.getUnitValuesAPI
  );
// ssme name upload
router
  .route('/unitValues/ssmename')
  .post(authController.protect, ssme_general.upload_ssmename);
// ----------- unitValues live
router
  .route('/unitValues/live/fetch')
  .get(
    authController.protect,
    ssme_units.getUnitGuids,
    authController.fetchWsvToken,
    ssme_unitValues.fetch_live_unitValues
  );
// ----------- others
router
  .route('/rowtotal')
  .get(authController.protect, ssme_unitValues.getRowTotal);
// monthly report processed data
router
  .route('/month/data')
  .post(
    authController.protect,
    ssme_monthlyReport.updateSsmeReportProcessedData
  );

export default router;
