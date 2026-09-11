// ESA — failing safely in front of a teacher.
//
// WHY THIS EXISTS. On 2026-09-11 the first production review hit a 504 from PostgREST. The function
// had gone cold while the teacher was on screens 2 and 3 (it logged `shutdown` three and a half
// minutes before she clicked), a fresh instance booted, and its very first database call — the
// read-back by access_token at the top of `confirm` — was killed by the gateway. The same query ran
// in ~100ms before it and ~250ms after it, and clicking again worked.
//
// The transient timeout was survivable. What was not survivable was the message: db()'s internal
// error string reached her screen verbatim —
//
//     db GET esa_reviews?access_token=eq.<her token>&select=... → 504: {"message":"Gateway Timeout"}
//
// — carrying the request URL and her own access token, and telling her nothing she could act on.
//
// Two rules, both enforced here rather than at each call site:
//   1. A teacher never sees an internal error. The detail goes to the function log.
//   2. A read that a cold instance can lose to a gateway hiccup gets one bounded retry.

/** True for a failure worth trying again — a gateway or transport hiccup, not a bad request. */
export function isTransient(detail: string): boolean {
  return /→\s*50[234]\b|\b(?:gateway\s*timeout|timeout|timed\s*out|econnreset|connection\s*reset|fetch\s*failed|network\s*error)\b/i
    .test(String(detail));
}

/** What the teacher is allowed to see. Never an internal URL, never a token, never a stack. */
export function safeError(detail: string): { error: string; retryable: boolean; status: number } {
  if (isTransient(detail)) {
    return {
      error: "Something went wrong on our side and nothing was saved. Please try that again — it usually works the second time.",
      retryable: true,
      status: 503,
    };
  }
  return {
    error: "Something went wrong and nothing was saved. Please try again, and if it keeps happening tell Dalia what you were doing.",
    retryable: false,
    status: 500,
  };
}

/**
 * One bounded retry, for a read a cold instance can lose to a gateway timeout.
 * Only transient failures are retried; a real error surfaces immediately and unchanged. Two
 * attempts, never more — if the second also fails, that is a real outage and it should be seen.
 */
export async function retryOnce<T>(fn: () => Promise<T>, waitMs = 400): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    const detail = String((e as Error)?.message ?? e);
    if (!isTransient(detail)) throw e;
    console.error("esa-review: transient failure, retrying once —", detail);
    await new Promise((r) => setTimeout(r, waitMs));
    return await fn();
  }
}
