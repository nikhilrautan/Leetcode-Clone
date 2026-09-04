const User = require("../models/user");
const validate= require('../utils/validator');
const register= async(req,res)=>{
    try{
        //validate the data
        validate(req.body);
        const {firstName, emailId , password} = req.body;

        // ye already exist to nhi krti mere system m 

       const user = await User.create(req.body);
    }  
    catch(err){
      res.status(400).send("Error: "+ err);
    }
}