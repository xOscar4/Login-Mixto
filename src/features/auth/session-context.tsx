import * as Linking from "expo-linking";
import { router } from "expo-router";
import {
    createContext,
    use,
    useCallback,
    useEffect,
    useMemo,
    useState,
    type PropsWithChildren,
} from "react";

import { supabase } from "@/lib/supabase";
import { exchangeCodeForSessionOnce } from "@/services/auth";
import type { Session, User } from "@supabase/supabase-js";

type SessionContextValue = {
  /**
   * Vista previa de la interfaz. Se conserva como modo temporal.
   */
  isPreview: boolean;
  isAuthenticated: boolean;
  loading: boolean;
  session: Session | null;
  user: User | null;
  enterPreview: () => void;
  exitPreview: () => void;
  refreshSession: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: PropsWithChildren) {
  const [isPreview, setIsPreview] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const applySession = useCallback((nextSession: Session | null) => {
    setSession(nextSession);
    setUser(nextSession?.user ?? null);
  }, []);

  const refreshSession = useCallback(async () => {
    const {
      data: { session: nextSession },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.warn("[Melody] getSession error:", error.message);
      applySession(null);
      setLoading(false);
      return;
    }

    applySession(nextSession);
    setLoading(false);
  }, [applySession]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refreshSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      applySession(nextSession);
      setLoading(false);

      if (_event === "SIGNED_OUT") {
        setIsPreview(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [applySession, refreshSession]);

  useEffect(() => {
    const handleAuthCallback = async (url: string | null) => {
      if (!url) {
        return;
      }

      try {
        const parsedUrl = new URL(url);
        const code = parsedUrl.searchParams.get("code");
        const authError = parsedUrl.searchParams.get("error");
        const authDescription =
          parsedUrl.searchParams.get("error_description") ??
          "No se pudo completar la autenticación.";
        const tokenHash = parsedUrl.searchParams.get("token_hash");
        const type = parsedUrl.searchParams.get("type");

        if (code) {
          await exchangeCodeForSessionOnce(code);
          await refreshSession();
          router.replace("/home");
          return;
        }

        if (authError) {
          console.warn("[Melody] OAuth callback error:", authDescription);
          return;
        }

        if (!tokenHash || !type) {
          return;
        }

        if (type === "recovery") {
          router.replace(
            `/reset-password?token_hash=${encodeURIComponent(tokenHash)}&type=${encodeURIComponent(type)}`,
          );
          return;
        }

        const { error } = await supabase.auth.verifyOtp({
          type: type as "email" | "signup",
          token_hash: tokenHash,
        });

        if (error) {
          console.warn("[Melody] verifyOtp error:", error.message);
          return;
        }

        await refreshSession();
        router.replace("/home");
      } catch (error) {
        console.warn("[Melody] auth callback unavailable:", error);
      }
    };

    const subscription = Linking.addEventListener("url", (event) => {
      void handleAuthCallback(event.url);
    });

    void Linking.getInitialURL().then((url) => {
      void handleAuthCallback(url);
    });

    return () => {
      subscription.remove();
    };
  }, [refreshSession]);

  const value = useMemo<SessionContextValue>(
    () => ({
      isPreview,
      isAuthenticated: Boolean(session?.user),
      loading,
      session,
      user,
      enterPreview: () => setIsPreview(true),
      exitPreview: () => setIsPreview(false),
      refreshSession,
    }),
    [isPreview, loading, refreshSession, session, user],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  const value = use(SessionContext);

  if (!value) {
    throw new Error("useSession debe usarse dentro de SessionProvider");
  }

  return value;
}
