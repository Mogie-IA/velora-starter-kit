import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "My Subscriptions" };

export default function ConsumerSubscriptionsPage() {
  return (
    <div className="space-y-8 animate-slide-up">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-headline-lg text-[#1a1b21]">My Subscriptions</h1>
          <Badge variant="secondary">Phase 1</Badge>
        </div>
        <p className="text-body-md text-[#484556]">
          Manage your active subscriptions and billing across all merchants.
        </p>
      </div>
      <Card hoverable={false}>
        <CardHeader>
          <CardTitle>Active Subscriptions</CardTitle>
          <CardDescription className="mt-1">
            Your active on-chain subscription plans will appear here. You can
            pause or cancel any subscription at any time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-32 gap-2">
            <div className="tx-icon">
              <span className="text-xl">🔄</span>
            </div>
            <p className="text-label-md text-[#797588]">No active subscriptions</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
