import { promisify } from 'util';
import jwt from 'jsonwebtoken';

import { tradeBusinessDbc } from '../MVC/models/dbModel.js';
import {
  getAuthByUserId,
  verifyPassword,
} from '../MVC/models/trade_business/home_page/users/data_user_auths.js';
import { getPrimaryRoleByUserId } from '../MVC/models/trade_business/home_page/users/data_user_roles.js';
import { userModel } from '../MVC/models/trade_business/home_page/users/data_users.js';
import * as time from '../utils/time.js';
import { verifyFirebaseIdToken } from '../utils/firebaseAdmin.js';
import { sendMail } from '../utils/mailer.js';
import {
  signMagicLinkToken,
  verifyMagicLinkToken,
  readMagicLinkPurpose,
  buildMagicLink,
  MAGIC_LINK_PURPOSES,
} from '../utils/magicLink.js';
import { buildLoginMagicLinkEmail } from '../MVC/models/trade_business/mails/loginMagicLinkEmail.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import { securityConfig } from '../utils/securityConfig.js';
import logger from '../utils/logger.js';

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
      algorithm: 'HS256',
    },
  );
};

// Build the app's JWT payload string. The first `;`-delimited segment is the
// login identifier (email) that `protect`/`getUserRole` read back to resolve the
// user's role; the remaining segments are informational.
export const issueAppToken = (identifier, payload, tokenVersion = 0) => {
  const [currentDate, currentTime] = time.getCurrentTimeStr();
  return signToken(
    `${identifier};${payload ?? ''};${currentDate} ${currentTime};${tokenVersion}`,
  );
};

// Read the current per-user session version. Bumped on password change so that
// previously-issued JWTs stop being accepted.
export const getTokenVersionByUserId = async (userId) => {
  if (!userId) return 0;
  const rows = await tradeBusinessDbc.executeQuery(
    'SELECT token_version FROM users WHERE id = ? LIMIT 1;',
    [userId],
  );
  return Number(rows?.[0]?.token_version ?? 0) || 0;
};

