import { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../api/axios";
import toast from "react-hot-toast";

export default function ResetPassword() {

  const { token } = useParams();

  const [password, setPassword] = useState("");

  const submit = async (e) => {

    e.preventDefault();

    await axios.post(`/auth/reset-password/${token}`, { password });

    toast.success("Password reset successful");

  };

  return (

    <div className="flex justify-center items-center min-h-screen bg-gray-100">

      <form
        onSubmit={submit}
        className="bg-white p-8 rounded-xl shadow w-96"
      >

        <h2 className="text-xl font-bold mb-4 text-center">
          Reset Password
        </h2>

        <input
          type="password"
          placeholder="New password"
          className="border p-2 w-full mb-4 rounded"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />

        <button
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          Reset Password
        </button>

      </form>

    </div>

  );

}