const { rateLimit, ipKeyGenerator } = require('express-rate-limit');

// In-memory rate limiter (no Redis needed).
// Same options as before, so existing calls like createRateLimiter({...}) keep working.
// Note: counts reset when the server restarts and are not shared between multiple servers.
const createRateLimiter = ({ windowMs, max, message }) => {
    return rateLimit({
        windowMs,
        max,
        standardHeaders: true,
        legacyHeaders: false,
        message: { error: message || "Too many requests, please try again later." },
        keyGenerator: (req) => {
            // per logged-in user if available, else by IP (IPv6-safe)
            const userId = req.result?._id?.toString();
            return userId ? `user:${userId}` : ipKeyGenerator(req.ip);
        },
    });
};

module.exports = createRateLimiter;