// Get the user (authenticate against the trade_business `users` table and
// verify the bcrypt password stored in `user_auths`). The legacy `getToken`
// flow accepted a `username`; in the current schema the login identifier is the
// user's email address, so `username` is treated as the email.
export const getUser = async (email, password) => {
  const normalized = String(email ?? '')
    .trim()
    .toLowerCase();
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

// Resolve a user's id from either a raw UUID or an email address. Returns null
// when the identifier is empty or does not map to an existing user.
export const resolveUserId = async (identifier) => {
  if (!identifier) return null;
  const value = String(identifier).trim();
  if (!value) return null;

  if (UUID_PATTERN.test(value)) return value;

  const rows = await tradeBusinessDbc.executeQuery(
    'SELECT id FROM users WHERE email = ? LIMIT 1;',
    [value.toLowerCase()],
  );
  return rows?.[0]?.id || null;
};

export const getUserRole = async (identifier) => {
  const userId = await resolveUserId(identifier);
  if (!userId) return null;

  return getPrimaryRoleByUserId(userId);
};

// Get the token
export const getToken = catchAsync(async (req, res, next) => {
  const { email, password, payload } = req.body;
  const identifier = String(email ?? req.body?.email ?? '').trim();

  if (!identifier || !password) {
    res.status(400).json({
      status: 'failed',
      msg: 'Please provide email and password',
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
    const tokenVersion = await getTokenVersionByUserId(matched[0].id);
    const token = issueAppToken(identifier, payload, tokenVersion);
    res.prints = {
      email: identifier,
      role,
      token,
    };
    next();
  }
});

// Exchange a Firebase email-link (passwordless) ID token for the app's own JWT.
// If the email is brand new, a `users` row is created with `email_signup = true`;
// otherwise the existing account is used. first_name / last_name are required
// only when creating a brand-new account, so a returning user can be logged in
// with just the ID token.
export const getTokenWithEmail = catchAsync(async (req, res, next) => {
  const { idToken, payload } = req.body;
  const first_name = String(req.body?.first_name ?? '').trim();
  const last_name = String(req.body?.last_name ?? '').trim();

  if (!idToken) {
    res.status(400).json({
      status: 'failed',
      msg: 'An idToken is required.',
    });
    return;
  }

  let decoded;
  try {
    decoded = await verifyFirebaseIdToken(idToken);
  } catch (err) {
    res.status(401).json({
      status: 'failed',
      msg: 'Invalid or expired Firebase token.',
    });
    return;
  }

  const email = String(decoded?.email ?? '')
    .trim()
    .toLowerCase();
  if (!email) {
    res.status(400).json({
      status: 'failed',
      msg: 'Firebase token does not contain an email address.',
    });
    return;
  }

  const existing = await tradeBusinessDbc.executeQuery(
    'SELECT id FROM users WHERE email = ? LIMIT 1;',
    [email],
  );
  let userId = existing?.[0]?.id;

  if (!userId) {
    if (!first_name || !last_name) {
      res.status(400).json({
        status: 'failed',
        code: 'NAMES_REQUIRED',
        msg: 'first_name and last_name are required to complete sign-up.',
      });
      return;
    }

    const created = await userModel.crudO.performCrud({
      operation: 'create',
      tableName: userModel.tableName,
      data: {
        first_name,
        last_name,
        email,
        display_name: `${first_name} ${last_name}`.trim(),
        status: 'active',
        email_signup: true,
      },
    });

    userId = created?.id || created?.record?.id;
    if (!userId) {
      res.status(500).json({
        status: 'failed',
        msg: 'Failed to create the user account.',
      });
      return;
    }
  }

  const role = await getPrimaryRoleByUserId(userId);
  const tokenVersion = await getTokenVersionByUserId(userId);
  const token = issueAppToken(email, payload, tokenVersion);

  res.prints = {
    email,
    role,
    token,
  };
  next();
});

// Send a passwordless "magic link" login email to an existing user. Responds
// successfully whether or not the account exists, to avoid leaking which email
// addresses are registered.
export const sendLoginMagicLink = catchAsync(async (req, res, next) => {
  const email = String(req.body?.email ?? '')
    .trim()
    .toLowerCase();
  const { payload } = req.body;

  if (!email) {
    return next(new AppError('An email address is required.', 400));
  }

  const existing = await tradeBusinessDbc.executeQuery(
    'SELECT id, first_name, last_name FROM users WHERE email = ? LIMIT 1;',
    [email],
  );
  const user = existing?.[0];

  if (user) {
    const token = signMagicLinkToken({
      email,
      purpose: MAGIC_LINK_PURPOSES.LOGIN,
      first_name: user.first_name,
      last_name: user.last_name,
    });
    const { subject, html, text } = buildLoginMagicLinkEmail({
      link: buildMagicLink(token),
      firstName: user.first_name,
    });
    await sendMail({ to: email, subject, html, text });
  }

  // Always report success to prevent account enumeration.
  res.prints = { sent: true };
  next();
});

// Redeem a magic-link token (sign-up or login) and issue the app's own JWT.
// For a sign-up link with a brand-new email, a `users` row is created with
// `email_signup = true`; otherwise the existing account is used. Mirrors the
// shape of `getTokenWithEmail` so the frontend contract stays identical.
export const getTokenWithMagicLink = catchAsync(async (req, res, next) => {
  const { token, payload } = req.body;
  const first_name = String(req.body?.first_name ?? '').trim();
  const last_name = String(req.body?.last_name ?? '').trim();

  if (!token) {
    return next(new AppError('A magic-link token is required.', 400));
  }

  const purpose = readMagicLinkPurpose(token);
  if (!purpose || !Object.values(MAGIC_LINK_PURPOSES).includes(purpose)) {
    return next(
      new AppError('This link is invalid. Please request a new one.', 401),
    );
  }

  let decoded;
  try {
    decoded = verifyMagicLinkToken(token, purpose);
  } catch (err) {
    return next(err);
  }

  const email = decoded.email;
  const existing = await tradeBusinessDbc.executeQuery(
    'SELECT id FROM users WHERE email = ? LIMIT 1;',
    [email],
  );
  let userId = existing?.[0]?.id;

  if (purpose === MAGIC_LINK_PURPOSES.SIGNUP && !userId) {
    const first = first_name || decoded.first_name;
    const last = last_name || decoded.last_name;
    if (!first || !last) {
      res.status(400).json({
        status: 'failed',
        code: 'NAMES_REQUIRED',
        msg: 'first_name and last_name are required to complete sign-up.',
      });
      return;
    }

    const created = await userModel.crudO.performCrud({
      operation: 'create',
      tableName: userModel.tableName,
      data: {
        first_name: first,
        last_name: last,
        email,
        display_name: `${first} ${last}`.trim(),
        status: 'active',
        email_signup: true,
        email_verified_at: new Date(),
      },
    });
    userId = created?.id || created?.record?.id;
    if (!userId) {
      return next(new AppError('Failed to create the user account.', 500));
    }
  }

  if (!userId) {
    return next(new AppError('No account found for this email.', 404));
  }

  await tradeBusinessDbc.executeQuery(
    'UPDATE users SET last_login_at = ? WHERE id = ?;',
    [new Date(), userId],
  );

  const role = await getPrimaryRoleByUserId(userId);
  const tokenVersion = await getTokenVersionByUserId(userId);
  const appToken = issueAppToken(email, payload, tokenVersion);

  res.prints = { email, role, token: appToken };
  next();
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
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
    });

    // 3) Check the payload and determine the user's role
    const { payload } = decoded;
    if (!payload) {
      return next(new AppError('The payload does not exist.', 401));
    }

    const [currentUser, , , tokenVersion] = payload.split(';');
    const role = await getUserRole(currentUser); // Use getUserRole function

    // Session revocation: reject tokens whose embedded token_version no longer
    // matches the user's current value (bumped on password change).
    if (securityConfig.enforceTokenVersion) {
      const userId = await resolveUserId(currentUser);
      const currentVersion = await getTokenVersionByUserId(userId);
      const embedded = Number(tokenVersion);

      if (Number.isFinite(embedded)) {
        if (embedded !== currentVersion) {
          return next(
            new AppError('Your session has expired. Please log in again.', 401),
          );
        }
      } else if (securityConfig.rejectLegacyTokens) {
        return next(
          new AppError('Your session has expired. Please log in again.', 401),
        );
      } else {
        logger.warn(
          `Token without a version segment for "${currentUser}"; allowing (relaxed mode).`,
        );
      }
    }

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

// Sentinel scope understood by `restrictTo`. When present, the caller may act
// on a resource only when that resource belongs to themselves (i.e. the id in
// the request matches the authenticated user's own id).
export const SELF_SCOPE = 'user-self';

// restrict the user role
export const restrictTo = (...roles) => {
  return catchAsync(async (req, res, next) => {
    // Check if user object exists
    if (!req.user) {
      return next(
        new AppError('User authentication required for this operation', 401),
      );
    }

    // Resolve the authenticated user's own id once, only if the `user-self`
    // scope is requested, so ordinary role checks keep their current cost.
    if (roles.includes(SELF_SCOPE)) {
      // The login identifier (first `;`-segment of the JWT payload) is the
      // caller's email address. The caller is identified solely by the verified
      // token — no id/email is accepted from the request — so there is nothing
      // for a client to spoof.
      const callerEmail = String(req.user.name ?? req.user.email ?? '')
        .trim()
        .toLowerCase();

      const selfId = req.user.id || (await resolveUserId(callerEmail));

      if (!selfId) {
        return next(
          new AppError('You do not have permission to perform this action', 403),
        );
      }

      // The caller's own record: grant and expose the id.
      req.selfUserId = selfId;
      return next();
    }

    // Role-based permission: determine whether the user's role(s) allow access.
    // A missing role simply grants no role-based permission (instead of a hard
    // 403) so the `user-self` scope can still authorise role-less users.
    const role = req.user.role;
    let hasRolePermission = false;

    if (Array.isArray(role)) {
      hasRolePermission = role.some((userRole) => roles.includes(userRole));
    } else if (role) {
      hasRolePermission = roles.includes(role);
    }

    if (!hasRolePermission) {
      return next(
        new AppError('You do not have permission to perform this action', 403),
      );
    }

    // If we reach here, the user has the required role(s)
    next();
  });
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
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
    });
    const { payload } = decoded;
    if (payload) {
      const [currentUser, , , tokenVersion] = payload.split(';');
      if (
        securityConfig.enforceTokenVersion &&
        Number.isFinite(Number(tokenVersion))
      ) {
        const userId = await resolveUserId(currentUser);
        const currentVersion = await getTokenVersionByUserId(userId);
        if (Number(tokenVersion) !== currentVersion) {
          return next(); // stale session -> treat as guest
        }
      }
      req.user = { name: currentUser };
    }
  } catch (error) {
    // Invalid or expired token: treat the visitor as a guest instead of
    // failing the public page.
  }

  next();
});
