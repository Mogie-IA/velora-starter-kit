import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Receipts" };

export default function ConsumerReceiptsPage() {
  return (
    <div className="space-y-8 animate-slide-up">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-headline-lg text-[#1a1b21]">Receipts</h1>
          <Badge variant="secondary">Phase 1</Badge>
        </div>
        <p className="text-body-md text-[#484556]">
          On-chain receipts for all your purchases — permanently verifiable.
        </p>
      </div>
      <Card hoverable={false}>
        <CardHeader>
          <CardTitle>Purchase Receipts</CardTitle>
          <CardDescription className="mt-1">
            Every on-chain transaction generates a permanent, verifiable receipt
            linked to its Solana signature.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-32 gap-2">
            <div className="tx-icon">
              <span className="text-xl">🧾</span>
            </div>
            <p className="text-label-md text-[#797588]">No receipts yet</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
