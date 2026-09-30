import { useEffect,useState } from "react"
function Signup(){


    const [name,setName] = useState('');
    const [email,setEmail] = useState('');
    const [password,setPassword]  = useState('');
     const [reEnterPassword,SetreEnterPassword]  = useState('');

    const handleSubmit = (e)=>{
        e.preventDefault();

        console.log(name,email,password);

        //validation
        if(password!= reEnterPassword)

        // form ko submit kro
        //Backend submit  
    }
    return(
        <form onSubmit={handleSubmit} className="min-h-screen flex flex-col justify-center items-center">
            <input type="text" value={name} placeholder="Enter Your FirstName" onChange={(e)=>setName(e.target.value)}></input>
            <input type="email" value={email} placeholder="Enter Your Email" onChange={(e)=>setEmail(e.target.value)}></input>
            <input type="password" value={password} placeholder="Enter Your Password" onChange={(e)=>setPassword(e.target.value)}></input>
            <button type ="submit">Submit</button>
        </form>
    )
}

export default Signup