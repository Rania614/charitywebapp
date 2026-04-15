import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User, UserRole } from "@/types/domain";
import { apiFetch, clearAuthSession, getToken, setAuthSession } from "@/lib/api";

export type RegisterInput = {
  name: string;
  nationalId: string;
  password: string;
  email?: string;
  phone?: string;
  address?: string;
};

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  /** جاهز بعد التحقق من التوكن عند التحميل (أو عدم وجود توكن) */
  ready: boolean;
  login: (login: string, password: string) => Promise<void>;
  loginAsRole: (role: UserRole) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setReady(true);
      return;
    }

    const raw = localStorage.getItem("healthcare_user");
    if (raw) {
      try {
        setUser(JSON.parse(raw) as User);
      } catch {
        /* ignore */
      }
    }

    apiFetch<{ user: User }>("/api/auth/me")
      .then((d) => {
        setUser(d.user);
        localStorage.setItem("healthcare_user", JSON.stringify(d.user));
      })
      .catch(() => {
        clearAuthSession();
        setUser(null);
      })
      .finally(() => setReady(true));
  }, []);

  const login = useCallback(async (loginField: string, password: string) => {
    const data = await apiFetch<{ token: string; user: User }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ login: loginField.trim(), password }),
    });
    setAuthSession(data.token, data.user);
    setUser(data.user);
  }, []);

  const loginAsRole = useCallback(async (role: UserRole) => {
    const data = await apiFetch<{ token: string; user: User }>("/api/auth/demo-login", {
      method: "POST",
      body: JSON.stringify({ role }),
    });
    setAuthSession(data.token, data.user);
    setUser(data.user);
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const body = {
      name: input.name,
      nationalId: input.nationalId,
      password: input.password,
      email: input.email?.trim() || "",
      phone: input.phone?.trim() || "",
      address: input.address?.trim() || "",
    };
    const data = await apiFetch<{ token: string; user: User }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    });
    setAuthSession(data.token, data.user);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    clearAuthSession();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      ready,
      login,
      loginAsRole,
      register,
      logout,
    }),
    [user, ready, login, loginAsRole, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth يجب أن يُستخدم داخل AuthProvider");
  }
  return ctx;
}
