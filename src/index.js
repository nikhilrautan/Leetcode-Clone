const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express')
const app = express();
require('dotenv').config();
const main = require('./config/db');
const cookieparser = require('cookie-parser');

const userAuth = require("./routes/userAuth");

app.use(express.json());
app.use(cookieparser());

app.use('/user', userAuth);

main()
.then(async ()=>{
    app.listen(process.env.PORT,()=>{
    console.log("Server Listening at port number: "+ process.env.PORT);
   })
})
.catch(err=> console.log("Error Occurred: "+ err));