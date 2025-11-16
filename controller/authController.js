import { promisify } from 'util';
import jwt from 'jsonwebtoken';

import * as dbConn from '../utils/dbConn.js';
import * as time from '../utils/time.js';
import * as auth from '../utils/auth.js';
import * as dbModel from '../models/dbModel.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

// sign the token
export const signToken = (payload) => {
  return jwt.sign(
    {
      // playload
      payload,
    },
    // private key
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN, // expired_in
    }
  );
};

// get the user
export const getUser = async (pool, username, password) => {
  let stmt = 'SELECT * FROM users;';
  let results = await dbModel.executeQuery(pool, stmt);
  // find the matched user with name and password
  let matched = results.filter((result) => {
    return result['username'] === username && result['password'] === password;
  });
  if (matched.length === 0) {
    return matched;
  } else {
    return matched;
  }
};

export const getUserRole = async (username, pool) => {
  let stmt = 'SELECT * FROM users;';
  let results = await dbModel.executeQuery(pool, stmt);
  // find the matched user with name and password
  let matched = results.filter((result) => {
    return result['username'] === username;
  });
  if (matched.length === 0) {
    return null; // Return null if no user is found
  } else {
    return matched[0].role; // Return the role of the first matched user
  }
};

// get the token
export const getToken = catchAsync(async (req, res, next) => {
  // get pool
  const pool = dbConn.auth_pool;

  // get req body
  let { username, password, payload } = req.body;

  let matched = await getUser(pool, username, password);
  if (matched.length === 0) {
    res.status(404).json({
      status: 'failed',
      msg: 'Wrong user / wrong password',
    });
  } else {
    let [currentDate, currentTime] = time.getCurrentTimeStr();
    let token = signToken(
      `${username};${payload};${currentDate} ${currentTime}`
    );
    res.prints = {
      token,
    };
    next();
  }
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  // 2) check if user exists && password is correct
  const user = await User.findOne({ email: email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3) If everything ok, send token to client
  createSendToken(req, res);
});

export const logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    // dumming text
    expires: new Date(Date.now() + 10 * 1000), // very short time to expire
    httpOnly: true,
  });
  next();
};

export const protect = catchAsync(async (req, res, next) => {
  try {
    let token;
    // 1) Getting token and check of its there
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.jwt) {
      // this is for browser
      token = req.cookies.jwt;
    }

    if (!token) {
      return next(new AppError('You are not authorized!', 401));
    }

    // 2) Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check payload still exists and belong to which role
    const { payload } = decoded;
    if (!payload) {
      return next(new AppError('The payload is not existed.', 401));
    }

    let [currentUser, userPayload, currenttime] = payload.split(';');

    // GRANT ACCESS to PROTECTED ROUTE
    let role = await getUserRole(currentUser, dbConn.auth_pool); // Use auth_pool

    // Add proper error handling for role
    if (!role) {
      req.user = { name: currentUser, role: 'user' }; // Default to user role if none found
    } else {
      req.user = { name: currentUser, role: role };
    }

    next();
  } catch (error) {
    return next(new AppError(`Authentication error: ${error.message}`, 401));
  }
});

// restrict the user role
export const restrictTo = (...roles) => {
  // cannot pass the parameter into middleware directly
  return (req, res, next) => {
    //roles ['admin', 'lead-guide']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};
