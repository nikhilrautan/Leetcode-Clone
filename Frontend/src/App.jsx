import { Routes, Route } from "react-router";
import Login from "./pages/Login";
import Homepage from "./pages/Homepage";
import Signup from "./pages/Signup";
import { checkAuth } from "./authSlice";
import { useDispatch } from "react-redux";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
    </Routes>
  );
}

export default App;