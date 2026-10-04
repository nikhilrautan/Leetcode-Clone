const { rateLimit, ipKeyGenerator } = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const redisClient = require('../config/redis');

const createRateLimiter = ({ windowMs, max, message, prefix }) => {
    return rateLimit({
        windowMs,
        max,
        standardHeaders: true,
        legacyHeaders: false,
        message: { error: message || "Too many requests, please try again later." },
        store: new RedisStore({
            sendCommand: (...args) => redisClient.sendCommand(args),
            prefix: prefix || 'rl:',
        }),
        keyGenerator: (req) => {
            // per logged-in user if available, else by IP (IPv6-safe)
            const userId = req.result?._id?.toString();
            return userId ? `user:${userId}` : ipKeyGenerator(req.ip);
        },
    });
};

module.exports = createRateLimiter;