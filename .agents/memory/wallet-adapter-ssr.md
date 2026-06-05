---
name: Wallet adapter SSR fix
description: Preventing React 19 hydration mismatches from Solana wallet adapter components in Next.js 15 App Router
---

## Rule
The definitive fix for React 19 hydration mismatches with Solana wallet adapter is a **two-part mounted guard in `AuthContext`**:

1. Stabilize `walletAddress` to `null` before mount
2. Guard the disconnection effect with `if (!mounted) return`

```tsx
// AuthContext.tsx
const [mounted, setMounted] = useState(false);
useEffect(() => { setMounted(true); }, []);

const realWalletAddress = publicKey?.toBase58() ?? null;
const walletAddress = mounted ? realWalletAddress : null;  // null until hydrated

// Session-restore effect — safe (walletAddress is null before mount)
useEffect(() => {
  if (!walletAddress) { setUser(null); setStep("idle"); return; }
  // ... restore session
}, [walletAddress]);

// Disconnection effect — MUST be guarded; without this it fires on first
// render (connected=false, connecting=false) and calls clearSession(),
// wiping any stored session before auth can restore it
useEffect(() => {
  if (!mounted) return;   // ← critical guard
  if (!connected && !connecting) { clearSession(); ... }
}, [mounted, connected, connecting]);
```

**Why:** React 19 detects "external store" violations — Phantom fires sync events when the page loads, updating wallet adapter `readyState` BEFORE React hydrates. Any component that exposes live wallet state in its render output creates a server/client snapshot mismatch. By stabilizing `walletAddress = null` before mount, ALL consumers of `useAuthContext()` receive the same null value on both server and client during the hydration phase.

Additionally, `@solana/wallet-adapter-react` v1 throws (not just warns) when `publicKey` is accessed without a `WalletProvider` ancestor — so deferring the WalletProvider itself is NOT a valid fix.

**How to apply:**
- `AuthContext` — use the two-part guard above (the authoritative fix)
- `Navbar` / any header — `{mounted ? <WalletMultiButton /> : <div style={{width:152,height:40,...}} />}` (prevents layout shift)
- Any page using `walletAddress` from context is automatically safe once `AuthContext` exports the guarded value
- Do NOT defer the `WalletProvider` tree itself — the adapters throw on `publicKey` access without a provider

**Placeholder dimensions** for WalletMultiButton: `width:152, height:40, borderRadius:16, background: gradient(#6d4aff → #4f46e5)` to prevent layout shift.

## Extension-injected hydration mismatch (separate from app-code mismatch)
A hydration mismatch can reproduce **only in browsers that have the Phantom (or other crypto) wallet extension installed** — the extension mutates the DOM before React hydrates. Headless/Playwright tooling has no extension, so it renders perfectly clean and CANNOT reproduce this class of bug. Symptom: page loads briefly, then the Replit preview flips to "artifact encountered an error" / becomes unclickable.

**What does NOT fix it (verified ineffective):**
- `suppressHydrationWarning` on `<html>`/`<body>` — only covers an element's OWN attributes/text one level deep, NOT injected child nodes or deeper-tree mismatches. Did not stop the error.
- Wrapping `WalletMultiButton` in a mount-gate (`ClientOnly`) — correct hardening, but did NOT eliminate the error, proving the wallet button is not the source.
- Gating every app-side wallet-state render (Navbar pill, `page.tsx` `mounted &&`, `AuthContext` null-before-mount, `useWalletBalance` deterministic init) — error STILL reproduces only with Phantom. Conclusion: the offending node is injected by the extension, not produced by app code. React 19 tolerates extra html/body *attributes* but not nodes inserted mid-tree.

**What stabilizes the PREVIEW (not a true mismatch fix):** the React hydration mismatch is *recoverable* (React regenerates the client tree and the app keeps working), but the stray `window` "error" event trips the Replit preview wrapper's "artifact encountered an error" screen. An early inline guard in `<head>` (dev/preview only, `process.env.NODE_ENV !== "production"`) adds a **capture-phase** `window.addEventListener("error", …, true)` that matches the message `"Hydration failed because the server rendered HTML"` and calls `stopImmediatePropagation()` + `preventDefault()`. Must be the FIRST child of `<head>` so it registers before hydration.

**Why:** React recovers on its own; the only user-visible damage is the wrapper reacting to the error event. Suppressing just that event keeps the preview interactive without touching app architecture or going global-CSR.

**Caveats / how to verify:** the Replit browser LOG capture still records the `unhandlederror` (it hooks errors independently of preventDefault) — that is expected and is just logging. Effectiveness against the OVERLAY depends on whether the guard's listener out-races the wrapper's own listener (registration order), which you CANNOT verify from headless/curl — confirm with the user in a real Phantom browser after a hard refresh. The guard firing is observable via the `console.debug("[velora] suppressed extension-induced hydration error event …")` line.
