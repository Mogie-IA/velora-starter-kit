"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  value: string;
  label?: string;
  className?: string;
}

export function CopyButton({ value, label = "Copy", className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard may be unavailable (e.g. insecure context); fail silently.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn("btn-secondary inline-flex items-center gap-2", className)}
      aria-label={label}
    >
      {copied ? (
        <Check className="w-4 h-4 text-[#007d51]" />
      ) : (
        <Copy className="w-4 h-4" />
      )}
      {copied ? "Copied" : label}
    </button>
  );
}
