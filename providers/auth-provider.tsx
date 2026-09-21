import type { Session, User } from "@supabase/supabase-js";
import {
  createContext,
  type PropsWithChildren,
  useEffect,
  useState,
} from "react";
import { AppState, Platform } from "react-native";

import {
  getGoogleSignInModule,
  getNativeGoogleErrorMessage,
  shouldUseNativeGoogleSignIn,
} from "@/lib/google";
import { hasSupabaseEnv, supabase } from "@/lib/supabase";

const MISSING_CONFIG_MESSAGE =
  "Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to start Supabase auth.";

export type AuthContextValue = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  errorMessage: string | null;
  signInWithGoogle: () => Promise<void>;
  exchangeCodeForSession: (authCode: string) => Promise<void>;
  clearError: () => void;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!hasSupabaseEnv || !supabase) {
      setErrorMessage(MISSING_CONFIG_MESSAGE);
      setIsLoading(false);
      return;
    }

    const client = supabase;

    const loadSession = async () => {
      const { data, error } = await client.auth.getSession();

      if (!isMounted) {
        return;
      }

      if (error) {
        setErrorMessage(error.message);
      }

      setSession(data.session);
      setIsLoading(false);
    };

    void loadSession();

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) {
        return;
      }

      setSession(nextSession);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (Platform.OS === "web" || !hasSupabaseEnv || !supabase) {
      return;
    }

    const client = supabase;

    if (AppState.currentState === "active") {
      void client.auth.startAutoRefresh();
    }

    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        void client.auth.startAutoRefresh();
      } else {
        void client.auth.stopAutoRefresh();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const exchangeCodeForSession = async (_authCode: string) => {
    setErrorMessage(
      "OAuth sign-in is disabled for now. Use native Google Sign-In instead."
    );
  };

  const signInWithGoogle = async () => {
    if (!hasSupabaseEnv || !supabase) {
      setErrorMessage(MISSING_CONFIG_MESSAGE);
      return;
    }

    const client = supabase;

    if (!shouldUseNativeGoogleSignIn()) {
      setErrorMessage(
        "Only native Google Sign-In is enabled right now. Use a native build on iOS or Android."
      );
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const { GoogleSignin, isCancelledResponse } = await getGoogleSignInModule();

      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      const response = await GoogleSignin.signIn();

      if (isCancelledResponse(response)) {
        setIsLoading(false);
        return;
      }

      const { accessToken, idToken } = await GoogleSignin.getTokens();

      if (!idToken || !accessToken) {
        const tokenError = new Error(
          "Google sign-in did not return the tokens required by Supabase."
        );

        setErrorMessage(tokenError.message);
        setIsLoading(false);
        throw tokenError;
      }

      const { data, error } = await client.auth.signInWithIdToken({
        access_token: accessToken,
        provider: "google",
        token: idToken,
      });

      if (error) {
        setErrorMessage(error.message);
        setIsLoading(false);
        throw error;
      }

      setSession(data.session);
      setIsLoading(false);
    } catch (error) {
      const errorMessage = getNativeGoogleErrorMessage(error);

      setErrorMessage(errorMessage);
      setIsLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    if (!hasSupabaseEnv || !supabase) {
      setErrorMessage(MISSING_CONFIG_MESSAGE);
      setIsLoading(false);
      return;
    }

    const client = supabase;

    setErrorMessage(null);
    setIsLoading(true);

    const { error } = await client.auth.signOut();

    if (error) {
      setErrorMessage(error.message);
      setIsLoading(false);
      throw error;
    }

    if (Platform.OS !== "web") {
      try {
        const { GoogleSignin } = await getGoogleSignInModule();
        await GoogleSignin.signOut();
      } catch {
        // Ignore native Google sign-out errors when the user was not signed in with Google.
      }
    }

    setSession(null);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        clearError: () => setErrorMessage(null),
        errorMessage,
        exchangeCodeForSession,
        isAuthenticated: Boolean(session),
        isLoading,
        session,
        signInWithGoogle,
        signOut,
        user: session?.user ?? null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
