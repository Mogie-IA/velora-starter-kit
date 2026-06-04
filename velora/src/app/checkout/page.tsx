import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout";

export const metadata: Metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#faf8ff] page-container py-16">
        <div className="max-w-lg mx-auto space-y-8 animate-slide-up">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-headline-lg text-[#1a1b21]">Checkout</h1>
              <Badge variant="secondary">Phase 1</Badge>
            </div>
            <p className="text-body-md text-[#484556]">
              Wallet-native checkout flow for Solana payments.
            </p>
          </div>

          <Card hoverable={false}>
            <CardHeader>
              <CardTitle>Payment Request</CardTitle>
              <CardDescription className="mt-1">
                The checkout flow will be implemented in Phase 1, supporting
                one-time payments and subscription sign-ups via Solana Pay.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Order summary skeleton */}
              <div className="bg-[#f4f3fb] rounded-[16px] p-5 mb-5 border border-[#e8e7ef] opacity-50">
                <p className="text-label-sm text-[#797588] uppercase tracking-wider mb-3">
                  Order Summary
                </p>
                <div className="tx-row border-none h-14 px-0">
                  <div className="tx-icon mr-3">
                    <span className="text-sm">📦</span>
                  </div>
                  <div className="flex-1">
                    <div className="h-3 w-28 bg-[#e2e2e9] rounded-full mb-1.5" />
                    <div className="h-2.5 w-16 bg-[#eeedf5] rounded-full" />
                  </div>
                  <div className="h-4 w-16 bg-[#e2e2e9] rounded-full tabular-nums" />
                </div>
                <div className="velora-divider mt-3 mb-3" />
                <div className="flex justify-between items-center">
                  <span className="text-label-md font-semibold text-[#1a1b21]">Total</span>
                  <div className="h-4 w-20 bg-[#e2e2e9] rounded-full" />
                </div>
              </div>

              <div className="flex items-center justify-center h-10 gap-2">
                <p className="text-label-md text-[#797588]">
                  No active payment request
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
