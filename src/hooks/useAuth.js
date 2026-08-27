import { useState, useEffect } from "react";

// Simple auth hook managing user login state in localStorage
export function useAuth() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("safar360User");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (userData) => {
    localStorage.setItem("safar360User", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("safar360User");
    setUser(null);
  };

  return {
    user,
    login,
    logout,
  };
}
