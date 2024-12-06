import catchAsync from '../utils/catchAsync.js';

const startController = catchAsync(async (req, res, next) => {
  // define the variables to print out in response
  res.prints = {};

  // getting connection to MySQL
  // res.conns = {};
  // res.conns['bpm'] = await dbConn.getConnection_from_pool(dbConn.bpm);
  // res.conns['bpm0'] = await dbConn.getConnection_from_pool(dbConn.bpm0);
  // res.conns['ssmeData'] = await dbConn.getConnection_from_pool(dbConn.ssmeData);
  // res.conns['ssmeGeneral'] = await dbConn.getConnection_from_pool(
  //   dbConn.ssmeGeneral
  // );
  next();
});

export default startController;
