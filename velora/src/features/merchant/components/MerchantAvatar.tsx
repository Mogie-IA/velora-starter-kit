"use client";

import { useState } from "react";
import { cn, safeHttpUrl } from "@/lib/utils";

interface MerchantAvatarProps {
  name: string;
  logoUrl?: string | null;
  size?: number;
  className?: string;
}

/**
 * Merchant brand mark: renders the logo image when a valid URL is provided and
 * loads successfully, otherwise falls back to a gradient tile with the
 * business's first initial.
 */
export function MerchantAvatar({
  name,
  logoUrl,
  size = 44,
  className,
}: MerchantAvatarProps) {
  const [errored, setErrored] = useState(false);
  const initial = (name?.trim()?.charAt(0) || "V").toUpperCase();
  const safeLogo = safeHttpUrl(logoUrl);
  const showImage = Boolean(safeLogo) && !errored;
  const radius = Math.round(size * 0.28);

  return (
    <div
      className={cn(
        "relative flex items-center justify-center flex-shrink-0 overflow-hidden",
        !showImage && "bg-velora-gradient",
        className
      )}
      style={{ width: size, height: size, borderRadius: radius }}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={safeLogo as string}
          alt={`${name} logo`}
          width={size}
          height={size}
          className="h-full w-full object-cover"
          onError={() => setErrored(true)}
        />
      ) : (
        <span
          className="font-bold text-white"
          style={{ fontSize: Math.round(size * 0.42) }}
        >
          {initial}
        </span>
      )}
    </div>
  );
}
