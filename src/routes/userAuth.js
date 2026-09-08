const express = require('express');

const authRouter = express.Router();
const {register, login, logout, getProfile} = require("../controllers/userAuthent");
const userMiddleware = require("../middleware/userMiddleware");

//Register
authRouter.post('/register',register);
authRouter.post('/login', login);
authRouter.post('/logout',userMiddleware, logout);
authRouter.get('/getProfile', getProfile);
authRouter.post('/admin/register',adminMiddleware, adminRegister); // admin ko bhi hume check krna hoga aur kisi nye user/ kisi ko bhi bs admin hi admin bna skta hai

module.exports = authRouter;