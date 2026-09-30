import {Routes, Route, Router} from "react-router";
function App() {
  return (
    <>
  <Routes>
    <Route path="/"element={<HomePage></HomePage>}></Route>
    <Route path="/login" element={<Login></Login>}></Route>
    <Route path="/signup" element={<Signup></Signup>}></Route>
  </Routes>
    </>
  );
}

export default App;