const redisClient = require("../config/redis");
const User = require("../models/user");
const validate = require('../utils/validator');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

// register feature
const register = async (req, res) => {
    try {
        validate(req.body);
        const { firstName, emailId, password } = req.body;

        req.body.password = await bcrypt.hash(password, 10);

        const user = await User.create(req.body);
        const token = jwt.sign({ _id: user._id, emailId: emailId }, process.env.JWT_KEY, { expiresIn: 60 * 60 });
        res.cookie('token', token, { maxAge: 60 * 60 * 1000 });
        res.status(201).send("User Registered Successfully");
    }
    catch (err) {
        res.status(400).send("Error: " + err);
    }
}

// login feature

const login = async (req, res) => {
    try {
        const { emailId, password } = req.body;

        if (!emailId) throw new Error("Invalid Credentials");
        if (!password) throw new Error("Invalid Credentials");

        const user = await User.findOne({ emailId });
        if (!user) throw new Error("Invalid Credentials");

        const match = await bcrypt.compare(password, user.password);
        if (!match) throw new Error("Invalid Credentials");

        const token = jwt.sign({ _id: user._id, emailId: emailId }, process.env.JWT_KEY, { expiresIn: 60 * 60 });
        res.cookie('token', token, { maxAge: 60 * 60 * 1000 });
        res.status(200).send("Logged in Successfully");
    }
    catch (err) {
        res.status(400).send("Error: " + err);
    }
}

// logout feature

const logout = async (req, res) => {
    try {
      // validate the token 
      const {token} = req.cookies; // token nikaal diya 
      // ab payload lo nikalo 
      const payload = jwt.decode(token);
      // ab usko redis k blockist m daalna hai
      await redisClient.set(`token:${token}`,'Blocked');
      await redisClient.expireAt(`token:${token}`,payload.exp);

      // Cookies ko clear kr dena....
        res.cookie("token",null, new Date(Date.now()));
        res.send(200).send("Logged Out Successfully");
    }
    catch (err) {
        res.status(400).send("Error: " + err);
    }
}

// getProfile feature

const getProfile = async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) throw new Error("Invalid Token");

        const decoded = jwt.verify(token, process.env.JWT_KEY);
        const user = await User.findById(decoded._id);
        if (!user) throw new Error("User not found");

        res.status(200).send(user);
    }
    catch (err) {
        res.status(400).send("Error: " + err);
    }
}

module.exports = { register, login, logout, getProfile };