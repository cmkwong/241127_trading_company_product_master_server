import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'node:url';

// self class
import errorController from './controller/errorController.js';
import endController from './controller/endController.js';
import startController from './controller/startController.js';

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

// Serve static files from a folder and not from a route.
app.use(express.static(path.join(__dirname, 'public')));

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '500Mb' }));
app.use(express.urlencoded({ extended: true, limit: '500Mb' })); // getting the user data from a form
app.use(cookieParser());

app.use(compression()); // compress all the text that send to client

// ***************** ROUTES *****************//
// app.use('/', viewRouter); // middleware: root
app.use(startController);
app.use('/api/v1/product', productRouter);

app.use(endController);
// error handler MIDDLEWARE
app.use(errorController);

export default app;
