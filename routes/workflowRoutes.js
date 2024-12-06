import express from 'express';
import * as business_partner from '../controller/workflowController/business_partner.js';
import * as credit_facility from '../controller/workflowController/credit_facility.js';
import * as sysController from '../controller/sysController.js';
import * as jobsite from '../controller/workflowController/jobsite.js';
import * as general from '../controller/workflowController/general.js';
import * as reportController from '../controller/ssmeController/report_comparison.js';
import * as authController from '../controller/authController.js';
const router = express.Router();

router
  .route('/executeQuery')
  .post(authController.protect, general.executeQueryFromPost);
router
  .route('/blockSameBpCode')
  .post(authController.protect, business_partner.blockSameBpCodeProcess);
router
  .route('/salesDetail')
  .get(authController.protect, general.getSalesInfo, general.filter_salesInfo);
router
  .route('/user/department')
  .get(authController.protect, general.getStaffDepartment);
router
  .route('/table/processuid')
  .get(authController.protect, general.getProcessUID);
router
  .route('/creditfacility/pdf')
  .post(authController.protect, reportController.getCreditReport);
router
  .route('/creditfacility/table')
  .post(authController.protect, sysController.writeExcel);
router
  .route('/creditFacility')
  .get(authController.protect, credit_facility.getCreditFacilityBy);
router
  .route('/bpmaster/similarName')
  .post(authController.protect, business_partner.getBpSimilarName);
router.route('/bp').get(authController.protect, business_partner.getBpInfo);
router
  .route('/bp/permission')
  .get(authController.protect, business_partner.getBpPermission);
router
  .route('/bp/permitted')
  .get(authController.protect, business_partner.checkIfCustPermitted);
router
  .route('/bp/region')
  .get(authController.protect, business_partner.getBpRegion);
router
  .route('/bp/ledger')
  .get(authController.protect, business_partner.getBpLedger);
router
  .route('/bp/table')
  .post(authController.protect, sysController.writeExcel);
// called from python program
router
  .route('/renew/hkkeyproject')
  .post(authController.protect, jobsite.renewHkKeyProject);

export default router;
