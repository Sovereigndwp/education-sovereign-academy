// ESA — the one pilot endpoint. An invite token is the credential; there are no accounts.
//
//   POST {invite}                                        → check the invite, return quota
//   POST {invite, action:"create", ...}                  → store the assessment, infer claims (sync), return {t}
//   POST {t, action:"confirm", claims, conditions}       → confirm claims + conditions, start the review (background)
//   POST {t, action:"get"}                               → poll
//   POST {t, action:"feedback", ...}                     → the two pilot questions
//   POST {action:"admin", key}                           → the pilot view
//
// Paste-only. No file upload, no extraction: the pilot is not spending its five teachers on parsing.
// Never accepts student work or student PII — assessments only, and the teacher confirms that.
import { db, json, preflight, EMAIL_RE, nowIso } from "../_shared/lib.ts";
import { safeError, retryOnce } from "../_shared/safe.ts";
import { callModel } from "../_shared/engine.ts";
import {
  claimInferenceSystem, claimInferenceUser, extractJson, runReview, reapIfStale,
  limitationOf, findingOf, isRealComponent, ESA_ARCH_VERSION,
  type Claim, type Conditions, type Component,
} from "../_shared/esa.ts";

const MAX_TEXT = 40000;
const REVIEWS_PER_TEACHER = 3;
const R_SELECT = "id,created_at,invite_token,title,subject,grade,teacher_notes,status,stage,stage_at,error,claims_inferred,claims_confirmed,claims_corrected,left_out_question,conditions,diagnosis,remedies,arch_version,model,span_violations,arch_violations,assessment_text";

// deno-lint-ignore no-explicit-any
type Rec = Record<string, any>;

const str = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);
const token = () => Array.from(crypto.getRandomValues(new Uint8Array(16))).map((b) => b.toString(16).padStart(2, "0")).join("");

const SUPERVISION = new Set(["proctored_in_class", "observed_live", "partly_supervised", "unsupervised"]);
const COLLAB = new Set(["individual", "pairs", "small_group"]);
const AI = new Set(["prohibited_and_enforced", "prohibited_not_enforced", "permitted_with_disclosure", "permitted"]);
const PURPOSE = new Set(["summative", "formative", "practice", "placement"]);

async function loadByToken(t: string): Promise<Rec | null> {
  if (!/^[a-f0-9]{32}$/.test(t)) return null;
  const rows = await db<Rec[]>(`esa_reviews?access_token=eq.${t}&select=${R_SELECT}`);
  return rows?.[0] ?? null;
}

async function invite(tok: string): Promise<Rec | null> {
  if (!/^[a-f0-9]{8,64}$/.test(tok)) return null;
  const rows = await db<Rec[]>(`esa_invites?token=eq.${tok}&select=token,teacher_label,reviews_allowed,revoked,note`);
  const inv = rows?.[0];
  if (!inv || inv.revoked) return null;
  return inv;
}

/** Server-side quota. Counted from rows, never from anything the browser sends. */
async function used(tok: string): Promise<number> {
  const rows = await db<Rec[]>(`esa_reviews?invite_token=eq.${tok}&status=neq.failed&select=id`);
  return rows?.length ?? 0;
}

/** Which submission this review is for its teacher, counting only reviews that got that far. */
async function submissionIndex(r: Rec): Promise<number> {
  const rows = await db<Rec[]>(`esa_reviews?invite_token=eq.${r.invite_token}&status=neq.failed&select=id,created_at&order=created_at.asc`);
  const at = (rows ?? []).findIndex((x) => x.id === r.id);
  return at >= 0 ? at + 1 : (rows?.length ?? 0) + 1;
}

/* ── what the teacher's browser is allowed to see ───────────────────────────
   Never the derived verdict word. A take-home assessment with sufficient coverage derives to
   NOT_SUPPORTED, which reads far harsher than the truth — the assignment is fine, the attribution is
   not. The page gets the two axes and the boundary sentence, and says the right thing itself. */
