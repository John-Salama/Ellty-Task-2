import { useState, type ReactNode } from "react";
import type { User } from "../types";
import { api } from "../services/api";
import { AuthContext } from "./AuthContextDef";

function getInitialUser() {
  const token = localStorage.getItem("token");
  const savedUser = localStorage.getItem("user");
  if (token && savedUser) {
    try {
      return JSON.parse(savedUser);
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getInitialUser);

  const login = async (username: string, password: string) => {
    const response = await api.login(username, password);
    setUser(response.user);
    localStorage.setItem("user", JSON.stringify(response.user));
  };

  const register = async (username: string, password: string) => {
    const response = await api.register(username, password);
    setUser(response.user);
    localStorage.setItem("user", JSON.stringify(response.user));
  };

  const logout = () => {
    api.logout();
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
