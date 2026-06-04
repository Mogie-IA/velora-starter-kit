"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthContext } from "@/features/auth/context/AuthContext";
import { SignInPrompt } from "./SignInPrompt";
import { RoleSelection } from "./RoleSelection";
import type { UserRole } from "@/types/auth";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { step, user, isLoading } = useAuthContext();
  const router = useRouter();

  const isComplete = step === "complete";
  const isRoleSelection = step === "role_selection";
  const needsAuth = !isComplete && !isRoleSelection;

  useEffect(() => {
    if (isComplete && user?.role && requiredRole && user.role !== requiredRole) {
      const redirectPath =
        user.role === "merchant"
          ? "/merchant/dashboard"
          : "/consumer/dashboard";
      router.replace(redirectPath);
    }
  }, [isComplete, user?.role, requiredRole, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-[10px] bg-velora-gradient animate-pulse" />
          <p className="text-label-md text-[#797588]">Loading…</p>
        </div>
      </div>
    );
  }

  if (needsAuth) {
    return (
      <div className="relative min-h-screen overflow-hidden">
        <div
          className="pointer-events-none select-none"
          style={{ filter: "blur(4px)", opacity: 0.35 }}
          aria-hidden
        >
          {children}
        </div>
        <SignInPrompt />
      </div>
    );
  }

  if (isRoleSelection) {
    return (
      <div className="relative min-h-screen overflow-hidden">
        <div
          className="pointer-events-none select-none"
          style={{ filter: "blur(4px)", opacity: 0.35 }}
          aria-hidden
        >
          {children}
        </div>
        <RoleSelection />
      </div>
    );
  }

  if (isComplete && user?.role && requiredRole && user.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}