function publicClaim(d: Rec, remedy: Rec | undefined) {
  const cov = d.coverage ?? {}, cs = d.conditions_support ?? {};
  const b = remedy?.stage_b ?? null;
  return {
    claim_id: d.claim_id,
    finding: findingOf(d),
    limitation_type: limitationOf(d),
    supports: d.supports,
    does_not_support: d.does_not_support ?? [],
    gap_statement: d.gap_statement ?? "",
    coverage: {
      status: cov.coverage_status,
      // Only components carrying a verb. A manner qualifier the engine rejected is working correctly
      // and is not a requirement, so it is not shown to the teacher as one.
      components: (cov.components ?? []).filter(isRealComponent).map((c: Component) => ({
        component: c.component, status: c.status, items: c.items ?? [], evidence: c.evidence ?? "",
      })),
      missing_component: cov.coverage_missing_component ?? "",
      why: cov.why ?? "",
    },
    conditions_support: {
      status: cs.status, reason: cs.conditions_reason ?? "", supports: cs.conditions_supports ?? "",
    },
    over_verified_note: d.over_verified_note ?? "",
    recommendation: b && {
      assessment_change: b.assessment_change ?? null,
      tier: b.tier ?? null,
      inference_boundary: b.inference_boundary ?? null,
      verification: b.verification ?? null,
      modify: b.modify ?? null,
      add: b.add ?? null,
      no_short_check_reason: b.no_short_check_reason ?? "",
      student_minutes: b.student_minutes ?? null,
      scoring_seconds: b.scoring_seconds ?? null,
    },
  };
}

function publicReview(r: Rec, submissionIndex?: number) {
  const rem: Rec[] = (r.remedies ?? []) as Rec[];
  return {
    t: undefined,
    // Which submission this is for this teacher. The page asks "what made you want to check another
    // one?" only from the second onward — we never ask anyone whether they INTEND to come back,
    // because coming back is the signal and a stated intention is not.
    submission_index: submissionIndex ?? null,
    created_at: r.created_at, title: r.title, subject: r.subject, grade: r.grade,
    status: r.status, stage: r.stage, error: r.error,
    claims_inferred: r.claims_inferred ?? null,
    claims_confirmed: r.claims_confirmed ?? null,
    left_out_question: r.left_out_question ?? "",
    conditions: r.conditions ?? null,
    assessment_text: r.assessment_text ?? "",
    claims: r.status === "ready"
      ? ((r.diagnosis ?? []) as Rec[]).map((d) => publicClaim(d, rem.find((x) => x.claim_id === d.claim_id)))
      : null,
    arch_version: r.arch_version ?? null,
  };
}

/* ── create ───────────────────────────────────────────────────────────────── */
async function create(body: Rec): Promise<Response> {
  if (str(body.website, 40)) return json({ ok: true, t: "ok" });      // honeypot
  const inv = await invite(str(body.invite, 64));
  if (!inv) return json({ error: "That invite link is not valid. Check the link you were sent." }, 403);

  const allowed = Number(inv.reviews_allowed ?? REVIEWS_PER_TEACHER);
  if ((await used(inv.token)) >= allowed) {
    return json({ error: `This pilot invite covers ${allowed} reviews and all ${allowed} have been used. Tell Dalia if you want more — that is useful to know.`, quota_exhausted: true }, 403);
  }

  const subject = str(body.subject, 120);
  const grade = str(body.grade, 120);
  const text = str(body.assessment_text, MAX_TEXT);
  const title = str(body.title, 200);
  const notes = str(body.teacher_notes, 2000);
  const email = str(body.email, 200).toLowerCase();

  const errors: string[] = [];
  if (!subject) errors.push("Subject is required.");
  if (!grade) errors.push("Grade or course is required.");
  if (text.length < 80) errors.push("Paste the assessment itself — the items students see, not a description of it.");
  if (body.confirm_no_student_data !== true) errors.push("Confirm the text contains no student names, student work, or grades.");
  if (email && !EMAIL_RE.test(email)) errors.push("That email address doesn't look right (it is optional).");
  if (errors.length) return json({ errors }, 400);

  const t = token();
  const rows = await db<Rec[]>("esa_reviews", {
    method: "POST",
    body: {
      access_token: t, invite_token: inv.token, title: title || null, subject, grade,
      teacher_notes: notes || null, email: email || null, assessment_text: text,
      status: "inferring", stage: "reading", stage_at: nowIso(),
    },
  });
  const id = rows?.[0]?.id;

  // Claim inference is synchronous: the teacher is waiting on screen 2 and it is one short call.
  try {
    const a = await callModel(claimInferenceSystem(), [{ type: "text", text: claimInferenceUser({ subject, grade, title, teacher_notes: notes, assessment_text: text }) }], 4000);
    const inferred = extractJson(a.text) as Rec;
    await db(`esa_reviews?id=eq.${id}`, {
      method: "PATCH", prefer: "return=minimal",
      body: {
        claims_inferred: inferred.claims ?? [], left_out_question: str(inferred.left_out_question, 600),
        title: title || str(inferred.title, 200) || null, status: "awaiting_confirmation", stage: "claims", stage_at: nowIso(), model: a.model,
      },
    });
  } catch (e) {
    await db(`esa_reviews?id=eq.${id}`, { method: "PATCH", prefer: "return=minimal", body: { status: "failed", error: String((e as Error).message ?? e).slice(0, 900), stage_at: nowIso() } });
    return json({ error: "Could not read that assessment. Nothing was saved against your quota — try again, or send it to Dalia." }, 502);
  }

  const r = await loadByToken(t);
  return json({ t, review: publicReview(r!, (await used(inv.token))) });
}

