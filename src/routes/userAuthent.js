const User = require("../models/user");
const validator= require('../utils/validator');
const register= async(req,res)=>{
    try{
        //validate the data
        validator(req.body);
        const {firstName, emailId , password} = req.body;
       await User.create(req.body);
    }  
    catch{

    }
}