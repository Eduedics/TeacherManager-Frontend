import api from "../util/Axios";
import { createContext, useState, useEffect, useCallback } from "react";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [loading,setLoading] =useState(true)
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const decoded = jwtDecode(token);
        const now = Date.now() / 1000; 

        if (decoded.exp && decoded.exp < now) {
          const refreshToken = localStorage.getItem("refreshToken");
          if (refreshToken) {
            try {
              const res = await api.post("token/refresh/", { refresh: refreshToken });
              const newAccess = res.data.access;
              localStorage.setItem("token", newAccess);
              setToken(newAccess);

              const newDecoded = jwtDecode(newAccess);
              setUser({
                id: newDecoded.user_id,
                username: newDecoded.username,
                role: newDecoded.role,
              });
              setLoading(false);
              return;
            } catch (err) {
              console.error("Refresh failed", err);
              logout();
              return;
            }
          } else {
            logout();
            return;
          }
        }

        setUser({
          id: decoded.user_id,
          username: decoded.username,
          role: decoded.role,
        });
      } catch (err) {
        console.log("Invalid token", err);
        logout();
      }finally{
        setLoading(false)
      }
    };

    validateToken();
  }, [token]);

  const login = async (username, password) => {
    try {
      const res = await api.post("login/", { username, password });
      const newToken = res.data.access;
      const refreshToken = res.data.refresh;

      localStorage.setItem("token", newToken);
      localStorage.setItem("refreshToken", refreshToken);
      setToken(newToken);

      const decoded = jwtDecode(newToken);
      setUser({
        id: decoded.user_id,
        username: decoded.username,
        role: decoded.role,
      });

      return true;
    } catch (err) {
      console.log("Login failed", err);
      return false;
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    setToken(null);
    setUser(null);
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout,loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;