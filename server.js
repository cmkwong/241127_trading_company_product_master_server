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

// require routes
// import authRouter from './routes/authRoutes.js';
// import viewRouter from './routes/viewRoutes.js';
// import workflowRouter from './routes/workflowRoutes.js';
// import erpRouter from './routes/erpRoutes.js';
// import ssmeRouter from './routes/ssmeRoutes.js';
// import wsRouter from './routes/websupervisorRoutes.js';
// import machineRouter from './routes/machineRoutes.js';
// import reportRouter from './routes/reportRoutes.js';
// import sysRouter from './routes/sysRoutes.js';

// get dir
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const createServer = async () => {
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
  // app.use('/api/v1/auth', authRouter);
  // app.use('/api/v1/workflow', workflowRouter);
  // app.use('/api/v1/erp', erpRouter);
  // app.use('/api/v1/ssme', ssmeRouter);
  // app.use('/api/v1/ws', wsRouter);
  // app.use('/api/v1/machine', machineRouter);
  // app.use('/api/v1/report', reportRouter);
  // app.use('/api/v1/sys', sysRouter);
  app.use(endController);
  // error handler MIDDLEWARE
  app.use(errorController);

  const port = process.env.PORT;
  const server = app.listen(port, () => {
    logger.info(`App running on port ${port}`);
  });

  process.env.TZ = 'UTC+8';

  process.on('unhandledRejection', (err) => {
    logger.error(err);
    logger.error(err.name, '|', err.message);
    logger.error('UNHANDLED REJECTION, SHUTTING DOWN ...');
    server.close(() => {
      // give the server time to finish all the request
      process.exit(1);
    });
  });

  process.on('exit', function () {
    logger.info('About to close');
  });
};

createServer();
