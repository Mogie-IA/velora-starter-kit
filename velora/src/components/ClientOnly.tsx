"use client";

import { useEffect, useState } from "react";

interface ClientOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Renders children only after the component has mounted on the client.
 *
 * During SSR and the initial client hydration render, only `fallback` is
 * rendered — guaranteeing the server and client output match. Children that
 * depend on browser-only state (wallet adapter, localStorage, window, etc.)
 * are then rendered after mount, avoiding hydration mismatches.
 */
export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <>{fallback}</>;
  return <>{children}</>;
}
