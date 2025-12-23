import { promisify } from 'util';
import jwt from 'jsonwebtoken';

import { authDbc } from '../models/dbModel.js'; // Use the singleton instance for the auth database
import * as time from '../utils/time.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

// Sign the token
export const signToken = (payload) => {
  return jwt.sign(
    {
      // Payload
      payload,
    },
    // Private key
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN, // Expiry time
    }
  );
};

// Get the user
export const getUser = async (username, password) => {
  const stmt = 'SELECT * FROM users;';
  const results = await authDbc.executeQuery(stmt); // Use authDbc instance
  // Find the matched user with name and password
  const matched = results.filter(
    (result) =>
      result['username'] === username && result['password'] === password
  );
  return matched;
};

export const getUserRole = async (username) => {
  const stmt = 'SELECT * FROM users;';
  const results = await authDbc.executeQuery(stmt); // Use authDbc instance
  // Find the matched user with the username
  const matched = results.find((result) => result['username'] === username);
  return matched ? matched.role : null; // Return the role or null if not found
};

// Get the token
export const getToken = catchAsync(async (req, res, next) => {
  const { username, password, payload } = req.body;

  const matched = await getUser(username, password);
  if (matched.length === 0) {
    res.status(404).json({
      status: 'failed',
      msg: 'Wrong user / wrong password',
    });
  } else {
    const [currentDate, currentTime] = time.getCurrentTimeStr();
    const token = signToken(
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
    // 1) Get the token and check if it's there
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.jwt) {
      // This is for browser
      token = req.cookies.jwt;
    }

    if (!token) {
      return next(new AppError('You are not authorized!', 401));
    }

    // 2) Verify the token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check the payload and determine the user's role
    const { payload } = decoded;
    if (!payload) {
      return next(new AppError('The payload does not exist.', 401));
    }

    const [currentUser] = payload.split(';');
    const role = await getUserRole(currentUser); // Use getUserRole function

    if (!role) {
      req.user = { name: currentUser, role: 'user' }; // Default to user role if none found
    } else {
      req.user = { name: currentUser, role };
    }

    next();
  } catch (error) {
    return next(new AppError(`Authentication error: ${error.message}`, 401));
  }
});

// restrict the user role
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    // Check if user object exists
    if (!req.user) {
      return next(
        new AppError('User authentication required for this operation', 401)
      );
    }

    // Check if user has a role property
    if (!req.user.role) {
      return next(new AppError('User role information is missing', 403));
    }

    // If user has multiple roles (as an array)
    if (Array.isArray(req.user.role)) {
      // Check if any of the user's roles are allowed
      const hasPermission = req.user.role.some((userRole) =>
        roles.includes(userRole)
      );

      if (!hasPermission) {
        return next(
          new AppError('You do not have permission to perform this action', 403)
        );
      }
    }
    // If user has a single role (as a string)
    else if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    // If we reach here, the user has the required role(s)
    next();
  };
};
