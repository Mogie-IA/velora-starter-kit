"use client";

import { useEffect, useState } from "react";
import { Sparkles, X, Store, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMerchantProfile } from "../hooks/useMerchantProfile";
import { computeProfileCompletion } from "../completion";
import { MerchantProfileForm } from "./MerchantProfileForm";
import { ProfileCompletionMeter } from "./ProfileCompletion";

const DISMISS_PREFIX = "velora_onboarding_dismissed_";

/**
 * First-run prompt nudging the merchant to set up their storefront profile.
 * Appears on the dashboard when the profile is missing or incomplete; it never
 * blocks the dashboard — it can be dismissed (per wallet) and reopened from
 * Settings. A brand-new merchant (no profile yet) gets the setup dialog opened
 * automatically once.
 */
export function OnboardingBanner({ walletAddress }: { walletAddress: string }) {
  const { data: profile, isLoading, error } = useMerchantProfile(walletAddress);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dismissed, setDismissed] = useState(true);
  const [autoOpened, setAutoOpened] = useState(false);

  const dismissKey = `${DISMISS_PREFIX}${walletAddress}`;

  useEffect(() => {
    if (typeof window === "undefined") return;
    setDismissed(localStorage.getItem(dismissKey) === "1");
  }, [dismissKey]);

  const completion = computeProfileCompletion(profile ?? null);
  const dbNotSetup =
    error instanceof Error &&
    error.message.toLowerCase().includes("database not set up");

  // Auto-open the setup dialog once for a brand-new merchant (no profile yet).
  useEffect(() => {
    if (
      !autoOpened &&
      !isLoading &&
      !error &&
      profile === null &&
      !dismissed
    ) {
      setDialogOpen(true);
      setAutoOpened(true);
    }
  }, [autoOpened, isLoading, error, profile, dismissed]);

  function dismiss() {
    setDismissed(true);
    if (typeof window !== "undefined") localStorage.setItem(dismissKey, "1");
  }

  // Nothing to prompt when loading, complete, dismissed, or DB not set up
  // (the dashboard surfaces the setup hint elsewhere).
  if (isLoading || dbNotSetup || completion.isComplete || dismissed) {
    return null;
  }

  const hasProfile = profile !== null;

  return (
    <>
      <div
        className="velora-card p-5 mb-6 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(84,39,230,0.06) 0%, #ffffff 60%)",
        }}
      >
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="absolute right-4 top-4 w-7 h-7 flex items-center justify-center rounded-[8px] text-[#797588] hover:bg-[#f4f3fb] hover:text-[#1a1b21] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4 pr-8">
          <div className="w-11 h-11 rounded-[14px] bg-velora-gradient flex items-center justify-center flex-shrink-0 shadow-primary-glow">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-title-sm font-semibold text-[#1a1b21]">
              {hasProfile
                ? "Finish setting up your storefront"
                : "Set up your merchant profile"}
            </p>
            <p className="text-body-sm text-[#484556] mt-0.5 max-w-xl">
              {hasProfile
                ? "Add the remaining details so customers see a polished, branded checkout."
                : "Add your business name and branding so customers recognize you at checkout. It only takes a minute — your dashboard stays available the whole time."}
            </p>

            <div className="mt-4 max-w-sm">
              <ProfileCompletionMeter completion={completion} />
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setDialogOpen(true)}
              className="mt-4 inline-flex items-center gap-2"
            >
              {hasProfile ? "Complete profile" : "Set up profile"}
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-9 h-9 rounded-[10px] bg-[rgba(84,39,230,0.08)] flex items-center justify-center">
                <Store className="w-4.5 h-4.5 text-[#5427e6]" />
              </div>
              <DialogTitle>Your merchant profile</DialogTitle>
            </div>
            <DialogDescription>
              This is how your business appears across Velora — on your dashboard
              and on every checkout page. You can edit it anytime in Settings.
            </DialogDescription>
          </DialogHeader>

          <MerchantProfileForm
            walletAddress={walletAddress}
            profile={profile ?? null}
            compact
            submitLabel="Save & continue"
            onSaved={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
