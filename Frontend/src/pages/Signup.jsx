import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../store/authSlice";
import { Link } from "react-router";

// Schema validation for signup
const signupSchema = z.object({
  firstName: z.string().min(3, "Name should contain at least 3 characters"),
  emailId: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password should contain at least 8 characters"),
});

// Eye icons (inline SVG, no extra package needed)
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.53 13.53 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" x2="22" y1="2" y2="22" />
  </svg>
);

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
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit(submittedData)}
        className="w-full max-w-md flex flex-col gap-5 px-4"
        noValidate
      >
        <h1 className="text-4xl font-bold text-center mb-2">Leetcode</h1>

        {/* First Name */}
        <div className="flex flex-col gap-1">
          <label htmlFor="firstName">First Name</label>
          <input
            id="firstName"
            type="text"
            placeholder="John"
            className={`input input-bordered w-full ${errors.firstName ? "input-error" : ""}`}
            {...register("firstName")}
          />
          {errors.firstName && (
            <span className="text-error text-sm">{errors.firstName.message}</span>
          )}
        </div>

        {/* Email */}
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

        {/* Password with eye button */}
        <div className="flex flex-col gap-1">
          <label htmlFor="password">Password</label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className={`input input-bordered w-full pr-12 ${errors.password ? "input-error" : ""}`}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/60 hover:text-base-content"
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          {errors.password && (
            <span className="text-error text-sm">{errors.password.message}</span>
          )}
        </div>

        {/* Server error (e.g. email already exists) */}
        {error && <span className="text-error text-sm text-center">{error}</span>}

        <button
          type="submit"
          className="btn btn-primary self-center px-8 mt-2"
          disabled={loading}
        >
          {loading && <span className="loading loading-spinner loading-sm" />}
          Sign Up
        </button>
        <p className="text-center text-sm">
      Already have an account?{" "}
      <Link to="/login" className="link link-primary">
         Log in
     </Link>
       </p>
      </form>
    </div>
  );
}

export default Signup;