"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { authenticateWallet, updateUserRole } from "@/app/actions/auth";
import type { AuthStep, StoredSession, UserRole, WalletUser } from "@/types/auth";

const SESSION_KEY = "velora_auth_session";
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;

function getStoredSession(): StoredSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as StoredSession;
    if (Date.now() > session.expiresAt) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

function storeSession(session: StoredSession): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function clearSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
}

interface AuthContextValue {
  user: WalletUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isSigningIn: boolean;
  walletAddress: string | null;
  step: AuthStep;
  error: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  setRole: (role: UserRole) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used inside AuthProvider");
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { publicKey, connected, connecting, signMessage, disconnect } =
    useWallet();

  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<WalletUser | null>(null);
  const [step, setStep] = useState<AuthStep>("idle");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { setMounted(true); }, []);

  const realWalletAddress = publicKey?.toBase58() ?? null;
  const walletAddress = mounted ? realWalletAddress : null;

  useEffect(() => {
    if (!walletAddress) {
      setUser(null);
      setStep("idle");
      return;
    }

    const session = getStoredSession();
    if (session && session.walletAddress === walletAddress) {
      setUser({
        id: session.userId,
        walletAddress: session.walletAddress,
        displayName: null,
        avatarUrl: null,
        email: null,
        role: session.role,
        createdAt: new Date(session.signedAt).toISOString(),
        lastLogin: new Date(session.signedAt).toISOString(),
      });
      setStep(session.role ? "complete" : "role_selection");
    } else {
      setStep("wallet_connected");
    }
  }, [walletAddress]);

  useEffect(() => {
    if (!mounted) return;
    if (!connected && !connecting) {
      setUser(null);
      setStep("idle");
      clearSession();
    }
  }, [mounted, connected, connecting]);

  const signIn = useCallback(async () => {
    if (!publicKey || !signMessage || !walletAddress) {
      setError("Wallet not ready. Please try connecting again.");
      return;
    }

    setIsSigningIn(true);
    setError(null);
    setStep("signing");

    try {
      const nonce = Date.now().toString();
      const message =
        `Velora Authentication\n\n` +
        `Welcome to Velora, the wallet-native commerce platform on Solana.\n\n` +
        `Sign this message to verify your wallet and access your account. ` +
        `This is free and will not trigger any blockchain transaction.\n\n` +
        `Wallet: ${walletAddress}\n` +
        `Nonce: ${nonce}`;

      const messageBytes = new TextEncoder().encode(message);
      const signature = await signMessage(messageBytes);

      setStep("creating_account");

      const result = await authenticateWallet(
        walletAddress,
        message,
        Array.from(signature)
      );

      if (!result) {
        throw new Error("Authentication failed. Please try again.");
      }

      const now = Date.now();
      const session: StoredSession = {
        walletAddress,
        userId: result.userId,
        role: result.role,
        signedAt: now,
        expiresAt: now + SESSION_DURATION_MS,
      };
      storeSession(session);

      setUser({
        id: result.userId,
        walletAddress,
        displayName: null,
        avatarUrl: null,
        email: null,
        role: result.role,
        createdAt: new Date(now).toISOString(),
        lastLogin: new Date(now).toISOString(),
      });

      setStep(result.role ? "complete" : "role_selection");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Authentication failed";
      const isUserRejected =
        msg.toLowerCase().includes("user rejected") ||
        msg.toLowerCase().includes("declined") ||
        msg.toLowerCase().includes("cancelled");

      setError(
        isUserRejected
          ? "Signature declined. Sign in requires a one-time wallet signature."
          : msg
      );
      setStep("wallet_connected");
    } finally {
      setIsSigningIn(false);
    }
  }, [publicKey, signMessage, walletAddress]);

  const setRole = useCallback(
    async (role: UserRole) => {
      if (!user) return;
      setIsSigningIn(true);
      setError(null);
      try {
        await updateUserRole(user.id, user.walletAddress, role);

        const updatedUser: WalletUser = { ...user, role };
        setUser(updatedUser);

        const session = getStoredSession();
        if (session) {
          storeSession({ ...session, role });
        }

        setStep("complete");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save role");
      } finally {
        setIsSigningIn(false);
      }
    },
    [user]
  );

  const signOut = useCallback(async () => {
    clearSession();
    setUser(null);
    setStep("idle");
    setError(null);
    await disconnect();
  }, [disconnect]);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: connecting,
        isAuthenticated: !!user && step === "complete",
        isSigningIn,
        walletAddress,
        step,
        error,
        signIn,
        signOut,
        setRole,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
