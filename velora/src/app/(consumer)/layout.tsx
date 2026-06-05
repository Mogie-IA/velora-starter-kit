import { Navbar } from "@/components/layout";

export default function ConsumerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#faf8ff]">
      <Navbar />
      <div className="page-container py-10">{children}</div>
    </div>
  );
}
