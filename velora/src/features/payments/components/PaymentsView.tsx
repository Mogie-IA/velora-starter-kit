"use client";

import { useState } from "react";
import { Plus, Link2, Database, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuthContext } from "@/features/auth/context/AuthContext";
import { shortenAddress } from "@/lib/solana/config";
import { usePaymentLinks } from "../hooks/usePaymentLinks";
import { CreatePaymentLinkDialog } from "./CreatePaymentLinkDialog";
import { ShareLinkDialog } from "./ShareLinkDialog";
import { PaymentLinkCard } from "./PaymentLinkCard";
import type { PaymentLink } from "../types";

export function PaymentsView() {
  const { user, walletAddress } = useAuthContext();
  const merchantWallet = walletAddress ?? "";
  const merchantName =
    user?.displayName ?? (walletAddress ? shortenAddress(walletAddress) : "Velora Merchant");

  const { data: links, isLoading, error } = usePaymentLinks(walletAddress);

  const [createOpen, setCreateOpen] = useState(false);
  const [shareLink, setShareLink] = useState<PaymentLink | null>(null);
  const [shareOpen, setShareOpen] = useState(false);

  function openShare(link: PaymentLink) {
    setShareLink(link);
    setShareOpen(true);
  }

  const dbNotSetup =
    error instanceof Error && error.message.toLowerCase().includes("database not set up");

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-headline-lg text-[#1a1b21] mb-1">Payment Links</h1>
          <p className="text-body-md text-[#484556]">
            Create shareable checkout links and accept payments on Solana Devnet.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setCreateOpen(true)}
          disabled={!walletAddress}
          className="inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New payment link
        </Button>
      </div>

      {!walletAddress && (
        <Card hoverable={false} className="p-5 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[#a87900] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-title-sm font-semibold text-[#1a1b21]">
              Connect your wallet
            </p>
            <p className="text-body-sm text-[#484556] mt-0.5">
              Your connected wallet is the destination for payments. Reconnect to
              create payment links.
            </p>
          </div>
        </Card>
      )}

      {dbNotSetup ? (
        <DbNotSetupCard message={(error as Error).message} />
      ) : error ? (
        <Card hoverable={false} className="p-5 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[#ba1a1a] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-title-sm font-semibold text-[#1a1b21]">
              Couldn&apos;t load payment links
            </p>
            <p className="text-body-sm text-[#484556] mt-0.5">
              {(error as Error).message}
            </p>
          </div>
        </Card>
      ) : isLoading ? (
        <LoadingState />
      ) : links && links.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {links.map((link) => (
            <PaymentLinkCard
              key={link.id}
              link={link}
              merchantWallet={merchantWallet}
              onShare={openShare}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          disabled={!walletAddress}
          onCreate={() => setCreateOpen(true)}
        />
      )}

      {walletAddress && (
        <CreatePaymentLinkDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          merchantWallet={merchantWallet}
          merchantName={merchantName}
          merchantUserId={user?.id ?? null}
          onCreated={(link) => openShare(link)}
        />
      )}

      <ShareLinkDialog link={shareLink} open={shareOpen} onOpenChange={setShareOpen} />
    </div>
  );
}

function LoadingState() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} hoverable={false} className="p-5">
          <div className="h-4 w-40 bg-[#e2e2e9] rounded-full mb-3 animate-pulse" />
          <div className="h-3 w-56 bg-[#eeedf5] rounded-full mb-5 animate-pulse" />
          <div className="h-5 w-24 bg-[#e2e2e9] rounded-full animate-pulse" />
        </Card>
      ))}
    </div>
  );
}

function EmptyState({
  disabled,
  onCreate,
}: {
  disabled: boolean;
  onCreate: () => void;
}) {
  return (
    <Card hoverable={false} className="p-10 flex flex-col items-center text-center">
      <div className="w-14 h-14 rounded-[16px] bg-[rgba(84,39,230,0.08)] flex items-center justify-center mb-4">
        <Link2 className="w-6 h-6 text-[#5427e6]" />
      </div>
      <h3 className="text-title-md font-semibold text-[#1a1b21]">
        No payment links yet
      </h3>
      <p className="text-body-md text-[#484556] mt-1 max-w-sm">
        Create your first payment link to start accepting one-time payments. Share
        it as a URL or QR code.
      </p>
      <Button
        variant="primary"
        onClick={onCreate}
        disabled={disabled}
        className="mt-5 inline-flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        New payment link
      </Button>
    </Card>
  );
}

function DbNotSetupCard({ message }: { message: string }) {
  return (
    <Card hoverable={false} className="p-6 flex items-start gap-4">
      <div className="w-11 h-11 rounded-[14px] bg-[rgba(168,121,0,0.1)] flex items-center justify-center flex-shrink-0">
        <Database className="w-5 h-5 text-[#a87900]" />
      </div>
      <div>
        <h3 className="text-title-md font-semibold text-[#1a1b21]">
          Finish database setup
        </h3>
        <p className="text-body-md text-[#484556] mt-1">{message}</p>
        <p className="text-body-sm text-[#797588] mt-2">
          Open your Supabase project → SQL Editor, paste the contents of{" "}
          <code className="font-mono text-[13px] text-[#5427e6]">
            velora/supabase/migrations/0001_phase2_payment_links.sql
          </code>
          , and run it. Then refresh this page.
        </p>
      </div>
    </Card>
  );
}
