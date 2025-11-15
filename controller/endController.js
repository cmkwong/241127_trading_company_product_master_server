import catchAsync from '../utils/catchAsync.js';

const endController = catchAsync(async (req, res, next) => {
  // end and response to user
  if (!res.prints) {
    res.prints = {};
  }
  res.status(200).json({
    status: 'success',
    ...res.prints,
  });
});

export default endController;
