import Link from "next/link";

const cols = [
  {
    title: "Product",
    links: [
      { href: "#merchants", label: "Merchants" },
      { href: "#consumers", label: "Consumers" },
      { href: "#developers", label: "Developers" },
      { href: "#roadmap", label: "Roadmap" },
    ],
  },
  {
    title: "Get started",
    links: [
      { href: "/get-started", label: "Create account" },
      { href: "/demo", label: "Try the demo" },
      { href: "/docs", label: "Documentation" },
    ],
  },
];

export function LandingFooter() {
  return (
    <footer className="border-t border-[#e8e7ef] bg-white">
      <div className="page-container py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-[9px] bg-velora-gradient flex items-center justify-center">
                <span className="text-white font-bold text-xs">V</span>
              </div>
              <span className="text-[16px] font-semibold text-[#1a1b21]">
                Velora
              </span>
            </div>
            <p className="text-label-md text-[#797588] mt-3 max-w-xs">
              Wallet-native commerce infrastructure for Solana.
            </p>
          </div>

          {cols.map((col) => (
            <div key={col.title}>
              <p className="text-label-sm uppercase tracking-widest text-[#797588] mb-3">
                {col.title}
              </p>
              <ul className="space-y-2">
                {col.links.map((l) =>
                  l.href.startsWith("#") ? (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        className="text-label-md text-[#484556] hover:text-[#5427e6] transition-colors"
                      >
                        {l.label}
                      </a>
                    </li>
                  ) : (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        className="text-label-md text-[#484556] hover:text-[#5427e6] transition-colors"
                      >
                        {l.label}
                      </Link>
                    </li>
                  )
                )}
              </ul>
            </div>
          ))}
        </div>

        <div className="velora-divider my-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-label-sm text-[#797588]">
            © {new Date().getFullYear()} Velora · Wallet-native commerce for Solana
          </span>
          <span className="inline-flex items-center gap-2 text-label-sm text-[#797588]">
            <span className="w-2 h-2 rounded-full bg-[#007d51] shadow-[0_0_6px_rgba(0,125,81,0.6)]" />
            Solana Devnet · No real funds required
          </span>
        </div>
      </div>
    </footer>
  );
}
