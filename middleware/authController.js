import { promisify } from 'util';
import jwt from 'jsonwebtoken';

import { tradeBusinessDbc } from '../MVC/models/dbModel.js';
import {
  getAuthByUserId,
  verifyPassword,
} from '../MVC/models/trade_business/home_page/users/data_user_auths.js';
import { getPrimaryRoleByUserId } from '../MVC/models/trade_business/home_page/users/data_user_roles.js';
import * as time from '../utils/time.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
    },
  );
};

// Get the user (authenticate against the trade_business `users` table and
// verify the bcrypt password stored in `user_auths`). The legacy `getToken`
// flow accepted a `username`; in the current schema the login identifier is the
// user's email address, so `username` is treated as the email.
export const getUser = async (email, password) => {
  const normalized = String(email ?? '').trim().toLowerCase();
  if (!normalized || !password) return [];

  const rows = await tradeBusinessDbc.executeQuery(
    'SELECT id, email, display_name, first_name, last_name, status FROM users WHERE email = ? LIMIT 1;',
    [normalized],
  );
  const user = rows?.[0];
  if (!user) return [];

  const auth = await getAuthByUserId(user.id);
  if (!auth) return [];

  const ok = await verifyPassword(password, auth.password_hash);
  if (!ok) return [];

  return [user];
};

export const getUserRole = async (identifier) => {
  if (!identifier) return null;
  const value = String(identifier).trim();
  if (!value) return null;

  // Resolve the user id from either a raw id or an email address.
  let userId = value;
  if (!UUID_PATTERN.test(value)) {
    const rows = await tradeBusinessDbc.executeQuery(
      'SELECT id FROM users WHERE email = ? LIMIT 1;',
      [value.toLowerCase()],
    );
    userId = rows?.[0]?.id || null;
  }
  if (!userId) return null;

  return getPrimaryRoleByUserId(userId);
};

// Get the token
export const getToken = catchAsync(async (req, res, next) => {
  const { username, password, payload } = req.body;
  const identifier = String(username ?? req.body?.email ?? '').trim();

  if (!identifier || !password) {
    res.status(400).json({
      status: 'failed',
      msg: 'Please provide username/email and password',
    });
    return;
  }

  const matched = await getUser(identifier, password);
  if (matched.length === 0) {
    res.status(404).json({
      status: 'failed',
      msg: 'Wrong user / wrong password',
    });
  } else {
    const role = await getPrimaryRoleByUserId(matched[0].id);
    const [currentDate, currentTime] = time.getCurrentTimeStr();
    const token = signToken(
      `${identifier};${payload};${currentDate} ${currentTime}`,
    );
    res.prints = {
      username: identifier,
      role,
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
        new AppError('User authentication required for this operation', 401),
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
        roles.includes(userRole),
      );

      if (!hasPermission) {
        return next(
          new AppError(
            'You do not have permission to perform this action',
            403,
          ),
        );
      }
    }
    // If user has a single role (as a string)
    else if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403),
      );
    }

    // If we reach here, the user has the required role(s)
    next();
  };
};

// Soft authentication for public routes (e.g. the home page).
// Attaches req.user when a valid Bearer/cookie token is present, but never
// blocks the request: anonymous visitors proceed as guests.
export const optionalAuth = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(); // guest
  }

  try {
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const { payload } = decoded;
    if (payload) {
      const [currentUser] = payload.split(';');
      req.user = { name: currentUser };
    }
  } catch (error) {
    // Invalid or expired token: treat the visitor as a guest instead of
    // failing the public page.
  }

  next();
});
