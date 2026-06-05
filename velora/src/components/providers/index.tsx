"use client";

import React from "react";
import { WalletProvider } from "./WalletProvider";
import { QueryProvider } from "./QueryProvider";
import { AuthProvider } from "@/features/auth";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryProvider>
      <WalletProvider>
        <AuthProvider>{children}</AuthProvider>
      </WalletProvider>
    </QueryProvider>
  );
}
