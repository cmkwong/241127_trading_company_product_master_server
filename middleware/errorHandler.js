import logger from '../utils/logger.js';

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  const originalUrl = String(req?.originalUrl || '');
  const isMissingPublicFile =
    err.statusCode === 404 && originalUrl.startsWith('/public/');

  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stackTrace: err.stack,
    });
  } else {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  if (isMissingPublicFile) {
    logger.warn(`Missing public file: ${originalUrl}`);
    return;
  }

  logger.error(`${err.stack}`.substring(0, 2000));
};

export default errorHandler;
