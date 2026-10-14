const redisClient = require("../config/redis");
const User = require("../models/user");
const validate = require('../utils/validator');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const Submission = require("../models/submission");

// register feature
const register = async (req, res) => {
    try {
        validate(req.body);
        const { firstName, emailId, password } = req.body;

        req.body.password = await bcrypt.hash(password, 10);
        req.body.role = 'user'; // anyone registering normally is always a "user"

        const user = await User.create(req.body);
        const token = jwt.sign(
            { _id: user._id, emailId: emailId, role: 'user' },
            process.env.JWT_KEY,
            { expiresIn: 60 * 60 }
        );

        const reply = {
            firstName: user.firstName,
            emailId: user.emailId,
            _id: user._id,
            role: user.role            // ADDED
        };

        res.cookie('token', token, { maxAge: 60 * 60 * 1000 });
        res.status(201).json({
            user: reply,
            message: "Loggedin Successfully"
        });
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

        const reply = {
            firstName: user.firstName,
            emailId: user.emailId,
            _id: user._id,
            role: user.role            // ADDED
        };

        const token = jwt.sign(
            { _id: user._id, emailId: emailId, role: user.role },
            process.env.JWT_KEY,
            { expiresIn: 60 * 60 }
        );

        res.cookie('token', token, { maxAge: 60 * 60 * 1000 });
        res.status(200).json({         // changed 201 -> 200
            user: reply,
            message: "Loggedin Successfully"
        });
    }
    catch (err) {
        res.status(400).send("Error: " + err);
    }
}

// logout feature
const logout = async (req, res) => {
    try {
        const { token } = req.cookies;
        const payload = jwt.decode(token);

        // add token to redis blocklist until it expires
        await redisClient.set(`token:${token}`, 'Blocked');
        await redisClient.expireAt(`token:${token}`, payload.exp);

        // clear the cookie
        res.cookie("token", null, { expires: new Date(Date.now()) });
        res.status(200).send("Logged Out Successfully");
    }
    catch (err) {
        res.status(503).send("Error: " + err);
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

const adminRegister = async (req, res) => {
    try {
        validate(req.body);
        const { firstName, emailId, password } = req.body;

        req.body.password = await bcrypt.hash(password, 10);

        const user = await User.create(req.body);
        const token = jwt.sign(
            { _id: user._id, emailId: emailId, role: user.role },
            process.env.JWT_KEY,
            { expiresIn: 60 * 60 }
        );
        res.cookie('token', token, { maxAge: 60 * 60 * 1000 });
        res.status(201).send("User Registered Successfully");
    }
    catch (err) {
        res.status(400).send("Error: " + err);
    }
}

const deleteProfile = async (req, res) => {
    try {
        const userId = req.result._id;        // FIXED: was userID

        await User.findByIdAndDelete(userId);

        // await Submission.deleteMany({ userId });

        res.status(200).send("Deleted Successfully");   // FIXED: was response
    }
    catch (err) {
        res.status(500).send("Internal Server Error");
    }
}

module.exports = { register, login, logout, getProfile, adminRegister, deleteProfile };