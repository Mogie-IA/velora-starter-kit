import Link from "next/link";
import { Navbar } from "@/components/layout";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#faf8ff] flex items-center justify-center">
        <div className="text-center space-y-6 animate-slide-up px-4 max-w-md mx-auto">
          {/* Glow */}
          <div
            aria-hidden
            className="absolute inset-x-0 top-1/3 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(109,74,255,0.10) 0%, transparent 70%)",
              height: 400,
            }}
          />
          <div className="relative">
            <p className="text-[96px] font-bold velora-gradient-text leading-none">
              404
            </p>
            <h1 className="text-headline-md text-[#1a1b21] mt-2">
              Page not found
            </h1>
            <p className="text-body-md text-[#484556] mt-3">
              The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>
            <div className="mt-8">
              <Link href="/" className="btn-primary">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