/* ── confirm: claims + conditions, then run ───────────────────────────────── */
async function confirm(r: Rec, body: Rec): Promise<Response> {
  if (r.status !== "awaiting_confirmation" && r.status !== "failed") {
    return json({ error: "This review has already been started." }, 409);
  }
  const raw = Array.isArray(body.claims) ? body.claims : [];
  const claims: Claim[] = raw.slice(0, 8).map((c: Rec, i: number) => ({
    id: str(c.id, 12) || `C${i + 1}`,
    statement: str(c.statement, 600),
    claim_type: str(c.claim_type, 40) || "procedural",
  })).filter((c: Claim) => c.statement.length > 10);
  if (!claims.length) return json({ errors: ["Keep at least one claim — the review is about what you are trying to find out."] }, 400);

  const c = body.conditions ?? {};
  const conditions: Conditions = {
    supervision: SUPERVISION.has(str(c.supervision, 40)) ? str(c.supervision, 40) : "",
    collaboration: COLLAB.has(str(c.collaboration, 40)) ? str(c.collaboration, 40) : "",
    ai_policy: AI.has(str(c.ai_policy, 40)) ? str(c.ai_policy, 40) : "",
    resources: Array.isArray(c.resources) ? c.resources.slice(0, 12).map((x: unknown) => str(x, 60)).filter(Boolean) : [],
    purpose: PURPOSE.has(str(c.purpose, 40)) ? str(c.purpose, 40) : "",
    time_minutes: Number.isFinite(Number(c.time_minutes)) && Number(c.time_minutes) > 0 ? Math.min(600, Math.round(Number(c.time_minutes))) : null,
    when_in_sequence: str(c.when_in_sequence, 200),
    novelty_note: str(c.novelty_note, 600),
    needs_individual_attribution: c.needs_individual_attribution === true,
  };
  const missing = (["supervision", "collaboration", "ai_policy", "purpose"] as const).filter((k) => !conditions[k]);
  if (missing.length) return json({ errors: [`Answer every question on this screen — missing: ${missing.join(", ")}.`] }, 400);
  if (typeof c.needs_individual_attribution !== "boolean") {
    return json({ errors: ["Tell us what you need to be able to conclude. It changes the answer, so ESA does not guess it."] }, 400);
  }

  const corrected = JSON.stringify((r.claims_inferred ?? []).map((x: Rec) => x.statement)) !== JSON.stringify(claims.map((x) => x.statement));
  await db(`esa_reviews?id=eq.${r.id}`, {
    method: "PATCH", prefer: "return=minimal",
    body: { claims_confirmed: claims, claims_corrected: corrected, conditions, status: "running", stage: "queued", stage_at: nowIso(), error: null },
  });

  const id = String(r.id);
  // Background, with the read side able to reap it — an isolate reclaimed mid-run must not leave a
  // row stuck on "running" forever. That was the Assignment Studio failure and it is not repeated.
  // deno-lint-ignore no-explicit-any
  const rt = (globalThis as any).EdgeRuntime;
  if (rt?.waitUntil) rt.waitUntil(runReview(id).catch(() => {}));
  else runReview(id).catch(() => {});

  const fresh = await db<Rec[]>(`esa_reviews?id=eq.${id}&select=${R_SELECT}`);
  return json({ review: publicReview(fresh[0], await submissionIndex(r)) });
}

