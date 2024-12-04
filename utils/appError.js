class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = false; // not shown the stack trace

    Error.captureStackTrace(this, this.constructor); // creates the stack property on an Error instance., #114 0617
  }
}

export default AppError;
