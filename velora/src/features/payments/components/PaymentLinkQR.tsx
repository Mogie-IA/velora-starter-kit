"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { cn } from "@/lib/utils";

interface PaymentLinkQRProps {
  value: string;
  size?: number;
  className?: string;
}

export function PaymentLinkQR({ value, size = 200, className }: PaymentLinkQRProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(value, {
      width: size,
      margin: 1,
      color: { dark: "#1a1b21", light: "#ffffff" },
    })
      .then((url) => {
        if (active) setDataUrl(url);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [value, size]);

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-[16px] bg-white border border-[#e8e7ef] p-3",
        className
      )}
      style={{ width: size + 24, height: size + 24 }}
    >
      {error ? (
        <span className="text-label-sm text-[#797588]">QR unavailable</span>
      ) : dataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={dataUrl} alt="Payment link QR code" width={size} height={size} />
      ) : (
        <div
          className="animate-pulse rounded-[10px] bg-[#eeedf5]"
          style={{ width: size, height: size }}
        />
      )}
    </div>
  );
}
