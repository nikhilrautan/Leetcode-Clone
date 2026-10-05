import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { checkAuth } from "./store/authSlice";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Homepage from "./pages/Homepage";
import AdminPanel from "./pages/AdminPanel";

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    dispatch(checkAuth()).finally(() => setChecking(false));
  }, [dispatch]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <Routes>
      {/* Main page of the site - login/signup both redirect here */}
      <Route
        path="/"
        element={isAuthenticated ? <Homepage /> : <Navigate to="/signup" replace />}
      />
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/signup"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Signup />}
      />
      {/* Admin only */}
      <Route
        path="/admin"
        element={
          isAuthenticated && user?.role === "admin" ? (
            <AdminPanel />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
    </Routes>
  );
}

export default App;