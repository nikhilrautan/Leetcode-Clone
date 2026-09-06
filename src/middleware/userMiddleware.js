const userMiddleware = async (req,res,next)=>{

    try{
        const {token} = req.cookies;
        if(!token)
            throw new Error("Token is not Present");
    }
}