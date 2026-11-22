import { Routes, Route, Navigate } from "react-router";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Homepage from "./pages/Homepage";
import Dashboard from "./pages/Dashboard";
import AlgoVisualiser from "./pages/AlgoVisualiser";
import Goals from "./pages/Goals";
import InterviewPrep from "./pages/InterviewPrep";
import { useDispatch, useSelector } from "react-redux";
import { checkAuth } from "./store/authSlice";
import { useEffect } from "react";
import AdminPanel from "./pages/AdminPanel";
import ProblemPage from "./pages/ProblemPage";
import Admin from "./pages/Admin";
import AdminVideo from "./components/AdminVideo";
import AdminDelete from "./components/AdminDelete";
import AdminUpload from "./components/AdminUpload";
import AppLayout from "./components/AppLayout";
import ComingSoon from "./components/ComingSoon";
import { Code2 } from "lucide-react";
import Feed from "./pages/Feed";
import Group from "./pages/Group";
import Leaderboard from "./pages/Leaderboard";

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
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
      <Route path="/signup" element={isAuthenticated ? <Navigate to="/" /> : <Signup />} />

      {/* Pages that share the top bar and sidebar */}
      <Route element={isAuthenticated ? <AppLayout /> : <Navigate to="/signup" />}>
  <Route path="/" element={<Homepage />} />
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/feed" element={<Feed />} />
  <Route path="/algo-visualiser" element={<AlgoVisualiser />} />
  <Route path="/group" element={<Group />} />
  <Route path="/goals" element={<Goals />} />
  <Route path="/interview-prep" element={<InterviewPrep />} />
  <Route path="/dsa-arena" element={<ComingSoon page="arena" />} />
  <Route path="/problem/:problemId" element={<ProblemPage />} />
  <Route path="/admin" element={isAdmin ? <Admin /> : <Navigate to="/" />} />
  <Route path="/admin/create" element={isAdmin ? <AdminPanel /> : <Navigate to="/" />} />
  <Route path="/admin/delete" element={isAdmin ? <AdminDelete /> : <Navigate to="/" />} />
  <Route path="/admin/video" element={isAdmin ? <AdminVideo /> : <Navigate to="/" />} />
  <Route path="/admin/upload/:problemId" element={isAdmin ? <AdminUpload /> : <Navigate to="/" />} />
  <Route path="/leaderboard" element={<Leaderboard />} />
</Route>
 </Routes>
  );
}

export default App;