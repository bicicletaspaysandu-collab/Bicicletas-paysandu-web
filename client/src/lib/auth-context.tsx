"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { apiFetch } from "./api";
import type { AuthUser, Role } from "./types";

import { hashPassword } from "./crypto";

const TOKEN_KEY = "bp_access_token";
const ROLE_KEY = "bp_role";

interface AuthContextValue {
  user: AuthUser | null;
  role: Role | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<{ autoLogin: boolean }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface LoginResponse {
  message: string;
  session: { access_token: string };
  user: { id: string; email: string };
}

/**
 * El backend no expone el rol en /api/auth/me, por lo que se detecta
 * consultando un endpoint exclusivo de administradores: si responde 200
 * el usuario es admin; si responde 403 es cliente.
 */
async function detectarRol(token: string): Promise<Role> {
  try {
    await apiFetch("/api/reservations", { token });
    return "admin";
  } catch {
    return "cliente";
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Restaurar sesión guardada al cargar la aplicación
  useEffect(() => {
    const restaurarSesion = async () => {
      const stored = localStorage.getItem(TOKEN_KEY);
      if (!stored) return;

      try {
        const { user } = await apiFetch<{ user: AuthUser }>("/api/auth/me", {
          token: stored,
        });
        setUser({ id: user.id, email: user.email });
        setToken(stored);
        const storedRole = localStorage.getItem(ROLE_KEY) as Role | null;
        if (storedRole === "admin" || storedRole === "cliente") {
          setRole(storedRole);
        } else {
          const rol = await detectarRol(stored);
          localStorage.setItem(ROLE_KEY, rol);
          setRole(rol);
        }
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(ROLE_KEY);
      }
    };

    restaurarSesion().finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const hashedPassword = await hashPassword(password);
    const data = await apiFetch<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password: hashedPassword, rawPassword: password }),
    });

    const accessToken = data.session.access_token;
    const rol = await detectarRol(accessToken);

    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(ROLE_KEY, rol);
    setToken(accessToken);
    setUser({ id: data.user.id, email: data.user.email });
    setRole(rol);
  }, []);

  const signup = useCallback(
    async (email: string, password: string) => {
      const hashedPassword = await hashPassword(password);
      await apiFetch("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({ email, password: hashedPassword }),
      });

      // Intentar iniciar sesión automáticamente. Puede fallar si el
      // proyecto de Supabase exige confirmación por correo.
      try {
        await login(email, password);
        return { autoLogin: true };
      } catch {
        return { autoLogin: false };
      }
    },
    [login]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
    setToken(null);
    setUser(null);
    setRole(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, role, token, loading, login, signup, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  }
  return ctx;
}
