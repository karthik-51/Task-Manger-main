// import { useState, useContext } from "react";
// import { AuthContext } from "../auth/AuthContext";

// export default function Register() {
//   const { register } = useContext(AuthContext);
//   const [form, setForm] = useState({ name: "", email: "", password: "" });

//   const submit = (e) => {
//     e.preventDefault();
//     register(form);
//   };

//   return (
//     <div className="flex justify-center mt-20">
//       <form onSubmit={submit} className="bg-white p-6 shadow w-96">
//         <h2 className="text-xl mb-4">Register</h2>
//         <input
//           className="border p-2 w-full mb-2"
//           placeholder="Name"
//           onChange={(e) => setForm({ ...form, name: e.target.value })}
//         />
//         <input
//           className="border p-2 w-full mb-2"
//           placeholder="Email"
//           onChange={(e) => setForm({ ...form, email: e.target.value })}
//         />
//         <input
//           type="password"
//           className="border p-2 w-full mb-4"
//           placeholder="Password"
//           onChange={(e) => setForm({ ...form, password: e.target.value })}
//         />
//         <button className="bg-green-600 text-white w-full py-2">
//           Register
//         </button>
//       </form>
//     </div>
//   );
// }

import { useContext, useState } from "react";
import { AuthContext } from "../auth/AuthContext";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

const schema = z
  .object({
    name: z.string().min(3, "Name must be at least 3 characters"),

    email: z
      .string()
      .email("Invalid email address"),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain uppercase letter")
      .regex(/[a-z]/, "Must contain lowercase letter")
      .regex(/[0-9]/, "Must contain number")
      .regex(/[^A-Za-z0-9]/, "Must contain special character"),

    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  });

export default function Register() {

  const { register: registerUser } = useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(schema)
  });

  const password = watch("password", "");

  const getStrength = () => {
    if (password.length < 6) return "Weak";
    if (password.match(/[A-Z]/) && password.match(/[0-9]/)) return "Strong";
    return "Medium";
  };

  const onSubmit = async (data) => {
    try {

      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password
      });

      toast.success("Account created successfully 🎉");

    } catch (err) {

      toast.error(
        err?.response?.data?.message ||
          "Registration failed"
      );
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white shadow-xl rounded-2xl p-8 w-96"
      >

        <h2 className="text-2xl font-bold mb-6 text-center text-gray-700">
          Create Account
        </h2>

        {/* Name */}
        <div className="mb-4">
          <input
            {...register("name")}
            placeholder="Full Name"
            className="border p-2 w-full rounded focus:ring-2 focus:ring-green-500"
          />
          <p className="text-red-500 text-sm">{errors.name?.message}</p>
        </div>

        {/* Email */}
        <div className="mb-4">
          <input
            {...register("email")}
            placeholder="Email"
            className="border p-2 w-full rounded focus:ring-2 focus:ring-green-500"
          />
          <p className="text-red-500 text-sm">{errors.email?.message}</p>
        </div>

        {/* Password */}
        <div className="mb-4 relative">
          <input
            type={showPassword ? "text" : "password"}
            {...register("password")}
            placeholder="Password"
            className="border p-2 w-full rounded focus:ring-2 focus:ring-green-500"
          />

          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2 cursor-pointer text-gray-500"
          >
            {showPassword ? "Hide" : "Show"}
          </span>

          <p className="text-red-500 text-sm">{errors.password?.message}</p>

          {/* Password Strength */}
          {password && (
            <p className="text-sm mt-1 text-gray-600">
              Strength: <b>{getStrength()}</b>
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="mb-6">
          <input
            type="password"
            {...register("confirmPassword")}
            placeholder="Confirm Password"
            className="border p-2 w-full rounded focus:ring-2 focus:ring-green-500"
          />
          <p className="text-red-500 text-sm">
            {errors.confirmPassword?.message}
          </p>
        </div>

        {/* Button */}
        <button
          disabled={isSubmitting}
          className="bg-green-600 hover:bg-green-700 text-white w-full py-2 rounded font-semibold transition"
        >
          {isSubmitting ? "Registering..." : "Register"}
        </button>

      </form>

    </div>
  );
}