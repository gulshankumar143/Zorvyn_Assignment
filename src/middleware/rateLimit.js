// Simple rate limiting middleware (memory-based, for demo)
const rateLimitWindowMs = 60 * 1000; // 1 minute
const maxRequestsPerWindow = 30;
const ipRequestCounts = new Map();

export function rateLimiter(req, res, next) {
  const now = Date.now();
  const ip = req.ip;
  if (!ipRequestCounts.has(ip)) {
    ipRequestCounts.set(ip, []);
  }
  const timestamps = ipRequestCounts.get(ip);
  // Remove old timestamps
  while (timestamps.length && timestamps[0] <= now - rateLimitWindowMs) {
    timestamps.shift();
  }
  if (timestamps.length >= maxRequestsPerWindow) {
    return res.status(429).json({ error: 'Too many requests, slow down.' });
  }
  timestamps.push(now);
  next();
}
