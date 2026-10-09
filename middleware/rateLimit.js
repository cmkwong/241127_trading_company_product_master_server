import AppError from '../utils/appError.js';

// Lightweight, dependency-free fixed-window rate limiter.
//
// Backed by an in-memory Map with lazy expiry and a periodic sweep (unref'd so
// it can never hold the process open). This is per-process: fine for a single
// node, but if the API is ever run behind a load balancer the store should be
// swapped for MySQL/Redis and `app.set('trust proxy', ...)` configured.

const store = new Map(); // key -> { count, windowStart, windowMs }

const sweep = () => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now - entry.windowStart >= entry.windowMs) {
      store.delete(key);
    }
  }
};

const timer = setInterval(sweep, 60 * 1000);
timer.unref?.();

/** Clear all windows — used by tests and dev helpers. */
export const resetRateLimitStore = () => store.clear();

/**
 * Create a fixed-window rate limiter middleware.
 * @param {{ windowMs: number, max: number, message?: string, keyGenerator?: (req: object) => string }} options
 */
export const createRateLimiter = ({
  windowMs,
  max,
  message = 'Too many requests. Please try again later.',
  keyGenerator,
}) => {
  return (req, res, next) => {
    const ip = String(req.ip || req.socket?.remoteAddress || 'unknown');
    const key = keyGenerator ? `${ip}|${keyGenerator(req)}` : ip;
    const now = Date.now();

    let entry = store.get(key);
    if (!entry || now - entry.windowStart >= windowMs) {
      entry = { count: 0, windowStart: now, windowMs };
      store.set(key, entry);
    }

    entry.count += 1;

    if (entry.count > max) {
      res.setHeader(
        'Retry-After',
        String(Math.ceil((entry.windowStart + windowMs - now) / 1000)),
      );
      return next(new AppError(message, 429));
    }

    next();
  };
};
