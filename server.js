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
// import errorController from './controller/errorController.js';
// import endController from './controller/endController.js';
// import startController from './controller/startController.js';
