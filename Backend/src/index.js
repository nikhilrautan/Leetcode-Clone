const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieparser = require('cookie-parser');
const main = require('./config/db');
const redisClient = require('./config/redis');
const userAuth = require('./routes/userAuth');
const problemRouter = require('./routes/problemCreator');
const aiRouter = require("./routes/aiChatting");
// NOTE: submit router is intentionally NOT required here

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieparser());

app.use('/user', userAuth);
app.use('/problem', problemRouter);
app.use('/ai', aiRouter);

redisClient.on('error', (e) => console.error('Redis error:', e));

const InitalizeConnection = async () => {
    try {
        await Promise.all([main(), redisClient.connect()]);
        console.log("DB Connected");

        // Required only now, so the rate limiters are created after Redis is connected
        const submitRouter = require('./routes/submit');
        app.use('/submission', submitRouter);

        app.listen(process.env.PORT, () => {
            console.log("Server Listening at port number: " + process.env.PORT);
        });
    } catch (err) {
        console.log("Error: " + err);
        process.exit(1);
    }
};

InitalizeConnection();