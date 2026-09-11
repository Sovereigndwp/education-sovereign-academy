/* ESA pilot — the four-screen flow.
   One page, four sections, no framework. The invite token lives in the URL; the review token lives in
   sessionStorage so a reload does not lose a review in flight. Nothing is stored in localStorage:
   an assessment is the teacher's, and it does not need to outlive the tab. */
(function () {
  "use strict";

  var API = "https://rdqwoqdvqpedlsbaghtr.supabase.co/functions/v1/esa-review";
  var $ = function (id) { return document.getElementById(id); };
  var show = function (id) {
    ["s-gate", "s-1", "s-2", "s-3", "s-wait", "s-4", "s-error"].forEach(function (s) {
      $(s).classList.toggle("esa-hide", s !== id);
    });
    window.scrollTo({ top: 0, behavior: "auto" });
  };
  var esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };

  var state = { invite: "", t: "", claims: [], review: null, fb: { useful: null } };

  function api(body) {
    return fetch(API, {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body),
    }).then(function (r) {
      return r.json().then(function (j) {
        if (!r.ok) throw new Error(j.errors ? j.errors.join(" ") : (j.error || ("Request failed (" + r.status + ")")));
        return j;
      });
    });
  }
  function busy(btn, on, label) {
    if (!btn) return;
    btn.disabled = on;
    if (on) { btn.dataset.label = btn.textContent; btn.textContent = label || "Working…"; }
    else if (btn.dataset.label) { btn.textContent = btn.dataset.label; }
  }

  /* ── invite gate ───────────────────────────────────────────────────────── */
  function begin() {
    var url = new URL(location.href);
    var i = url.searchParams.get("i") || sessionStorage.getItem("esa_invite") || "";
    var t = url.searchParams.get("t") || sessionStorage.getItem("esa_t") || "";
    if (t) { state.t = t; sessionStorage.setItem("esa_t", t); return resume(); }
    if (!i) return show("s-gate");
    checkInvite(i);
  }
  function checkInvite(i) {
    api({ action: "check_invite", invite: i }).then(function (j) {
      state.invite = i;
      sessionStorage.setItem("esa_invite", i);
      var q = j.reviews_left + " of " + j.reviews_allowed + " reviews left";
      $("quota").textContent = q; $("quota-2").textContent = q;
      if (j.reviews_left <= 0) {
        $("error-text").textContent = "This invite covers " + j.reviews_allowed + " reviews and all " + j.reviews_allowed + " have been used. If you want more, say so — that is one of the things this pilot is trying to find out.";
        return show("s-error");
      }
      show("s-1");
    }).catch(function (e) { $("gate-err").textContent = e.message; show("s-gate"); });
  }
  $("gate-go").addEventListener("click", function () {
    var v = $("gate-token").value.trim();
    if (v) checkInvite(v); else $("gate-err").textContent = "Paste the code from your invite.";
  });

  /* ── 1 · submit ────────────────────────────────────────────────────────── */
  $("form-1").addEventListener("submit", function (ev) {
    ev.preventDefault();
    $("err-1").textContent = "";
    var body = {
      action: "create", invite: state.invite,
      title: $("f-title").value, subject: $("f-subject").value, grade: $("f-grade").value,
      assessment_text: $("f-text").value, teacher_notes: $("f-notes").value,
      confirm_no_student_data: $("f-confirm").checked, website: $("f-website").value,
    };
    busy($("btn-1"), true, "Reading…");
    api(body).then(function (j) {
      state.t = j.t; sessionStorage.setItem("esa_t", j.t);
      state.review = j.review;
      renderClaims(j.review);
      show("s-2");
    }).catch(function (e) { $("err-1").textContent = e.message; })
      .then(function () { busy($("btn-1"), false); });
  });

  /* ── 2 · claims ────────────────────────────────────────────────────────── */
  function renderClaims(review) {
    state.claims = (review.claims_inferred || []).map(function (c, i) {
      return { id: c.id || ("C" + (i + 1)), statement: c.statement || "", claim_type: c.claim_type || "procedural", quoted_verb: c.quoted_verb || "", items: c.items || [] };
    });
    drawClaims();
    var lo = review.left_out_question || "";
    $("left-out-wrap").classList.toggle("esa-hide", !lo);
    $("left-out").textContent = lo;
  }
  function drawClaims() {
    var wrap = $("claims-list");
    wrap.innerHTML = "";
    state.claims.forEach(function (c, idx) {
      var d = document.createElement("div");
      d.className = "esa-claim";
      d.innerHTML =
        '<div class="esa-claim__meta"><span class="esa-claim__id">' + esc(c.id) + "</span>" +
        (c.quoted_verb ? '<span class="esa-claim__quote">from the page: “' + esc(c.quoted_verb) + "”</span>" : "") +
        (c.items && c.items.length ? '<span class="esa-claim__quote">items ' + esc(c.items.join(", ")) + "</span>" : "") +
        "</div>" +
        '<textarea class="ast-textarea" aria-label="Claim ' + esc(c.id) + '"></textarea>' +
        '<button type="button" class="esa-claim__drop">Remove — I am not assessing this here</button>';
      var ta = d.querySelector("textarea");
      ta.value = c.statement;
      ta.addEventListener("input", function () { state.claims[idx].statement = ta.value; });
      d.querySelector("button").addEventListener("click", function () {
        state.claims.splice(idx, 1); drawClaims();
      });
      wrap.appendChild(d);
    });
  }
  $("btn-add-claim").addEventListener("click", function () {
    state.claims.push({ id: "C" + (state.claims.length + 1), statement: "", claim_type: "procedural", quoted_verb: "", items: [] });
    drawClaims();
    var tas = $("claims-list").querySelectorAll("textarea");
    if (tas.length) tas[tas.length - 1].focus();
  });
  $("btn-2").addEventListener("click", function () {
    var keep = state.claims.filter(function (c) { return (c.statement || "").trim().length > 10; });
    if (!keep.length) { $("err-2").textContent = "Keep at least one claim — the review is about what you are trying to find out."; return; }
    state.claims = keep;
    $("err-2").textContent = "";
    show("s-3");
  });

  /* ── 3 · conditions ────────────────────────────────────────────────────── */
  $("form-3").addEventListener("submit", function (ev) {
    ev.preventDefault();
    $("err-3").textContent = "";
    var pick = function (n) { var el = document.querySelector('input[name="' + n + '"]:checked'); return el ? el.value : ""; };
    var attribution = pick("attribution");
    var need = [];
    if (!pick("supervision")) need.push("where students do it");
    if (!pick("collaboration")) need.push("alone or together");
    if (!pick("ai_policy")) need.push("AI");
    if (!pick("purpose")) need.push("what it is for");
    if (!attribution) need.push("what you need to conclude");
    if (need.length) { $("err-3").textContent = "Still to answer: " + need.join(", ") + "."; return; }

    var resources = Array.prototype.map.call(document.querySelectorAll('input[name="resources"]:checked'), function (el) { return el.value; });
    var mins = parseInt($("f-minutes").value, 10);
    var body = {
      t: state.t, action: "confirm",
      claims: state.claims.map(function (c) { return { id: c.id, statement: c.statement, claim_type: c.claim_type }; }),
      conditions: {
        supervision: pick("supervision"), collaboration: pick("collaboration"), ai_policy: pick("ai_policy"),
        resources: resources, purpose: pick("purpose"),
        time_minutes: isFinite(mins) && mins > 0 ? mins : null,
        when_in_sequence: $("f-seq").value, novelty_note: $("f-novelty").value,
        needs_individual_attribution: attribution === "yes",
      },
    };
    busy($("btn-3"), true, "Starting…");
    api(body).then(function () { show("s-wait"); poll(); })
      .catch(function (e) { $("err-3").textContent = e.message; })
      .then(function () { busy($("btn-3"), false); });
  });

  /* ── waiting + resume ──────────────────────────────────────────────────── */
  var STAGE_WORDS = { queued: "Queued", diagnosing: "Reading the evidence", choosing: "Working out the smallest useful answer", done: "Done" };
  var tries = 0;
  function poll() {
    tries++;
    api({ t: state.t, action: "get" }).then(function (j) {
      var r = j.review;
      $("wait-stage").textContent = STAGE_WORDS[r.stage] || "Working";
      if (r.status === "ready") return renderReview(r);
      if (r.status === "failed") { $("error-text").textContent = r.error || "Something went wrong."; return show("s-error"); }
      if (tries > 120) { $("error-text").textContent = "This is taking much longer than it should. Nothing was lost — try again, or send it to Dalia."; return show("s-error"); }
      setTimeout(poll, 2500);
    }).catch(function (e) { $("error-text").textContent = e.message; show("s-error"); });
  }
  function resume() {
    api({ t: state.t, action: "get" }).then(function (j) {
      var r = j.review;
      state.review = r;
      if (r.status === "ready") return renderReview(r);
      if (r.status === "failed") { $("error-text").textContent = r.error || "Something went wrong."; return show("s-error"); }
      if (r.status === "awaiting_confirmation") { renderClaims(r); return show("s-2"); }
      show("s-wait"); poll();
    }).catch(function () { sessionStorage.removeItem("esa_t"); state.t = ""; begin(); });
  }

  /* ══ 4 · the review ═══════════════════════════════════════════════════════
     Answer first, then what I would do, then the evidence, then the usable item.
     A teacher should know where she stands on a claim in about five seconds and be able to stop
     reading there. Everything the engine worked out is still on the page — it sits under a summary
     she opens if she wants it. Nothing is softened; only the order and the wording change.
     Engine terms (coverage, conditions, components, limitation_type, the derived verdict) never
     appear in anything below. They are how ESA thinks, not how a teacher talks. */

  /* Plain English for the conditions the teacher herself declared. Built here from her own answers,
     not from model prose, so the sentence is always short and always in her words. */
  function plainSetting(c) {
    if (!c) return "the way students complete it";
    var where = { proctored_in_class: "in class, with you there",
                  observed_live: "in front of you",
                  partly_supervised: "partly in class and partly somewhere else",
                  unsupervised: "at home" }[c.supervision] || "outside class";
    var extras = [];
    if (c.ai_policy === "permitted" || c.ai_policy === "permitted_with_disclosure") extras.push("AI");
    if ((c.resources || []).indexOf("the internet") >= 0) extras.push("the internet");
    if ((c.resources || []).indexOf("notes") >= 0) extras.push("their notes");
    if ((c.resources || []).indexOf("calculator") >= 0) extras.push("a calculator");
    if (c.ai_policy === "prohibited_not_enforced" && !extras.length) extras.push("whatever they have to hand");
    if (c.collaboration === "pairs") extras.push("a partner");
    if (c.collaboration === "small_group") extras.push("their group");
    var tail = extras.length
      ? " with " + (extras.length === 1 ? extras[0]
        : extras.slice(0, -1).join(", ") + " and " + extras[extras.length - 1]) + " available"
      : "";
    return where + tail;
  }

  /* The one boundary shown in the collapsed view of a claim that needs nothing.
     The engine's stored does_not_support entries are written as clauses continuing an implied
     "this does not support…" — accurate, but they read as engine prose. This selects one and
     renders it as a plain sentence answering the only question a teacher has here: what should I
     be careful NOT to conclude from these results?

     Presentation only. It reads the stored record and never rewrites it, makes no model call, adds
     no inference, and drops only the engine's justification tail — which stays, in full and
     verbatim, inside the evidence disclosure. If no entry survives cleanly, the line is omitted
     rather than fudged: a boundary that has to be bent to fit is not worth showing. */
  var ENGINE_REGISTER = /does not support|independent evidence|claim[- ]component|narrower inference|adjacent claim|guess[- ]rate|selected[- ]response|verdict|elicits|delegab|feed[- ]forward|primitive|variant rule|sufficiency line/i;

  function boundaryOf(c) {
    var entries = c.does_not_support || [];
    for (var i = 0; i < entries.length; i++) {
      var raw = String(entries[i] || "").trim();
      if (!raw || ENGINE_REGISTER.test(raw)) continue;
      // "Anything about X" / "A judgment about X" are scope notes about the instrument, not
      // conclusions a teacher might wrongly draw. They do not transform into a sentence.
      if (/^(anything\b|a\b|an\b|the\b)/i.test(raw)) continue;
      var negated = /^does not\s/i.test(raw);
      var s = raw.replace(/^That\s+/i, "").replace(/^Does not\s+/i, "");
      // The engine's reason for the boundary is the part that reads as engine prose. The boundary
      // itself is the head clause, and it stands on its own.
      s = s.split(/,\s+(?:since|because|as)\s/i)[0].split(/\s*[;\u2014]\s+/)[0].trim().replace(/\.+$/, "");
      if (!s || s.length > 150) continue;
      s = s.charAt(0).toLowerCase() + s.slice(1);
      return negated ? "It does not " + s + "." : "It does not show that " + s + ".";
    }
    return "";
  }

  /* A · the plain-language finding: one heading, and one to three sentences. */
  function headingOf(c) {
    if (c.finding === "strong") return "This is doing its job.";
    if (c.finding === "coverage_limited") return "One part of this never actually gets asked.";
    return "The questions are right. The setting is what limits you.";
  }

  function plainOf(c, conditions) {
    var out = [];
    if (c.finding === "strong") {
      out.push(c.supports || "");
      var boundary = boundaryOf(c);
      if (boundary) out.push("Worth knowing: " + boundary);
      return out;
    }
    if (c.finding === "coverage_limited") {
      out.push(c.supports || "");
      if (c.coverage && c.coverage.missing_component) {
        out.push("What it never asks for is this: " + c.coverage.missing_component + ". So the results cannot tell you whether students can do that part.");
      } else if (c.gap_statement) { out.push(c.gap_statement); }
      return out;
    }
    // conditions
    out.push("The assignment asks students to do the thinking you care about.");
    out.push("Because they do it " + plainSetting(conditions) + ", the work that comes back does not show whether each student can do it on their own.");
    if (c.conditions_support && c.conditions_support.supports) {
      out.push("What it does show: " + c.conditions_support.supports);
    }
    return out;
  }

  /* B · what I would do — the practical conclusion, before any evidence. */
  function actionOf(c) {
    var r = c.recommendation;
    if (c.finding === "strong") return { verb: "Leave it alone.", line: "I would not change anything here." };
    if (c.finding === "conditions_limited") {
      if (r && r.verification === "short_supervised_observation") {
        return { verb: "Keep the assignment. Add one short check in class.",
                 line: "The assignment itself does not change. A few minutes in the room is what turns these results into evidence about each student." };
      }
      if (r && r.verification === "no_cheap_check") {
        return { verb: "No small change would answer this honestly.",
                 line: r.no_short_check_reason || "There is no short check in class that reaches this claim." };
      }
      return { verb: "Leave it alone — just know what the results mean.",
               line: "Nothing here needs changing. Read the results as what students can produce with help available, not as what each one can do alone." };
    }
    // coverage
    if (r && r.tier === "modify_item") {
      return { verb: "Change one item.", line: "Same page, same number of questions, same minutes. One item does different work." };
    }
    if (r && r.tier === "no_cheap_check") {
      return { verb: "No small change would answer this honestly.", line: r.no_short_check_reason || "" };
    }
    if (r && r.add) {
      return { verb: "Keep the assessment. Add one short question.",
               line: (r.why_not_tier_1 || "No existing item could be changed to cover this without giving up something it already does.") };
    }
    return { verb: "Nothing small would fix this.", line: "" };
  }

  /* C · the evidence, under a summary. Nothing is removed; it simply is not first. */
  function evidenceHtml(c) {
    var parts = [];
    if (c.coverage && c.coverage.components && c.coverage.components.length) {
      parts.push('<p class="ast-mono">What this assessment asks for</p><ul class="esa-comp">' +
        c.coverage.components.map(function (x) {
          var word = x.status === "present" ? "Asked for" : x.status === "absent" ? "Not asked" : "Out of scope";
          return '<li data-status="' + esc(x.status) + '"><span class="esa-comp__state">' + esc(word) + "</span>" +
            '<span class="esa-comp__what">' + esc(x.component) +
            (x.items && x.items.length ? '<span class="esa-comp__where">item ' + esc(x.items.join(", ")) + "</span>" : "") +
            "</span></li>";
        }).join("") + "</ul>");
    }
    if (c.supports) parts.push('<p class="ast-mono" style="margin-top:1.4rem">What the results support</p><p class="ast-p">' + esc(c.supports) + "</p>");
    if ((c.does_not_support || []).length) {
      parts.push('<p class="ast-mono" style="margin-top:1.4rem">What the results do not reach</p><ul class="ast-list">' +
        c.does_not_support.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>");
    }
    if (c.conditions_support && c.conditions_support.reason) {
      parts.push('<p class="ast-mono" style="margin-top:1.4rem">Why the setting matters here</p><p class="ast-p">' + esc(c.conditions_support.reason) + "</p>");
    }
    if (c.coverage && c.coverage.why) {
      parts.push('<p class="ast-mono" style="margin-top:1.4rem">The reasoning</p><p class="ast-p">' + esc(c.coverage.why) + "</p>");
    }
    if (c.over_verified_note) {
      parts.push('<p class="ast-mono" style="margin-top:1.4rem">One more thing</p><p class="ast-p">' + esc(c.over_verified_note) + "</p>");
    }
    if (!parts.length) return "";
    return '<details class="esa-details"><summary>Show the evidence behind this</summary><div class="esa-details__body">' +
      parts.join("") + "</div></details>";
  }

  /* D · the exact item, after she already knows why it is needed. */
  function interventionHtml(c) {
    var r = c.recommendation;
    if (!r) return "";
    if (c.finding === "coverage_limited" && r.tier === "modify_item" && r.modify) {
      return '<div class="esa-do"><p class="ast-mono">The change</p>' +
        '<div class="esa-swap"><div><strong>Item ' + esc(r.modify.item_ref) + " now</strong><code>" + esc(r.modify.current_text) + "</code></div>" +
        "<div><strong>Instead</strong><code>" + esc(r.modify.replacement_text) + "</code></div></div>" +
        '<p class="ast-p" style="margin-top:.8rem">' + esc(r.modify.what_it_now_forces) + "</p></div>";
    }
    if (r.add && (r.tier === "add_observation" || r.tier === "longer_observation" || r.verification === "short_supervised_observation")) {
      var inClass = c.finding === "conditions_limited";
      return '<div class="esa-do"><p class="ast-mono">' + (inClass ? "The check, word for word" : "The question, word for word") + "</p>" +
        '<div class="esa-item">' + esc(r.add.item_text) + "</div>" +
        (r.add.sufficiency_line ? '<p class="ast-note" style="margin-top:.7rem"><strong>What counts as an answer:</strong> ' + esc(r.add.sufficiency_line) + "</p>" : "") +
        (r.add.variant_rule ? '<p class="ast-note" style="margin-top:.5rem"><strong>A fresh version each period:</strong> ' + esc(r.add.variant_rule) + "</p>" : "") +
        '<p class="esa-cost">' + esc(r.student_minutes == null ? "?" : r.student_minutes) + " min for students · about " +
        esc(r.scoring_seconds == null ? "?" : r.scoring_seconds) + " sec each to read" +
        (inClass ? " · in class, with you there" : "") + "</p></div>";
    }
    return "";
  }

  function renderReview(r) {
    state.review = r;
    $("r-title").textContent = r.title || "Assessment Review";
    $("r-meta").textContent = [r.subject, r.grade].filter(Boolean).join(" · ");
    var claims = r.claims || [];
    var strong = claims.filter(function (c) { return c.finding === "strong"; }).length;
    $("r-lede").textContent = strong === claims.length
      ? "Everything you said you wanted to know, this assessment tells you — under the conditions you described. There is nothing here I would change."
      : strong + " of " + claims.length + " are fine as they stand. Here is each one, what I would do about it, and why.";

    $("r-claims").innerHTML = claims.map(function (c) {
      var statement = "";
      (r.claims_confirmed || []).forEach(function (x) { if (x.id === c.claim_id) statement = x.statement; });
      var act = actionOf(c);
      return '<section class="esa-finding" data-finding="' + esc(c.finding) + '">' +
        '<p class="esa-finding__claim">' + esc(statement) + "</p>" +
        // A
        '<h3 class="esa-finding__headline">' + esc(headingOf(c)) + "</h3>" +
        plainOf(c, r.conditions).filter(Boolean).map(function (p) {
          return '<p class="esa-finding__body">' + esc(p) + "</p>";
        }).join("") +
        // B
        '<div class="esa-action"><span class="esa-action__label">What I would do</span>' +
        '<p class="esa-action__verb">' + esc(act.verb) + "</p>" +
        (act.line ? '<p class="esa-action__line">' + esc(act.line) + "</p>" : "") +
        "</div>" +
        // C
        evidenceHtml(c) +
        // D
        interventionHtml(c) +
        "</section>";
    }).join("");
    renderFeedback(r);
    show("s-4");
  }

  /* ── feedback ──────────────────────────────────────────────────────────
     One question. We do not ask whether she intends to come back — intention is not the signal, a
     second assessment is. The return question is asked only once she has actually submitted one. */
  function renderFeedback(r) {
    var isReturn = Number(r.submission_index || 1) >= 2;
    $("fb-return-wrap").classList.toggle("esa-hide", !isReturn);
  }

  $("fb-useful").addEventListener("click", function (ev) {
    var b = ev.target.closest("button"); if (!b) return;
    Array.prototype.forEach.call($("fb-useful").querySelectorAll("button"), function (x) { x.setAttribute("aria-pressed", String(x === b)); });
    state.fb.useful = b.dataset.v === "1";
  });

  $("btn-fb").addEventListener("click", function () {
    var comment = $("fb-comment").value;
    busy($("btn-fb"), true, "Sending…");
    api({
      t: state.t, action: "feedback",
      was_useful: state.fb.useful,
      return_reason: $("fb-return").value,
      comment: comment,
      // Only true when a teacher asks for it herself. The pilot is paste-only on purpose.
      wants_upload: /\bupload|attach|pdf|docx|word doc|photo|scan\b/i.test(comment),
    }).then(function () {
      $("fb-thanks").textContent = "Thank you — that goes straight to Dalia.";
      $("btn-fb").disabled = true;
    }).catch(function (e) { $("fb-thanks").textContent = e.message; busy($("btn-fb"), false); });
  });

  $("btn-another").addEventListener("click", function () { sessionStorage.removeItem("esa_t"); });

  begin();
})();
