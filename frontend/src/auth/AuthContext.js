// import { createContext, useState } from "react";
// import axios from "../api/axios";
// import { useNavigate } from "react-router-dom";

// export const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const navigate = useNavigate();
//   const [user, setUser] = useState(
//     localStorage.getItem("accessToken") || null
//   );

//   const login = async (email, password) => {
//     const res = await axios.post("/auth/login", { email, password });
//     localStorage.setItem("accessToken", res.data.accessToken);
//     localStorage.setItem("refreshToken", res.data.refreshToken);
//     setUser(res.data.accessToken);
//     navigate("/dashboard");
//   };

//   const register = async (data) => {
//     await axios.post("/auth/register", data);
//     navigate("/");
//   };

//   const logout = () => {
//     localStorage.removeItem("accessToken");
//     localStorage.removeItem("refreshToken");
//     setUser(null);
//     navigate("/");
//   };

//   return (
//     <AuthContext.Provider value={{ user, login, register, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

import { createContext, useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const navigate = useNavigate();

  // SAFE localStorage parsing
  const getStoredUser = () => {
    try {
      const stored = localStorage.getItem("user");
      if (!stored || stored === "undefined") return null;
      return JSON.parse(stored);
    } catch (error) {
      console.error("Invalid user in localStorage");
      return null;
    }
  };

  const [user, setUser] = useState(getStoredUser());

  const login = async (email, password) => {

    const res = await axios.post("/auth/login", { email, password });

    localStorage.setItem("accessToken", res.data.accessToken);
    localStorage.setItem("refreshToken", res.data.refreshToken);

    if (res.data.user) {
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setUser(res.data.user);
    }

    navigate("/dashboard");
  };

  const register = async (data) => {
    await axios.post("/auth/register", data);
    navigate("/");
  };

  const logout = () => {

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    setUser(null);

    navigate("/");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};