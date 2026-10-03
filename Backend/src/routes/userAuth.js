const express = require('express');

const authRouter = express.Router();
const {register, login, logout, getProfile, adminRegister, deleteProfile} = require("../controllers/userAuthent");
const userMiddleware = require("../middleware/userMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

//Register
authRouter.post('/register',register);
authRouter.post('/login', login);
authRouter.post('/logout',userMiddleware, logout);
authRouter.get('/getProfile', getProfile);
authRouter.post('/admin/register',adminMiddleware, adminRegister); // admin ko bhi hume check krna hoga aur kisi nye user/ kisi ko bhi bs admin hi admin bna skta hai
authRouter.delete('/deleteProfile',userMiddleware,deleteProfile);
authRouter.get('/check',userMiddleware, (req,res)=>{
  
    const reply = {
        firstName:req.result.firstName,
        emailId: req.result.emailId,
        _id: req.result._id
    }
    res.status(200).json({
        user:reply,
        message: "Valid User"
    })
})


module.exports = authRouter;