const User = require("../models/user");
const validate= require('../utils/validator');
const bcrypt = require("bcrypt");

const register= async(req,res)=>{
    try{
        //validate the data
        validate(req.body);
        const {firstName, emailId , password} = req.body;
       
        req.body.password = await bcrypt.hash(password, 10);

       const user = await User.create(req.body);
    }  
    catch(err){
      res.status(400).send("Error: "+ err);
    }
}