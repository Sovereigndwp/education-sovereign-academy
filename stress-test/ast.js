/* Assessment Stress Test — shared client. No frameworks, no cookies, no PII in events. */
(function () {
  const SUPABASE_URL = "https://rdqwoqdvqpedlsbaghtr.supabase.co";
  // Publishable key: insert-only on ast_events under RLS (same contract as mi_responses).
  const PUB_KEY = "sb_publishable_wppmprcDhDQ34qdO2Aqk4Q_dQQiejBq";

  const params = new URLSearchParams(location.search);
  const channel = params.get("s") || params.get("c") || null;
  let sid = null;
  try {
    sid = sessionStorage.getItem("ast_sid");
    if (!sid) { sid = Math.random().toString(36).slice(2) + Date.now().toString(36); sessionStorage.setItem("ast_sid", sid); }
    if (channel) sessionStorage.setItem("ast_channel", channel);
  } catch (_) { sid = "s" + Date.now().toString(36); }
  let storedChannel = channel;
  try { storedChannel = storedChannel || sessionStorage.getItem("ast_channel"); } catch (_) {}

  function track(event, props, submissionId) {
    try {
      const body = JSON.stringify({
        session_id: sid, event, page: location.pathname, channel: storedChannel || null,
        submission_id: submissionId || null, props: props || null,
      });
      fetch(SUPABASE_URL + "/rest/v1/ast_events", {
        method: "POST", keepalive: true,
        headers: { "Content-Type": "application/json", apikey: PUB_KEY, Authorization: "Bearer " + PUB_KEY, Prefer: "return=minimal" },
        body,
      }).catch(function () {});
    } catch (_) {}
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  const TYPE_LABEL = {
    construct_mismatch: "Measures something else",
    shortcut_available: "Right answer without the thinking",
    right_answer_wrong_model: "Right answer, wrong model",
    distractors_uninformative: "Wrong answers reveal little",
    reasoning_invisible: "Reasoning stays invisible",
    ai_substitutable: "Producible without the student",
  };
  const STRENGTH_LABEL = { strong: "Strong", moderate: "Moderate", weak: "Weak" };

  /** Render one finding as the paper document. */
  function renderFinding(f, opts) {
    opts = opts || {};
    const tag = TYPE_LABEL[f.finding_type] || "Finding";
    return (
      '<article class="ast-doc">' +
      '<div class="ast-doc__head"><span class="ast-doc__eyebrow">' + esc(opts.eyebrow || "Finding") + "</span>" +
      '<span class="ast-doc__meta">' + esc(tag) + "</span></div>" +
      "<h2>" + esc(f.item_ref) + "</h2>" +
      (f.item_quote ? '<div class="ast-doc__quote">' + esc(f.item_quote) + "</div>" : "") +
      '<h3><span class="ast-doc__tag">What you’re trying to measure</span></h3><p>' + esc(f.trying_to_measure) + "</p>" +
      '<h3><span class="ast-doc__tag">What this item may actually give evidence of</span></h3><p>' + esc(f.actually_evidences) + "</p>" +
      '<h3><span class="ast-doc__tag">Why that matters</span></h3><p>' + esc(f.why_it_matters) + "</p>" +
      '<h3><span class="ast-doc__tag">A stronger version</span></h3><div class="ast-doc__stronger">' + esc(f.stronger_version) + "</div>" +
      '<h3><span class="ast-doc__tag">Why this gives better evidence</span></h3><p>' + esc(f.why_better_evidence) + "</p>" +
      '<div class="ast-doc__grid"><div class="ast-doc__cell"><strong>What did not change</strong>' + esc(f.what_did_not_change) + "</div>" +
      '<div class="ast-doc__cell"><strong>Cost to you</strong>' + esc(f.teacher_cost) + "</div></div>" +
      '<p class="ast-doc__judgment">' + esc(STRENGTH_LABEL[f.strength] || "") + " · a professional judgment, not a measurement</p>" +
      '<div class="ast-doc__foot"><span>A Sovereign Academy property</span><span>thesovereign.academy/stress-test</span></div>' +
      "</article>"
    );
  }

  function renderClean(note, opts) {
    opts = opts || {};
    return (
      '<article class="ast-doc ast-doc--clean">' +
      '<div class="ast-doc__head"><span class="ast-doc__eyebrow">' + esc(opts.eyebrow || "Finding") + '</span><span class="ast-doc__meta">No strong evidence of a problem</span></div>' +
      "<h2>We don’t see strong evidence of a problem here.</h2>" +
      '<h3><span class="ast-doc__tag">What this assessment does well</span></h3><div class="ast-doc__stronger">' + esc(note) + "</div>" +
      '<p class="ast-doc__judgment">A professional judgment, not a measurement</p>' +
      '<div class="ast-doc__foot"><span>A Sovereign Academy property</span><span>thesovereign.academy/stress-test</span></div>' +
      "</article>"
    );
  }

  window.AST = {
    SUPABASE_URL, PUB_KEY, FN: SUPABASE_URL + "/functions/v1",
    sid, channel: storedChannel, track, esc, renderFinding, renderClean, TYPE_LABEL, STRENGTH_LABEL,
    fmtDate: function (iso) { try { return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }); } catch (_) { return iso || ""; } },
  };
})();
