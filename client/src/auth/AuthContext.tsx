import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api, superTokenStore, tokenStore } from "../lib/api";
import type { Me, Restaurant } from "../lib/types";

interface AuthState {
  me: Me | null;
  loading: boolean;
  login(email: string, password: string): Promise<Me | null>;
  register(data: { email: string; password: string; restaurantName: string; slug: string }): Promise<void>;
  logout(): void;
  setRestaurant(r: Restaurant): void;
  /** Süper admin: bir restoranın paneline gir */
  impersonate(restaurantId: string): Promise<void>;
  /** Restoran panelinden süper admin paneline geri dön */
  stopImpersonating(): Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

/** Kullanıcının gitmesi gereken ana sayfa */
export function homeFor(me: Me | null) {
  if (!me) return "/login";
  if (me.user.role === "superadmin" && !me.impersonating && !me.restaurant) return "/super";
  return "/admin";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(() => Boolean(tokenStore.get()));

  const loadMe = useCallback(async (): Promise<Me | null> => {
    try {
      const data = await api<Me>("/auth/me");
      setMe(data);
      return data;
    } catch {
      tokenStore.clear();
      setMe(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tokenStore.get()) loadMe();
    const onLogout = () => {
      // Panel token'ının süresi dolduysa süper admin oturumuna dön
      const superToken = superTokenStore.get();
      if (superToken) {
        superTokenStore.clear();
        tokenStore.set(superToken);
        loadMe();
      } else {
        setMe(null);
      }
    };
    window.addEventListener("auth:logout", onLogout);
    return () => window.removeEventListener("auth:logout", onLogout);
  }, [loadMe]);

  const value: AuthState = {
    me,
    loading,
    async login(email, password) {
      const { token } = await api<{ token: string }>("/auth/login", { method: "POST", body: { email, password } });
      superTokenStore.clear();
      tokenStore.set(token);
      return loadMe();
    },
    async register(data) {
      const { token } = await api<{ token: string }>("/auth/register", { method: "POST", body: data });
      superTokenStore.clear();
      tokenStore.set(token);
      await loadMe();
    },
    logout() {
      tokenStore.clear();
      superTokenStore.clear();
      setMe(null);
    },
    setRestaurant(restaurant) {
      setMe((m) => (m ? { ...m, restaurant } : m));
    },
    async impersonate(restaurantId) {
      const current = tokenStore.get();
      const { token } = await api<{ token: string }>(`/super/restaurants/${restaurantId}/impersonate`, {
        method: "POST",
      });
      if (current) superTokenStore.set(current);
      tokenStore.set(token);
      await loadMe();
    },
    async stopImpersonating() {
      const superToken = superTokenStore.get();
      superTokenStore.clear();
      if (superToken) tokenStore.set(superToken);
      else tokenStore.clear();
      await loadMe();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth, AuthProvider içinde kullanılmalı");
  return ctx;
}
