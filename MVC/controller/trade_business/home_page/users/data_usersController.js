import { v4 as uuidv4 } from 'uuid';
import catchAsync from '../../../../../utils/catchAsync.js';
import AppError from '../../../../../utils/appError.js';
import { userModel } from '../../../../models/trade_business/home_page/users/data_users.js';
import { userRfqModel } from '../../../../models/trade_business/home_page/users/data_user_rfqs.js';
import { setUserPassword } from '../../../../models/trade_business/home_page/users/data_user_auths.js';
import { sendMail } from '../../../../../utils/mailer.js';
import {
  signMagicLinkToken,
  buildMagicLink,
  MAGIC_LINK_PURPOSES,
} from '../../../../../utils/magicLink.js';
import { buildMagicLinkEmail } from '../../../../models/trade_business/mails/magicLinkEmail.js';

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
      email_signup: false,
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

/**
 * Public self-service email-verification trigger. Signs a short-lived,
 * purpose-scoped magic-link token carrying the first/last name and emails it
 * to the address provided. No account is created until the link is redeemed
 * (see `getTokenWithMagicLink` in the auth middleware).
 * @route POST /trade_business/home/users/signup/send-magic-link
 */
export const sendSignupMagicLink = catchAsync(async (req, res, next) => {
  const first_name = String(req.body?.first_name ?? '').trim();
  const last_name = String(req.body?.last_name ?? '').trim();
  const email = String(req.body?.email ?? '').trim().toLowerCase();

  if (!first_name) {
    return next(new AppError('first_name is required.', 400));
  }
  if (!last_name) {
    return next(new AppError('last_name is required.', 400));
  }
  if (!email || !EMAIL_PATTERN.test(email)) {
    return next(new AppError('A valid email address is required.', 400));
  }

  const existing = await userModel.executeQuery(
    'SELECT id FROM users WHERE email = ? LIMIT 1;',
    [email],
  );
  if (existing?.length) {
    return next(new AppError('An account with this email already exists.', 409));
  }

  const token = signMagicLinkToken({
    email,
    purpose: MAGIC_LINK_PURPOSES.SIGNUP,
    first_name,
    last_name,
  });
  const { subject, html, text } = buildMagicLinkEmail({
    link: buildMagicLink(token),
    firstName: first_name,
    purpose: 'signup',
  });
  await sendMail({ to: email, subject, html, text });

  res.status(200).json({
    status: 'success',
    data: { email, sent: true },
  });
});

/**
 * Public pre-flight check used by the sign-up form to warn the user before a
 * duplicate account is created (or a verification email is sent). Mirrors the
 * duplicate-email query in `signupUser`.
 * @route GET /trade_business/home/users/signup/check-email?email=...
 */
