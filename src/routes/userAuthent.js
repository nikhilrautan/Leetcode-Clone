const User = require("../models/user")
const register= async(req,res)=>{
    try{
        //validate the data
        const {firstName, emailId , password} = req.body;
       await User.create(req.body);
    }  
    catch{

    }
}