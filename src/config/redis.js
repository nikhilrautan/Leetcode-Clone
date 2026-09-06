const {createClient} = require('redis');

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: process.env.HOST_ID,
        port: 14077
    }
});

module.exports = redisClients;