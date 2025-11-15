import dotenv from 'dotenv';
import logger from './utils/logger.js';
import {
  verifyDatabaseConnections,
  closeAllConnections,
} from './utils/dbConn.js';
import app from './app.js';

// setting env
dotenv.config({
  path: './.env',
});

const startServer = async () => {
  try {
    // Verify database connections at startup
    logger.info('Verifying database connections...');
    const dbConnectionStatus = await verifyDatabaseConnections();

    if (!dbConnectionStatus) {
      logger.error(
        'Database connection verification failed. Server startup aborted.'
      );
      process.exit(1);
    }

    logger.info('Database connections verified successfully.');

    const port = process.env.PORT || 3000;
    const server = app.listen(port, () => {
      logger.info(`App running on port ${port}`);
    });

    // Set timezone
    process.env.TZ = 'UTC+8';

    // Handle unhandled promise rejections
    process.on('unhandledRejection', async (err) => {
      logger.error(err);
      logger.error(err.name, '|', err.message);
      logger.error('UNHANDLED REJECTION, SHUTTING DOWN ...');
      // Close database connections before shutting down
      await closeAllConnections().catch((err) =>
        logger.error('Error closing DB connections:', err)
      );

      server.close(() => {
        // give the server time to finish all the request
        process.exit(1);
      });
    });

    // Handle SIGTERM signal
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received. Shutting down gracefully...');

      // Close database connections before shutting down
      await closeAllConnections().catch((err) =>
        logger.error('Error closing DB connections:', err)
      );

      server.close(() => {
        logger.info('Process terminated!');
      });
    });

    // Handle exit
    process.on('exit', function () {
      logger.info('About to close');
    });
  } catch (error) {
    logger.error('Error during server startup:', error);
    process.exit(1);
  }
};

startServer();
