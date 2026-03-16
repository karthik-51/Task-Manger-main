import { useState } from "react";
import axios from "../api/axios";
import toast from "react-hot-toast";

export default function ForgotPassword() {

  const [email, setEmail] = useState("");

  const submit = async (e) => {
    e.preventDefault();

    await axios.post("/auth/forgot-password", { email });

    toast.success("Reset link sent to email");
  };

  return (

    <div className="flex justify-center items-center min-h-screen bg-gray-100">

      <form
        onSubmit={submit}
        className="bg-white p-8 rounded-xl shadow w-96"
      >

        <h2 className="text-xl font-bold mb-4 text-center">
          Forgot Password
        </h2>

        <input
          type="email"
          placeholder="Enter email"
          className="border p-2 w-full mb-4 rounded"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
        />

        <button
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          Send Reset Link
        </button>

      </form>

    </div>

  );

}