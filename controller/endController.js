import catchAsync from '../utils/catchAsync.js';

const endController = catchAsync(async (req, res, next) => {
  // end pool if existed
  // for (const [connName, conn] of Object.entries(res.conns)) {
  //   // console.log('Before release: \n', conn);
  //   conn.release();
  //   // console.log('Afer release: \n', conn);
  // }
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
