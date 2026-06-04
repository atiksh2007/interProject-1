import { createContext, useContext, useState } from "react";
const C = createContext(null);
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    return token ? { token, role: localStorage.getItem("role"), userId: localStorage.getItem("userId"), name: localStorage.getItem("name") } : null;
  });
  const login = (d) => {
    localStorage.setItem("token", d.token); localStorage.setItem("role", d.role);
    localStorage.setItem("userId", d.userId); localStorage.setItem("name", d.name);
    setUser(d);
  };
  const logout = () => { localStorage.clear(); setUser(null); };
  return <C.Provider value={{ user, login, logout, isAuthenticated: !!user }}>{children}</C.Provider>;
};
export const useAuthContext = () => useContext(C);
