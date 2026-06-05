import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AuthGuard } from "@/features/auth";

export default function ConsumerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requiredRole="consumer">
      <DashboardLayout>{children}</DashboardLayout>
    </AuthGuard>
  );
}
