import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Subscriptions" };

export default function MerchantSubscriptionsPage() {
  return (
    <div className="space-y-8 animate-slide-up">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-headline-lg text-[#1a1b21]">Subscriptions</h1>
          <Badge variant="secondary">Phase 1</Badge>
        </div>
        <p className="text-body-md text-[#484556]">
          Create and manage recurring subscription plans for your customers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {planTypes.map((plan) => (
          <div key={plan.interval} className="velora-card p-6 opacity-60">
            <div className="tx-icon mb-4">
              <span>{plan.icon}</span>
            </div>
            <h3 className="text-label-md font-semibold text-[#1a1b21] mb-1">{plan.interval}</h3>
            <p className="text-label-sm text-[#797588]">{plan.desc}</p>
          </div>
        ))}
      </div>

      <Card hoverable={false}>
        <CardHeader>
          <CardTitle>Active Subscription Plans</CardTitle>
          <CardDescription className="mt-1">
            Subscription management will be available in Phase 1 — create
            daily, weekly, monthly, or yearly recurring billing plans.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-32 gap-2">
            <p className="text-label-md text-[#797588]">No subscription plans yet</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const planTypes = [
  { icon: "📅", interval: "Monthly", desc: "Charge customers every 30 days." },
  { icon: "📆", interval: "Yearly", desc: "Annual billing with discount options." },
  { icon: "⚡", interval: "Custom", desc: "Daily, weekly, or custom intervals." },
];
