import { createContext, useContext, useEffect, useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import type { User } from "@shared/schema";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  loginWithOTP: (email: string, otp: string) => Promise<void>;
  sendOTP: (email: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await apiRequest("GET", "/api/user/me");
      const userData = await response.json();
      setUser(userData);
    } catch (error) {
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await apiRequest("POST", "/api/auth/login", { email, password });
    const { user, token } = await response.json();
    localStorage.setItem("token", token);
    setUser(user);
  };

  const register = async (username: string, email: string, password: string) => {
    const response = await apiRequest("POST", "/api/auth/register", { username, email, password });
    const { user, token } = await response.json();
    localStorage.setItem("token", token);
    setUser(user);
  };

  const sendOTP = async (email: string) => {
    await apiRequest("POST", "/api/auth/otp/send", { email });
  };

  const loginWithOTP = async (email: string, otp: string) => {
    const response = await apiRequest("POST", "/api/auth/otp/verify", { email, otp });
    const { user, token } = await response.json();
    localStorage.setItem("token", token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      loginWithOTP,
      sendOTP,
      logout,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
