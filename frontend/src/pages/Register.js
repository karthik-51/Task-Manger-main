import { useState, useContext } from "react";
import { AuthContext } from "../auth/AuthContext";

export default function Register() {
  const { register } = useContext(AuthContext);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const submit = (e) => {
    e.preventDefault();
    register(form);
  };

  return (
    <div className="flex justify-center mt-20">
      <form onSubmit={submit} className="bg-white p-6 shadow w-96">
        <h2 className="text-xl mb-4">Register</h2>
        <input
          className="border p-2 w-full mb-2"
          placeholder="Name"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          className="border p-2 w-full mb-2"
          placeholder="Email"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          className="border p-2 w-full mb-4"
          placeholder="Password"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button className="bg-green-600 text-white w-full py-2">
          Register
        </button>
      </form>
    </div>
  );
}