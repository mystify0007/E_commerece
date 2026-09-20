import { createContext, useCallback, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getAccessToken, setTokens, clearTokens } from "../services/api.js";
import {
  loginRequest,
  registerRequest,
  logoutRequest,
  getMeRequest,
} from "../services/authService.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function hydrate() {
      if (!getAccessToken()) {
        setIsLoading(false);
        return;
      }
      try {
        const me = await getMeRequest();
        setUser(me);
      } catch {
        clearTokens();
      } finally {
        setIsLoading(false);
      }
    }
    hydrate();
  }, []);

  const login = useCallback(async (credentials) => {
    const result = await loginRequest(credentials);
    setTokens(result);
    setUser(result.user);
    return result.user;
  }, []);

  const register = useCallback(async (payload) => {
    const result = await registerRequest(payload);
    setTokens(result);
    setUser(result.user);
    return result.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } catch {
      // even if the server call fails, clear local session state
    } finally {
      clearTokens();
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

export function withErrorToast(promise, fallbackMessage) {
  return promise.catch((err) => {
    const message = err?.response?.data?.message || fallbackMessage;
    toast.error(message);
    throw err;
  });
}
