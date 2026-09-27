const { createClient } = require('redis');

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: process.env.HOST_ID,
        port: 14077,
        reconnectStrategy: (retries) => {
            if (retries > 10) {
                console.error('Too many Redis reconnect attempts, giving up.');
                return new Error('Redis reconnect failed');
            }
            return Math.min(retries * 100, 3000); // backoff, capped at 3s
        }
    }
});

redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
});

redisClient.on('reconnecting', () => {
    console.log('Redis reconnecting...');
});

redisClient.on('connect', () => {
    console.log('Redis connected');
});

module.exports = redisClient;