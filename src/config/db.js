const mongoose = require('mongoose');

async function main(){
   await mongoose.connect(process.env.DB_CONNECT_SRING)
}

module.exports = main;