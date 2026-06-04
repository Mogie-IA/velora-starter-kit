import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Consumer Dashboard" };

export default function ConsumerDashboardPage() {
  return (
    <div className="space-y-8 animate-slide-up">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-headline-lg text-[#1a1b21]">My Dashboard</h1>
          <Badge variant="secondary">Phase 1</Badge>
        </div>
        <p className="text-body-md text-[#484556]">
          Your purchase history, subscriptions, and connected apps.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {consumerStats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <p className="stat-label">{stat.label}</p>
            <p className="stat-value text-[#c9c4d9]">—</p>
          </div>
        ))}
      </div>

      <Card hoverable={false}>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription className="mt-1">
            Your recent transactions and activity across merchants.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-0">
            {[1, 2, 3].map((i) => (
              <div key={i} className="tx-row opacity-30">
                <div className="tx-icon mr-4">
                  <span className="text-sm">🛍</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="h-3.5 w-40 bg-[#e2e2e9] rounded-full mb-1.5" />
                  <div className="h-2.5 w-24 bg-[#eeedf5] rounded-full" />
                </div>
                <div className="h-4 w-14 bg-[#e2e2e9] rounded-full" />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center h-12 mt-2">
            <p className="text-label-md text-[#797588]">
              Connect your wallet to view activity
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const consumerStats = [
  { label: "Total Spent" },
  { label: "Active Subscriptions" },
  { label: "Connected Apps" },
];
