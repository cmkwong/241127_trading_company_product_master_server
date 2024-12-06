import express from 'express';
// import ssme from '../controller/workflowController/ssme';
import * as report_comparison from '../controller/ssmeController/report_comparison.js';
import * as sysController from '../controller/sysController.js';
import * as authController from '../controller/authController.js';
import * as pythonServerController from '../controller/pythonServerController.js';

const router = express.Router();

// report (request by workflow - ssme compare report)
router.route('/ssme/bysite/integrate').post(
  authController.protect,
  pythonServerController.getComparedReportPlots, // call python server to generate the plotting
  report_comparison.getComparedOutReportData, // get required data from workflow database
  report_comparison.getComparedAssumptionText, // get required data from workflow database
  report_comparison.getMoveFromToFileArr, // build the move file array path
  sysController.moveFiles, // move files to distination
  report_comparison.generateSsmeCompareReport // integrate any plots into report
);
router
  .route('/ssme/plot')
  .post(authController.protect, report_comparison.getSsmePlot);

export default router;
