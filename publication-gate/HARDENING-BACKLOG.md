# ESA security hardening — backlog

Items deliberately deferred. Recorded so they are not lost, **not** scheduled, and explicitly
out of scope for the publication task that raised them (owner ruling, 2026-09-15).

Nothing here blocks the publication gate. The gate governs what is published; these are about
how the backend behaves once someone is talking to it.

---

## H-1 · Constant-time comparison for `ESA_ADMIN_KEY`

`assignment-studio/functions/esa-review/index.ts:253`

```ts
if (!expected || key !== expected) return json({ error: "Not authorised." }, 403);
```

`!==` on strings short-circuits at the first differing byte, so response time leaks a prefix
match. Exploiting it across a network against a high-entropy key is not practical, which is why
this is a backlog item and not a defect. The fix is a fixed-time compare over both strings.

Raised: 2026-09-15. Status: recorded, not scheduled.

## H-2 · Rate limiting on the `admin` action

The `esa-review` function accepts unlimited `{action:"admin", key}` attempts from anywhere. The
admin *page* is no longer deployed (owner ruling 2026-09-15, Option A), but the *endpoint* is
public and always was — removing the page changed discoverability, not reachability.

A per-IP attempt cap on the admin action would close it. Deliberately not done as part of the
publication work, which was about what the deployment publishes.

Raised: 2026-09-15. Status: recorded, not scheduled.

---

**Not in scope, and ruled out already:** a second authentication system in front of admin. The
owner ruled against it. `ESA_ADMIN_KEY` is the security boundary; keep it long and random.
