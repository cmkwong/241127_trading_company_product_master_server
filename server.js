import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

// setting env
dotenv.config({
  path: './.env',
});

// self class
import logger from './utils/logger.js';
import errorController from './controller/errorController.js';
import endController from './controller/endController.js';
import startController from './controller/startController.js';
import {
  verifyDatabaseConnections,
  closeAllConnections,
} from './utils/dbConn.js';

// require routes
import productRouter from './routes/productRoutes.js';

// get dir
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// set views pug path
app.set('view engine', 'pug'); // set the pug for filling the template
app.set('views', path.join(__dirname, 'views'));

//--------- Middleware stack ---------//
// Access-Control-Allow-Origin *
app.use(cors());
app.options('*', cors());

// 	Serve static files from a folder and not from a route.
app.use(express.static(path.join(__dirname, 'public')));

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '500Mb' }));
app.use(express.urlencoded({ extended: true, limit: '500Mb' })); // getting the user data from a form so updateUserData() (in viewsController) can be used, #194 0930
app.use(cookieParser());

app.use(compression()); // compress all the text that send to client

// ***************** ROUTES *****************//
// app.use('/', viewRouter); // middleware: root
app.use(startController);
app.use('/api/v1/product', productRouter);

app.use(endController);
// error handler MIDDLEWARE
app.use(errorController);

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
