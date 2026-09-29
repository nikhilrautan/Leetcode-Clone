const { rateLimit } = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const redisClient = require('../config/redis'); // wherever your redisClient is exported from

const createRateLimiter = ({ windowMs, max, message }) => {
    return rateLimit({
        windowMs,
        max,
        standardHeaders: true, // return rate limit info in RateLimit-* headers
        legacyHeaders: false,  // disable X-RateLimit-* headers
        message: { error: message || "Too many requests, please try again later." },
        store: new RedisStore({
            sendCommand: (...args) => redisClient.sendCommand(args),
        }),
        keyGenerator: (req) => {
            // rate limit per logged-in user if available, else by IP
            return req.result?._id?.toString() || req.ip;
        },
    });
};

module.exports = createRateLimiter;