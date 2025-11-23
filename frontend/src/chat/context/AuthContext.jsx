import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";

const AuthContext = createContext({
  user: null,
  token: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // ⬇ Load user + token from localStorage safely
  useEffect(() => {
    const storedUser = localStorage.getItem("asuser");
    const storedToken = localStorage.getItem("astoken");

    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setToken(storedToken);
      } catch (err) {
        console.log("Error parsing user:", err);
      }
    }

    setIsLoading(false);
  }, []);

  // ⬇ LOGIN FUNCTION (called from LoginPage)
  const login = (userData, tokenData) => {
    console.log("AuthContext login:", userData);
    console.log("AuthContext token:", tokenData);
    setUser(userData);
    // const t = localStorage.getItem("astoken");
    setToken(tokenData);
    return {
      userData: user,
      tokenData: token,
    };
  };

  const register = async (data) => {
    alert("Register API not implemented here.");
  };

  const logout = () => {
    localStorage.removeItem("asuser");
    localStorage.removeItem("astoken");
    setUser(null);
    setToken(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {isLoading ? <Loader /> : children}
    </AuthContext.Provider>
  );
};
