import catchAsync from '../../../../../utils/catchAsync.js';
import AppError from '../../../../../utils/appError.js';
import { userModel } from '../../../../models/trade_business/home_page/users/data_users.js';
import { setUserPassword } from '../../../../models/trade_business/home_page/users/data_user_auths.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

export const createUser = catchAsync(async (req, res, next) => {
  const structuredData = await userModel.processStructureDataOperation(
    req.body.data,
    'create',
  );

  res.status(201).json({
    status: 'success',
    structuredData,
  });
});

/**
 * Public self-service registration. Creates a `users` row and stores a
 * bcrypt-hashed password in `user_auths`. No authentication is required here
 * because this is the entry point for new (anonymous) customers.
 * @route POST /trade_business/home/users/signup
 */
export const signupUser = catchAsync(async (req, res, next) => {
  const first_name = String(req.body?.first_name ?? '').trim();
  const last_name = String(req.body?.last_name ?? '').trim();
  const email = String(req.body?.email ?? '').trim().toLowerCase();
  const password = req.body?.password ?? '';

  if (!first_name) {
    return next(new AppError('first_name is required.', 400));
  }
  if (!last_name) {
    return next(new AppError('last_name is required.', 400));
  }
  if (!email || !EMAIL_PATTERN.test(email)) {
    return next(new AppError('A valid email address is required.', 400));
  }
  if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
    return next(
      new AppError(
        `password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
        400,
      ),
    );
  }

  const existing = await userModel.executeQuery(
    'SELECT id FROM users WHERE email = ? LIMIT 1;',
    [email],
  );
  if (existing?.length) {
    return next(new AppError('An account with this email already exists.', 409));
  }

  const display_name = `${first_name} ${last_name}`.trim();

  // Bypass the generic create path (its `user_name` requirement does not match
  // the `users` schema) and write the row directly through the CRUD helper,
  // which only persists columns that exist in the table.
  const created = await userModel.crudO.performCrud({
    operation: 'create',
    tableName: userModel.tableName,
    data: {
      first_name,
      last_name,
      email,
      display_name,
      status: 'active',
    },
  });

  const userId = created?.id || created?.record?.id;
  if (!userId) {
    return next(new AppError('Failed to create the user account.', 500));
  }

  try {
    await setUserPassword(userId, password);
  } catch (err) {
    // Roll back the just-created user row so a failed password write does not
    // leave behind an account that can never log in.
    await userModel.crudO
      .performCrud({
        operation: 'delete',
        tableName: userModel.tableName,
        id: userId,
      })
      .catch(() => {});
    return next(err);
  }

  res.status(201).json({
    status: 'success',
    data: { user_id: userId },
  });
});

export const getAllUsers = catchAsync(async (req, res, next) => {
  const { includeBase64, iconOnly, compress } = req.query;

  const userIds = await userModel.executeQuery('SELECT id FROM users;');

  const data = { users: userIds };
  const structuredData = await userModel.processStructureDataOperation(
    data,
    'read',
    {
      includeBase64: includeBase64 === '1',
      base64OnlyTable: iconOnly === '1' ? ['users'] : null,
      compress: compress === '1',
    },
  );

  res.status(200).json({
    status: 'success',
    structuredData,
  });
});

export const getUserComparisonKeys = catchAsync(async (req, res, next) => {
  const comparisonKeyData = userModel.getFirstLevelFieldNames();

  res.status(200).json({
    status: 'success',
    data: {
      firstLevelKeys: comparisonKeyData,
    },
  });
});

export const getUserById = catchAsync(async (req, res, next) => {
  const { includeBase64, iconOnly, compress } = req.query;

  const structuredData = await userModel.processStructureDataOperation(
    req.body.data,
    'read',
    {
      includeBase64: includeBase64 === '1',
      base64OnlyTable: iconOnly === '1' ? ['users'] : null,
      compress: compress === '1',
    },
  );

  res.status(200).json({
    status: 'success',
    structuredData,
  });
});

export const updateUser = catchAsync(async (req, res, next) => {
  const structuredData = await userModel.processStructureDataOperation(
    req.body.data,
    'update',
  );

  res.status(200).json({
    status: 'success',
    structuredData,
  });
});

export const deleteUser = catchAsync(async (req, res, next) => {
  const structuredData = await userModel.processStructureDataOperation(
    req.body.data,
    'delete',
  );

  res.status(200).json({
    status: 'success',
    structuredData,
  });
});

export const truncateUserTables = catchAsync(async (req, res, next) => {
  const sql = `SELECT id FROM users;`;
  const ids = await userModel.dbc.executeQuery(sql);
  await userModel.processStructureDataOperation({ users: ids }, 'delete');

  res.status(200).json({
    status: 'success',
  });
});