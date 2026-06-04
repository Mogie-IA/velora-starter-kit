---
name: Wallet adapter SSR fix
description: Preventing React hydration mismatches from Solana wallet adapter components in Next.js App Router
---

## Rule
Any component that renders `WalletMultiButton` or reads `useWallet()` state (connected, publicKey, etc.) must gate that UI behind a `mounted` flag.

```tsx
const [mounted, setMounted] = useState(false);
useEffect(() => { setMounted(true); }, []);

// wallet UI
{mounted ? <WalletMultiButton /> : <div style={{ width: 152, height: 40 }} />}
{mounted && connected && <AddressChip />}
```

**Why:** `WalletMultiButton` and wallet adapter internals access browser-only state. In Next.js App Router, client components are still SSR'd — the server renders with no wallet state, but the adapter's internal initialization differs from the server snapshot, triggering React's hydration mismatch error.

**How to apply:** Navbar, any header/toolbar with a connect button, any page that conditionally shows auth-dependent UI based on `useWallet()` or `useAuthContext()` wallet state. The placeholder div (same dimensions) prevents layout shift during mount.
