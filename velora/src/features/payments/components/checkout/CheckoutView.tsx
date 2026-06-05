"use client";

import { useEffect, useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Loader2, ShieldAlert, Lock, Wallet, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout";
import { submitPayment } from "@/app/actions/payments";
import {
  shortenAddress,
  getExplorerAddressUrl,
  isValidSolanaAddress,
  solToLamports,
} from "@/lib/solana/config";
import { sendSolPayment, PaymentError } from "@/lib/solana/payment";
import { effectiveStatus, STATUS_LABELS } from "../../status";
import { formatAmount } from "../../format";
import type { ActionResult, PaymentLink, PaymentReceipt as Receipt } from "../../types";
import { PaymentReceipt } from "./PaymentReceipt";

type CheckoutState = "idle" | "processing" | "awaiting" | "success" | "error";

export function CheckoutView({
  result,
  slug,
}: {
  result: ActionResult<PaymentLink>;
  slug: string;
}) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#faf8ff] page-container py-16">
        <div className="max-w-lg mx-auto animate-slide-up">
          {result.ok ? (
            <CheckoutCard link={result.data} slug={slug} />
          ) : (
            <UnavailableCard
              title={
                result.code === "NOT_FOUND"
                  ? "Payment link not found"
                  : result.code === "DB_NOT_SETUP"
                    ? "Checkout unavailable"
                    : "Something went wrong"
              }
              message={result.error}
            />
          )}
        </div>
      </main>
    </>
  );
}

