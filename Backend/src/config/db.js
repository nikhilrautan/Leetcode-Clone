const mongoose = require("mongoose");

async function main() {
  await mongoose.connect(process.env.DB_CONNECT_STRING); // use your actual variable name
  console.log("Connected to:", mongoose.connection.name, "on", mongoose.connection.host);
}

module.exports = main;