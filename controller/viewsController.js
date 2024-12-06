import React from 'react';
import catchAsync from '../utils/catchAsync.js';

export const viewLogin = catchAsync(async (req, res, next) => {
  res.status(200);
});

export const view_ssmeapp = catchAsync(async (req, res, next) => {
  // res.render('./ssme/index.html');
  // res.sendfile('views/ssme/index.html');
  // res.sendfile('views/test/index.html');
  React.render('test/index.html');
});

export const viewCreditFacility = catchAsync(async (req, res, next) => {
  // const results = await mySQL.executeQuery(
  //   cf_tableModel.getCreditFacilityQuery
  // );
  // res.status(200).set('Content-Security-Policy').render('wf_cf_groupTable', {
  //   title: 'Credit Facility',
  //   creditFacilityRows: results,
  // });
});
