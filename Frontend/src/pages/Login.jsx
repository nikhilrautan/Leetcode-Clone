import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, NavLink } from "react-router";
import { loginUser } from "../store/authSlice";
import { Link } from "react-router";

const loginSchema = z.object({
  emailId: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password should contain at least 8 characters"),
});

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    if (isAuthenticated) navigate("/");
  }, [isAuthenticated, navigate]);

  const onSubmit = (data) => {
    dispatch(loginUser(data));
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md flex flex-col gap-5 px-4"
        noValidate
      >
        <h1 className="text-4xl font-bold text-center mb-2">Leetcode</h1>

        <div className="flex flex-col gap-1">
          <label htmlFor="emailId">Email</label>
          <input
            id="emailId"
            type="email"
            placeholder="john@example.com"
            className={`input input-bordered w-full ${errors.emailId ? "input-error" : ""}`}
            {...register("emailId")}
          />
          {errors.emailId && (
            <span className="text-error text-sm">{errors.emailId.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            className={`input input-bordered w-full ${errors.password ? "input-error" : ""}`}
            {...register("password")}
          />
          {errors.password && (
            <span className="text-error text-sm">{errors.password.message}</span>
          )}
        </div>

        {error && <div className="text-error text-sm text-center">{error}</div>}

        <button
          type="submit"
          className="btn btn-primary self-center px-8 mt-2"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-center text-sm">
          Don't have an account?{" "}
          <NavLink to="/signup" className="link link-primary">
            Sign up
          </NavLink>
        </p>
      </form>
    </div>
  );
}

export default Login;