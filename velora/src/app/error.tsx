"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen bg-[#faf8ff] flex items-center justify-center">
      <div className="text-center space-y-6 animate-slide-up px-4 max-w-md mx-auto">
        <div className="tx-icon mx-auto w-14 h-14 rounded-[16px] bg-[rgba(186,26,26,0.10)]">
          <span className="text-2xl">⚠️</span>
        </div>
        <div>
          <h1 className="text-headline-md text-[#1a1b21]">Something went wrong</h1>
          <p className="text-body-md text-[#484556] mt-2">
            {error.message ?? "An unexpected error occurred."}
          </p>
        </div>
        <button onClick={reset} className="btn-primary mx-auto">
          Try again
        </button>
      </div>
    </main>
  );
}