function CheckoutCard({ link, slug }: { link: PaymentLink; slug: string }) {
  const { publicKey, connected, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<CheckoutState>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  useEffect(() => setMounted(true), []);

  const status = effectiveStatus(link);
  const payable = status === "active";
  const isSol = link.currency === "SOL";
  const merchantWalletValid = isValidSolanaAddress(link.merchant_wallet);
  const busy = state === "processing" || state === "awaiting";

  async function handlePay() {
    if (!publicKey || !connected) return;
    if (!isSol) {
      setErrorMsg("Only SOL payments are supported on Devnet right now.");
      setState("error");
      return;
    }
    if (!merchantWalletValid) {
      setErrorMsg("This merchant's wallet address is invalid.");
      setState("error");
      return;
    }

    setErrorMsg(null);
    setState("processing");

    try {
      const lamports = solToLamports(Number(link.amount));
      const signature = await sendSolPayment({
        connection,
        payer: publicKey,
        sendTransaction,
        toAddress: link.merchant_wallet,
        lamports,
      });

      // Tx sent + confirmed on-chain; now record + server-verify.
      setState("awaiting");
      const res = await submitPayment({
        slug,
        payerWallet: publicKey.toBase58(),
        txSignature: signature,
      });

      if (!res.ok) {
        setErrorMsg(res.error);
        setState("error");
        return;
      }
      setReceipt(res.data);
      setState("success");
    } catch (err) {
      const message =
        err instanceof PaymentError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Payment failed. Please try again.";
      setErrorMsg(message);
      setState("error");
    }
  }

  function reset() {
    setErrorMsg(null);
    setState("idle");
  }

  if (state === "success" && receipt) {
    return (
      <Card hoverable={false}>
        <CardContent className="p-8">
          <PaymentReceipt receipt={receipt} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card hoverable={false}>
      <CardContent className="p-8">
        {/* Merchant + network badge */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-[10px] bg-velora-gradient flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">
                {link.merchant_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-label-sm text-[#797588]">Paying</p>
              <p className="text-title-sm font-semibold text-[#1a1b21] truncate">
                {link.merchant_name}
              </p>
            </div>
          </div>
          <Badge variant="warning">Devnet</Badge>
        </div>

        {/* Amount */}
        <div className="text-center py-6 border-y border-[#eeedf5]">
          <h1 className="text-display-sm text-[#1a1b21]">
            {formatAmount(Number(link.amount), link.currency)}
          </h1>
          <p className="text-title-sm font-medium text-[#484556] mt-2">{link.title}</p>
          {link.description && (
            <p className="text-body-sm text-[#797588] mt-1 max-w-sm mx-auto">
              {link.description}
            </p>
          )}
        </div>

        {/* Merchant wallet */}
        <div className="flex items-center justify-between text-body-sm mt-5">
          <span className="text-[#797588]">Merchant wallet</span>
          {merchantWalletValid ? (
            <a
              href={getExplorerAddressUrl(link.merchant_wallet)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-mono text-[#5427e6]"
            >
              {shortenAddress(link.merchant_wallet)}
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : (
            <span className="font-mono text-[#ba1a1a]">Invalid address</span>
          )}
        </div>

        {/* Status / pay area */}
        <div className="mt-6 space-y-4">
          {!payable ? (
            <div className="flex items-start gap-3 bg-[#f4f3fb] rounded-[14px] p-4">
              <Lock className="w-5 h-5 text-[#797588] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-title-sm font-semibold text-[#1a1b21]">
                  {STATUS_LABELS[status]}
                </p>
                <p className="text-body-sm text-[#484556] mt-0.5">
                  {status === "paid"
                    ? "This payment link has already been paid."
                    : status === "expired"
                      ? "This payment link has expired and can no longer accept payments."
                      : "This payment link is not active yet."}
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Wallet status */}
              <div className="flex items-center justify-between text-body-sm bg-[#f4f3fb] rounded-[12px] px-4 py-3">
                <span className="inline-flex items-center gap-2 text-[#797588]">
                  <Wallet className="w-4 h-4" />
                  Wallet
                </span>
                {mounted && connected && publicKey ? (
                  <span className="inline-flex items-center gap-2 font-mono text-[#1a1b21]">
                    <span className="w-2 h-2 rounded-full bg-[#007d51]" />
                    {shortenAddress(publicKey.toBase58())}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 text-[#797588]">
                    <span className="w-2 h-2 rounded-full bg-[#c2c0cc]" />
                    Not connected
                  </span>
                )}
              </div>

              {mounted && !connected && (
                <div className="flex flex-col items-center gap-2 pt-1">
                  <p className="text-body-sm text-[#484556]">
                    Connect your Solana wallet to pay
                  </p>
                  <WalletMultiButton />
                </div>
              )}

              {mounted && connected && (
                <>
                  {busy ? (
                    <ProcessingPanel state={state} />
                  ) : (
                    <Button
                      variant="primary"
                      onClick={handlePay}
                      disabled={!isSol || !merchantWalletValid}
                      className="w-full inline-flex items-center justify-center gap-2"
                    >
                      Pay {formatAmount(Number(link.amount), link.currency)}
                    </Button>
                  )}

                  {!isSol && (
                    <p className="text-label-sm text-[#a87900] text-center">
                      USDC checkout is coming soon — this link is priced in USDC.
                    </p>
                  )}
                </>
              )}

              {state === "error" && errorMsg && (
                <div className="space-y-3">
                  <div className="flex items-start gap-2 text-label-md text-[#ba1a1a] bg-[#fdf3f3] rounded-[12px] px-3 py-2.5">
                    <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                  {connected && (
                    <Button
                      variant="secondary"
                      onClick={reset}
                      className="w-full"
                    >
                      Try again
                    </Button>
                  )}
                </div>
              )}

              <p className="text-label-sm text-[#797588] text-center">
                Real transaction on Solana Devnet — testnet SOL only, no
                mainnet funds.
              </p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ProcessingPanel({ state }: { state: CheckoutState }) {
  const processing = state === "processing";
  return (
    <div className="flex flex-col items-center gap-3 bg-[#f4f3fb] rounded-[14px] p-6 text-center">
      <Loader2 className="w-7 h-7 text-[#5427e6] animate-spin" />
      <div>
        <p className="text-title-sm font-semibold text-[#1a1b21]">
          {processing ? "Processing payment" : "Awaiting confirmation"}
        </p>
        <p className="text-body-sm text-[#484556] mt-0.5">
          {processing
            ? "Approve the transaction in your wallet…"
            : "Verifying your transaction on Solana Devnet…"}
        </p>
      </div>
    </div>
  );
}

function UnavailableCard({ title, message }: { title: string; message: string }) {
  return (
    <Card hoverable={false}>
      <CardContent className="p-8 flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-[16px] bg-[rgba(186,26,26,0.08)] flex items-center justify-center mb-4">
          <ShieldAlert className="w-6 h-6 text-[#ba1a1a]" />
        </div>
        <h1 className="text-headline-md text-[#1a1b21]">{title}</h1>
        <p className="text-body-md text-[#484556] mt-1.5 max-w-sm">{message}</p>
        <a href="/" className="btn-secondary mt-6">
          Back to Velora
        </a>
      </CardContent>
    </Card>
  );
}
