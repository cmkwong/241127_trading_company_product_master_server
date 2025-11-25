import catchAsync from '../utils/catchAsync.js';

const startController = catchAsync(async (req, res, next) => {
  // define the variables to print out in response
  res.prints = {};
  next();
});

export default startController;
