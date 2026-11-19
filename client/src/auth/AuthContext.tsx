import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api, tokenStore } from "../lib/api";
import type { Me, Restaurant } from "../lib/types";

interface AuthState {
  me: Me | null;
  loading: boolean;
  login(email: string, password: string): Promise<void>;
  register(data: { email: string; password: string; restaurantName: string; slug: string }): Promise<void>;
  logout(): void;
  setRestaurant(r: Restaurant): void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(() => Boolean(tokenStore.get()));

  const loadMe = useCallback(async () => {
    try {
      setMe(await api<Me>("/auth/me"));
    } catch {
      tokenStore.clear();
      setMe(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tokenStore.get()) loadMe();
    const onLogout = () => setMe(null);
    window.addEventListener("auth:logout", onLogout);
    return () => window.removeEventListener("auth:logout", onLogout);
  }, [loadMe]);

  const value: AuthState = {
    me,
    loading,
    async login(email, password) {
      const { token } = await api<{ token: string }>("/auth/login", { method: "POST", body: { email, password } });
      tokenStore.set(token);
      await loadMe();
    },
    async register(data) {
      const { token } = await api<{ token: string }>("/auth/register", { method: "POST", body: data });
      tokenStore.set(token);
      await loadMe();
    },
    logout() {
      tokenStore.clear();
      setMe(null);
    },
    setRestaurant(restaurant) {
      setMe((m) => (m ? { ...m, restaurant } : m));
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth, AuthProvider içinde kullanılmalı");
  return ctx;
}
