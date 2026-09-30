import { useEffect,useState } from "react"
function Signup(){


    const [name,setName] = useState('');
    const [email,setEmail] = useState('');
    const [password,setPassword]  = useState('');

    const handleSubmit = (e)=>{
        e.preventDefault();
    }
    return(
        <>
        Signup Page
        </>
    )
}

export default Signup