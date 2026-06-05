---
name: Zod URL scheme validation
description: z.string().url() accepts unsafe schemes; restrict to http(s) before rendering as href/src
---

# Zod `.url()` does not restrict scheme

`z.string().url()` accepts ANY scheme, including `javascript:` and `data:`. If a
validated value is later rendered as an `<a href>` (or used as a navigable URL),
this is an injection vector for user/merchant-supplied URLs.

**Why:** In Velora, merchant profile `website`/`logo_url` are stored from a form
and rendered on the public checkout page. A malicious merchant could store
`javascript:...` and have it run for any payer.

**How to apply:** For any user-supplied URL that gets rendered as a link or
navigable target, add `.refine()` after `.url()` to allow only `http:`/`https:`
(parse with `new URL(v).protocol`). Enforce it in the shared Zod schema so the
server action (not just the client form) validates it. Add defense-in-depth at
the render site too for rows written before the rule existed.
