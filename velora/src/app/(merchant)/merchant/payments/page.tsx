import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Payments" };

export default function MerchantPaymentsPage() {
  return (
    <div className="space-y-8 animate-slide-up">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-headline-lg text-[#1a1b21]">Payments</h1>
          <Badge variant="secondary">Phase 1</Badge>
        </div>
        <p className="text-body-md text-[#484556]">
          Manage and track all incoming on-chain payments.
        </p>
      </div>

      <Card hoverable={false}>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription className="mt-1">
            On-chain payment records will appear here in Phase 1, including
            Solana signatures, amounts, and timestamps.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Empty state: tx row skeleton */}
          <div className="space-y-0">
            {[1, 2, 3].map((i) => (
              <div key={i} className="tx-row opacity-30">
                <div className="tx-icon mr-4">
                  <span className="text-sm">◎</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="h-3.5 w-32 bg-[#e2e2e9] rounded-full mb-1.5" />
                  <div className="h-2.5 w-20 bg-[#eeedf5] rounded-full" />
                </div>
                <div className="h-4 w-16 bg-[#e2e2e9] rounded-full tabular-nums" />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center h-20 gap-2 mt-2">
            <p className="text-label-md text-[#797588]">No payments yet — connect wallet in Phase 1</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
