import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AuthGuard } from "@/features/auth";

export default function MerchantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requiredRole="merchant">
      <DashboardLayout>{children}</DashboardLayout>
    </AuthGuard>
  );
}
