import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Merchant Dashboard" };

export default function MerchantDashboardPage() {
  return (
    <div className="space-y-8 animate-slide-up">
      {/* Page header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-headline-lg text-[#1a1b21]">Merchant Dashboard</h1>
          <Badge variant="secondary">Phase 1</Badge>
        </div>
        <p className="text-body-md text-[#484556]">
          Overview of your payments, products, and subscriptions.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((stat) => (
          <div key={stat.label} className="stat-card">
            <p className="stat-label">{stat.label}</p>
            <p className="stat-value text-[#c9c4d9]">—</p>
            <p className="text-label-sm text-[#797588] mt-2">
              Available in Phase 1
            </p>
          </div>
        ))}
      </div>

      {/* Recent transactions */}
      <Card hoverable={false}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription className="mt-1">
                Transaction history will appear here once you connect your wallet.
              </CardDescription>
            </div>
            <Badge variant="secondary">Phase 1</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-40 gap-3">
            <div className="tx-icon">
              <span className="text-xl">👛</span>
            </div>
            <p className="text-label-md text-[#797588]">
              Connect your wallet to get started
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {quickActions.map((action) => (
          <div
            key={action.title}
            className="velora-card p-6 opacity-60 cursor-not-allowed select-none"
          >
            <div className="tx-icon mb-4">
              <span>{action.icon}</span>
            </div>
            <h3 className="text-label-md font-semibold text-[#1a1b21] mb-1">
              {action.title}
            </h3>
            <p className="text-label-sm text-[#797588]">{action.desc}</p>
            <span className="chip chip-neutral mt-4 inline-flex">{action.phase}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const statCards = [
  { label: "Total Revenue" },
  { label: "Transactions (30d)" },
  { label: "Active Subscriptions" },
  { label: "Products" },
];

const quickActions = [
  { icon: "💳", title: "Create Payment Link", desc: "Generate a shareable Solana Pay link.", phase: "Phase 1" },
  { icon: "📦", title: "Add Product", desc: "List a new product or service.", phase: "Phase 1" },
  { icon: "🔄", title: "Subscription Plans", desc: "Set up recurring billing.", phase: "Phase 1" },
];
