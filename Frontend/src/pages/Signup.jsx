import { useEffect,useState } from "react"
function Signup(){


    const [name,setName] = useState('');
    const [email,setEmail] = useState('');
    const [password,setPassword]  = useState('');

    const handleSubmit = (e)=>{
        e.preventDefault();

        // form ko submit kro
        //Backend submit  
    }
    return(
        <form onSubmit={handleSubmit}>
            <input type="text" value={name} placeholder="Enter Your FirstName" onChange={(e)=>setName(e.target.value)}></input>
            <input type="email" value={email} placeholder="Enter Your Email" onChange={(e)=>setEmail(e.target.value)}></input>
            <input type="password" value={password} placeholder="Enter Your Password" onChange={(e)=>setPassword(e.target.value)}></input>
        </form>>
    )
}

export default Signup