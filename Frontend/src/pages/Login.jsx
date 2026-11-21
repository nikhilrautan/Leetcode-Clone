import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, NavLink } from "react-router";
import { Code2, Mail, Lock, Eye, EyeOff, CircleAlert } from "lucide-react";
import { loginUser } from "../store/authSlice";

const loginSchema = z.object({
  emailId: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password should contain at least 8 characters"),
});

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);

  // UI-only state
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="flex min-h-screen items-center justify-center bg-base-200 px-4 py-10">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-content">
            <Code2 size={26} />
          </span>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
            <p className="mt-1 text-sm text-base-content/60">
              Log in to continue solving problems.
            </p>
          </div>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="surface-card flex flex-col gap-5 p-6 sm:p-8"
          noValidate
        >
          {error && (
            <div role="alert" className="alert alert-soft alert-error py-2 text-sm">
              <CircleAlert size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="emailId" className="text-sm font-medium">
              Email
            </label>
            <label
              className={`input input-bordered flex w-full items-center gap-2 ${
                errors.emailId ? "input-error" : ""
              }`}
            >
              <Mail size={16} className="opacity-50" />
              <input
                id="emailId"
                type="email"
                placeholder="john@example.com"
                className="grow"
                {...register("emailId")}
              />
            </label>
            {errors.emailId && (
              <span className="text-sm text-error">{errors.emailId.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <label
              className={`input input-bordered flex w-full items-center gap-2 ${
                errors.password ? "input-error" : ""
              }`}
            >
              <Lock size={16} className="opacity-50" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="grow"
                {...register("password")}
              />
              <button
                type="button"
                className="opacity-50 transition-opacity hover:opacity-100"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((s) => !s)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </label>
            {errors.password && (
              <span className="text-sm text-error">{errors.password.message}</span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary mt-1 w-full"
            disabled={loading}
          >
            {loading && <span className="loading loading-spinner loading-sm"></span>}
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-base-content/70">
          Don't have an account?{" "}
          <NavLink to="/signup" className="link link-primary font-medium">
            Sign up
          </NavLink>
        </p>
      </div>
    </div>
  );
}

export default Login;