export const checkEmailAvailability = catchAsync(async (req, res, next) => {
  const email = String(req.query?.email ?? '').trim().toLowerCase();

  if (!email || !EMAIL_PATTERN.test(email)) {
    return next(new AppError('A valid email address is required.', 400));
  }

  const existing = await userModel.executeQuery(
    'SELECT id FROM users WHERE email = ? LIMIT 1;',
    [email],
  );

  res.status(200).json({
    status: 'success',
    data: { email, exists: Boolean(existing?.length) },
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

/**
 * Get the authenticated user's own record. The target id is taken from
 * `req.selfUserId`, which `restrictTo('user-self')` derives solely from the
 * verified token (the caller's email address) — no id or email is accepted from
 * the client, so it is never trusted from the request directly.
 * @route GET /trade_business/home/users/data/info
 */
export const getSelfUser = catchAsync(async (req, res, next) => {
  const { includeBase64, iconOnly, compress } = req.query;
  const selfId = req.selfUserId;

  if (!selfId) {
    return next(new AppError('Unable to determine the target user.', 400));
  }

  const structuredData = await userModel.processStructureDataOperation(
    { users: [{ id: selfId }] },
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

// ============================================================
// SELF-SERVICE ACCOUNT OPERATIONS (identity derived from token)
// ============================================================

// Fields a user may edit on their own profile. Email, status and credential
// fields are intentionally excluded and are never trusted from the client.
const SELF_EDITABLE_FIELDS = [
  'first_name',
  'last_name',
  'display_name',
  'company_name',
  'website',
  'country_calling_code',
  'phone_number',
  'icon_name',
];

// Child tables that may be edited through the self profile update. Each row is
// force-bound to the caller's own id so a user can never write another user's
// addresses or payment methods.
const SELF_CHILD_TABLES = ['user_addresses', 'user_payment_methods'];

// Remove a spoofable foreign-key column from a nested row so the write layer
// links it to the correct parent automatically.
const stripForeignKey = (row, key) => {
  if (!row || typeof row !== 'object') return {};
  const { [key]: _omit, ...rest } = row;
  return rest;
};

const generateRfqNumber = async () => {
  const now = new Date();
  const yyyymmdd = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('');
  const prefix = `RFQ-${yyyymmdd}-`;

  const rows = await userRfqModel.executeQuery(
    'SELECT rfq_number FROM user_rfqs WHERE rfq_number LIKE ? ORDER BY rfq_number DESC LIMIT 1;',
    [`${prefix}%`],
  );

  let sequence = 1;
  const lastNumber = rows?.[0]?.rfq_number;
  if (lastNumber) {
    const match = String(lastNumber).match(/(\d+)$/);
    if (match) sequence = parseInt(match[1], 10) + 1;
  }

  return `${prefix}${String(sequence).padStart(3, '0')}`;
};

/**
 * Update the authenticated user's own profile and their address / payment
 * method records. The target id is forced from `req.selfUserId`; editable
 * fields are whitelisted.
 * @route PATCH /trade_business/home/users/data/self
 */
export const updateSelfUser = catchAsync(async (req, res, next) => {
  const selfId = req.selfUserId;
  if (!selfId) {
    return next(new AppError('Unable to determine the target user.', 400));
  }

  const userPatch = req.body?.data?.users?.[0];
  if (!userPatch || typeof userPatch !== 'object') {
    return next(new AppError('data.users[0] is required.', 400));
  }

  const sanitizedUser = { id: selfId };
  for (const field of SELF_EDITABLE_FIELDS) {
    if (userPatch[field] !== undefined) {
      sanitizedUser[field] = userPatch[field];
    }
  }

  // Icon upload payload: the client converts a freshly-picked blob into a
  // base64 data URI. The server-side file pipeline turns it into a stored
  // `icon_url` under `/public/users/{id}/icon/`.
  if (userPatch.base64_image !== undefined) {
    sanitizedUser.base64_image = userPatch.base64_image;
  }

  for (const childKey of SELF_CHILD_TABLES) {
    if (Array.isArray(userPatch[childKey])) {
      sanitizedUser[childKey] = userPatch[childKey].map((row) => ({
        ...row,
        user_id: selfId,
      }));
    }
  }

  const structuredData = await userModel.processStructureDataOperation(
    { users: [sanitizedUser] },
    'update',
  );

  res.status(200).json({
    status: 'success',
    structuredData,
  });
});

/**
 * Create a new draft RFQ for the authenticated user. The RFQ number is
 * generated server-side and the user id is forced from the token.
 * @route POST /trade_business/home/users/data/self/rfqs
 */
export const createSelfRfq = catchAsync(async (req, res, next) => {
  const selfId = req.selfUserId;
  if (!selfId) {
    return next(new AppError('Unable to determine the target user.', 400));
  }

  const body =
    req.body?.data?.user_rfqs?.[0] ??
    req.body?.user_rfqs?.[0] ??
    req.body ??
    {};

  const rfqNumber = await generateRfqNumber();

  const rfq = {
    id: body.id || uuidv4(),
    user_id: selfId,
    rfq_number: rfqNumber,
    status: body.status || 'draft',
    shipping_address_id: body.shipping_address_id || null,
    expected_delivery_date: body.expected_delivery_date || null,
    buyer_remarks: body.buyer_remarks || null,
    sales_quotation_id: body.sales_quotation_id || null,
  };

  if (Array.isArray(body.user_rfq_items)) {
    rfq.user_rfq_items = body.user_rfq_items.map((row) =>
      stripForeignKey(row, 'rfq_id'),
    );
  }
  if (Array.isArray(body.user_rfq_attachments)) {
    rfq.user_rfq_attachments = body.user_rfq_attachments.map((row) =>
      stripForeignKey(row, 'rfq_id'),
    );
  }

  const structuredData = await userRfqModel.processStructureDataOperation(
    { user_rfqs: [rfq] },
    'create',
  );

  res.status(201).json({
    status: 'success',
    structuredData,
  });
});

/**
 * Update an authenticated user's own RFQ (edit fields, replace items /
 * attachments, submit or cancel). Ownership is verified before writing.
 * @route PATCH /trade_business/home/users/data/self/rfqs/ids
 */
export const updateSelfRfq = catchAsync(async (req, res, next) => {
  const selfId = req.selfUserId;
  if (!selfId) {
    return next(new AppError('Unable to determine the target user.', 400));
  }

  const body =
    req.body?.data?.user_rfqs?.[0] ??
    req.body?.user_rfqs?.[0] ??
    req.body ??
    {};

  const id = body.id;
  if (!id) {
    return next(new AppError('RFQ id is required.', 400));
  }

  const owned = await userRfqModel.executeQuery(
    'SELECT id FROM user_rfqs WHERE id = ? AND user_id = ? LIMIT 1;',
    [id, selfId],
  );
  if (!owned?.length) {
    return next(new AppError('RFQ not found.', 404));
  }

  const allowedFields = [
    'status',
    'shipping_address_id',
    'expected_delivery_date',
    'buyer_remarks',
    'sales_quotation_id',
  ];

  const patch = { id, user_id: selfId };
  for (const field of allowedFields) {
    if (body[field] !== undefined) patch[field] = body[field];
  }

  // Replacement mode so items/attachments removed by the user are deleted.
  if (
    Array.isArray(body.user_rfq_items) ||
    Array.isArray(body.user_rfq_attachments)
  ) {
    patch._sync_children = true;
  }
  if (Array.isArray(body.user_rfq_items)) {
    patch.user_rfq_items = body.user_rfq_items.map((row) =>
      stripForeignKey(row, 'rfq_id'),
    );
  }
  if (Array.isArray(body.user_rfq_attachments)) {
    patch.user_rfq_attachments = body.user_rfq_attachments.map((row) =>
      stripForeignKey(row, 'rfq_id'),
    );
  }

  const structuredData = await userRfqModel.processStructureDataOperation(
    { user_rfqs: [patch] },
    'update',
  );

  res.status(200).json({
    status: 'success',
    structuredData,
  });
});

/**
 * Delete an authenticated user's own RFQ (and its items/attachments).
 * Ownership is verified before deleting.
 * @route DELETE /trade_business/home/users/data/self/rfqs/ids
 */
export const deleteSelfRfq = catchAsync(async (req, res, next) => {
  const selfId = req.selfUserId;
  if (!selfId) {
    return next(new AppError('Unable to determine the target user.', 400));
  }

  const id =
    req.body?.data?.user_rfqs?.[0]?.id ??
    req.body?.user_rfqs?.[0]?.id ??
    req.body?.id ??
    req.params?.id;

  if (!id) {
    return next(new AppError('RFQ id is required.', 400));
  }

  const owned = await userRfqModel.executeQuery(
    'SELECT id FROM user_rfqs WHERE id = ? AND user_id = ? LIMIT 1;',
    [id, selfId],
  );
  if (!owned?.length) {
    return next(new AppError('RFQ not found.', 404));
  }

  await userRfqModel.processStructureDataOperation(
    { user_rfqs: [{ id }] },
    'delete',
  );

  res.status(200).json({
    status: 'success',
  });
});
