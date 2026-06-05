"use client";

import { useRef, useState } from "react";
import { Loader2, Upload, Trash2, ShieldAlert } from "lucide-react";
import { MerchantAvatar } from "./MerchantAvatar";
import { uploadMerchantLogo } from "@/app/actions/merchant";

const ACCEPTED = ["image/png", "image/jpeg", "image/webp"];
const MAX_BYTES = 2 * 1024 * 1024; // 2 MB

interface LogoUploaderProps {
  walletAddress: string;
  /** Used for the fallback avatar initial. */
  businessName: string;
  /** Current logo URL held by the parent form. */
  value: string;
  onChange: (url: string) => void;
}

/**
 * Device-upload logo control. Uploads the selected image to Supabase Storage via
 * a server action and reports the resulting public URL back to the parent form
 * (persisted when the profile is saved). Supports preview, replace, and remove.
 */
export function LogoUploader({
  walletAddress,
  businessName,
  value,
  onChange,
}: LogoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasLogo = Boolean(value);
  const disabled = uploading || !walletAddress;

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file) return;

    setError(null);

    if (!ACCEPTED.includes(file.type)) {
      setError("Use a PNG, JPG, or WEBP image.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Logo must be 2 MB or smaller.");
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("walletAddress", walletAddress);
      fd.append("file", file);
      const res = await uploadMerchantLogo(fd);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      onChange(res.data.url);
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function handleRemove() {
    setError(null);
    onChange("");
  }

  return (
    <div className="space-y-2.5">
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleFile}
        className="sr-only"
        aria-hidden
        tabIndex={-1}
      />

      <div className="flex items-center gap-4">
        <div className="relative">
          <MerchantAvatar name={businessName || "V"} logoUrl={value} size={64} />
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-[18px] bg-white/70">
              <Loader2 className="w-5 h-5 animate-spin text-[#5427e6]" />
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={disabled}
            className="btn-secondary h-10 px-4 text-label-md inline-flex items-center gap-2 disabled:opacity-45 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {uploading ? "Uploading…" : hasLogo ? "Replace" : "Upload logo"}
          </button>

          {hasLogo && !uploading && (
            <button
              type="button"
              onClick={handleRemove}
              className="btn-ghost h-10 px-3 text-label-md inline-flex items-center gap-2 text-[#ba1a1a] hover:bg-[#fdf3f3]"
            >
              <Trash2 className="w-4 h-4" />
              Remove
            </button>
          )}
        </div>
      </div>

      {error ? (
        <p className="flex items-start gap-1.5 text-label-sm text-[#ba1a1a]">
          <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          {error}
        </p>
      ) : (
        <p className="text-label-sm text-[#797588]">
          PNG, JPG, or WEBP · up to 2 MB. Shown at checkout and on receipts.
        </p>
      )}
    </div>
  );
}