/* ── feedback: two questions, deliberately short ──────────────────────────── */
async function feedback(r: Rec, body: Rec): Promise<Response> {
  await db("esa_feedback", {
    method: "POST", prefer: "return=minimal",
    body: {
      review_id: r.id, invite_token: r.invite_token,
      was_useful: typeof body.was_useful === "boolean" ? body.was_useful : null,
      // Only meaningful from the second submission onward; the page shows the question only then.
      return_reason: str(body.return_reason, 1000) || null,
      wants_upload: body.wants_upload === true,
      comment: str(body.comment, 2000) || null,
    },
  });
  return json({ ok: true });
}

/* ── admin ────────────────────────────────────────────────────────────────── */
async function admin(body: Rec): Promise<Response> {
  const key = str(body.key, 200);
  const expected = Deno.env.get("ESA_ADMIN_KEY") ?? "";
  if (!expected || key !== expected) return json({ error: "Not authorised." }, 403);

  const invites = await db<Rec[]>("esa_invites?select=token,teacher_label,reviews_allowed,revoked,note,created_at&order=created_at.asc");
  const reviews = await db<Rec[]>("esa_reviews?select=id,created_at,invite_token,title,subject,grade,status,stage,claims_corrected,conditions,arch_version,span_violations,arch_violations,error&order=created_at.desc&limit=100");
  const fb = await db<Rec[]>("esa_feedback?select=review_id,invite_token,was_useful,return_reason,wants_upload,comment,created_at&order=created_at.desc&limit=100");

  const perInvite = invites.map((i) => {
    const mine = reviews.filter((x) => x.invite_token === i.token);
    const counted = mine.filter((x) => x.status !== "failed");
    return {
      ...i,
      used: counted.length,
      remaining: Math.max(0, Number(i.reviews_allowed ?? REVIEWS_PER_TEACHER) - counted.length),
      // The pilot's actual question: did she come back with a second assessment, unprompted?
      brought_second: counted.length >= 2,
      brought_third: counted.length >= 3,
      first_at: counted.length ? counted[counted.length - 1].created_at : null,
      last_at: counted.length ? counted[0].created_at : null,
    };
  });
  return json({ invites: perInvite, reviews, feedback: fb, arch_version: ESA_ARCH_VERSION });
}

/* ── router ───────────────────────────────────────────────────────────────── */
Deno.serve(async (req: Request) => {
  const pre = preflight(req);
  if (pre) return pre;
  if (req.method !== "POST") return json({ error: "POST only." }, 405);

  let body: Rec;
  try { body = await req.json(); } catch { return json({ error: "Expected JSON." }, 400); }

  try {
    const action = str(body.action, 40);
    if (action === "admin") return await admin(body);

    if (action === "check_invite") {
      const inv = await invite(str(body.invite, 64));
      if (!inv) return json({ error: "That invite link is not valid." }, 403);
      const allowed = Number(inv.reviews_allowed ?? REVIEWS_PER_TEACHER);
      const u = await used(inv.token);
      return json({ ok: true, teacher_label: inv.teacher_label, reviews_allowed: allowed, reviews_used: u, reviews_left: Math.max(0, allowed - u) });
    }
    if (action === "create") return await create(body);

    const t = str(body.t, 64);
    let r = await retryOnce(() => loadByToken(t));
    if (!r) return json({ error: "That link is not valid." }, 404);
    r = await reapIfStale(r);

    if (action === "confirm") return await confirm(r, body);
    if (action === "feedback") return await feedback(r, body);
    if (action === "get" || !action) return json({ review: publicReview(r, await submissionIndex(r)) });
    return json({ error: `Unknown action "${action}".` }, 400);
  } catch (e) {
    const detail = String((e as Error)?.message ?? e);
    console.error("esa-review: unhandled —", detail);
    const safe = safeError(detail);
    return json({ error: safe.error, retryable: safe.retryable }, safe.status);
  }
});
