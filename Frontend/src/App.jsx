import { Routes, Route, Navigate } from "react-router";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Homepage from "./pages/Homepage";
import { useDispatch, useSelector } from "react-redux";
import { checkAuth } from "./store/authSlice";
import { useEffect } from "react";
import AdminPanel from "./pages/AdminPanel";
import ProblemPage from "./pages/ProblemPage";
import Admin from "./pages/Admin";
import AdminVideo from "./components/AdminVideo";
import AdminDelete from "./components/AdminDelete";
import AdminUpload from "./components/AdminUpload";
import { Code2 } from "lucide-react";

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  // check initial authentication
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-base-200">
        <div className="flex items-center gap-2 text-2xl font-bold">
          <Code2 className="text-primary" size={32} />
          <span className="gradient-text">LeetCode</span>
        </div>
        <span className="loading loading-dots loading-lg text-primary"></span>
      </div>
    );
  }

  const isAdmin = isAuthenticated && user?.role === "admin";

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Homepage /> : <Navigate to="/signup" />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
      <Route path="/signup" element={isAuthenticated ? <Navigate to="/" /> : <Signup />} />
      <Route path="/admin" element={isAdmin ? <Admin /> : <Navigate to="/" />} />
      <Route path="/admin/create" element={isAdmin ? <AdminPanel /> : <Navigate to="/" />} />
      <Route path="/admin/delete" element={isAdmin ? <AdminDelete /> : <Navigate to="/" />} />
      <Route path="/admin/video" element={isAdmin ? <AdminVideo /> : <Navigate to="/" />} />
      <Route path="/admin/upload/:problemId" element={isAdmin ? <AdminUpload /> : <Navigate to="/" />} />
      <Route path="/problem/:problemId" element={<ProblemPage />} />
    </Routes>
  );
}

export default App;