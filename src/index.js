const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const app = express();
require('dotenv').config();
const main = require('./config/db');
const cookieparser = require('cookie-parser');

const userAuth = require("./routes/userAuth");
const { clientEncryption } = require('./models/user');
const redisClient = require('./config/redis');
const problemRouter = require("./routes/problemCreator");
const submitRouter = require("./routes/submit");

app.use(express.json());
app.use(cookieparser());

app.use('/user', userAuth);
app.use('/problem', problemRouter);
app.use('/submission',submitRouter);

const InitalizeConnection = async () => {
    try {
        await Promise.all([main(), redisClient.connect()]);
        console.log("DB Connected");
        app.listen(process.env.PORT, () => {
            console.log("Server Listening at port number: " + process.env.PORT);
        });
    } catch (err) {
        console.log("Error: " + err);
    }
};

InitalizeConnection();