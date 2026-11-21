import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router";
import { Code2, User, Mail, Lock, Eye, EyeOff, CircleAlert } from "lucide-react";
import { registerUser } from "../store/authSlice";

// Schema validation for signup
const signupSchema = z.object({
  firstName: z.string().min(3, "Name should contain at least 3 characters"),
  emailId: z.string().email("Enter a valid email address"),
  password: z
  .string()
  .min(8, "Password should contain at least 8 characters")
  .regex(/[a-z]/, "Add a lowercase letter")
  .regex(/[A-Z]/, "Add an uppercase letter")
  .regex(/[0-9]/, "Add a number")
  .regex(/[^a-zA-Z0-9]/, "Add a symbol like @ or !"),
});

function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(signupSchema) });

  const submittedData = (data) => {
    dispatch(registerUser(data));
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
            <h1 className="text-3xl font-bold tracking-tight">Create your account</h1>
            <p className="mt-1 text-sm text-base-content/60">
              Sign up to start practicing coding problems.
            </p>
          </div>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit(submittedData)}
          className="surface-card flex flex-col gap-5 p-6 sm:p-8"
          noValidate
        >
          {/* Server error (e.g. email already exists) */}
          {error && (
            <div role="alert" className="alert alert-soft alert-error py-2 text-sm">
              <CircleAlert size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* First Name */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="firstName" className="text-sm font-medium">
              First name
            </label>
            <label
              className={`input input-bordered flex w-full items-center gap-2 ${
                errors.firstName ? "input-error" : ""
              }`}
            >
              <User size={16} className="opacity-50" />
              <input
                id="firstName"
                type="text"
                placeholder="John"
                className="grow"
                {...register("firstName")}
              />
            </label>
            {errors.firstName && (
              <span className="text-sm text-error">{errors.firstName.message}</span>
            )}
          </div>

          {/* Email */}
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

          {/* Password with show/hide button */}
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
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="opacity-50 transition-opacity hover:opacity-100"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </label>
            {errors.password ? (
              <span className="text-sm text-error">{errors.password.message}</span>
            ) : (
              <span className="text-xs text-base-content/50">
                Use at least 8 characters.
              </span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary mt-1 w-full"
            disabled={loading}
          >
            {loading && <span className="loading loading-spinner loading-sm" />}
            Sign Up
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-base-content/70">
          Already have an account?{" "}
          <Link to="/login" className="link link-primary font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;