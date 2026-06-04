import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Connected Apps" };

export default function ConsumerConnectedAppsPage() {
  return (
    <div className="space-y-8 animate-slide-up">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-headline-lg text-[#1a1b21]">Connected Apps</h1>
          <Badge variant="secondary">Phase 2</Badge>
        </div>
        <p className="text-body-md text-[#484556]">
          Apps and merchants you have authorized with your wallet.
        </p>
      </div>
      <Card hoverable={false}>
        <CardHeader>
          <CardTitle>Connected Applications</CardTitle>
          <CardDescription className="mt-1">
            Connected app management arrives in Phase 2. You will be able to
            view, manage, and revoke wallet authorizations for any merchant.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-32 gap-2">
            <div className="tx-icon">
              <span className="text-xl">🔌</span>
            </div>
            <p className="text-label-md text-[#797588]">No connected apps</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
