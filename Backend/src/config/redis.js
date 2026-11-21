const { createClient } = require('redis');

const client = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: process.env.HOST_ID,
        // Set REDIS_PORT in .env when you create a new database (falls back to the old port)
        port: Number(process.env.REDIS_PORT) || 14077,
        // Keep retrying quietly in the background. Never return an Error here,
        // because that is what used to crash the server.
        reconnectStrategy: (retries) => Math.min(retries * 100, 10000),
    },
    // Fail fast instead of queueing commands forever while Redis is down
    disableOfflineQueue: true,
});

// Log one short line per outage instead of a full stack trace on every retry
let errorLogged = false;
client.on('error', (err) => {
    if (!errorLogged) {
        console.error('Redis unavailable:', err.code || err.message, '(retrying in background)');
        errorLogged = true;
    }
});
client.on('ready', () => {
    errorLogged = false;
    console.log('Redis connected');
});

// What to return for common commands while Redis is down (development fallback only)
const offlineFallback = {
    get: null,
    exists: 0,
    del: 0,
    set: 'OK',
    setEx: 'OK',
    expire: 1,
    expireAt: 1,
};

// Same object your code already imports, with two differences:
// 1. connect() returns right away, so the server starts even if Redis is down.
// 2. Common commands return harmless defaults while Redis is down instead of throwing.
const redisClient = new Proxy(client, {
    get(target, prop) {
        if (prop === 'connect') {
            return () => {
                target.connect().catch(() => {});
                return Promise.resolve(target);
            };
        }

        const value = target[prop];
        if (typeof value !== 'function') return value;

        if (prop in offlineFallback) {
            return (...args) =>
                target.isReady
                    ? value.apply(target, args)
                    : Promise.resolve(offlineFallback[prop]);
        }

        return value.bind(target);
    },
});

module.exports = redisClient;
