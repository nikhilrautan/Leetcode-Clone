const {createClient} = require('redis');

const client = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: process.env.HOST_ID,
        port: 14077
    }
});