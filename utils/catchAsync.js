const catchAsync = (fn) => {
  // why return the function? Because we do not want to execute the function immediately. #115 0525
  return (req, res, next) => {
    // if busy name is included, reset the busy status
    // if (global.busy['compareReport'] === 'compareReport') {
    // }
    fn(req, res, next).catch(next); // next is error: next(err)
    /*  because async is returning a Promise
        So, we can catch the error right after the function directly
    */
  };
};

export default catchAsync;
