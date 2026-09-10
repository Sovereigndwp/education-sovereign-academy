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

  var state = { invite: "", t: "", claims: [], review: null, fb: { useful: null, again: null } };

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

  /* ── 4 · the review ────────────────────────────────────────────────────
     Three findings, said in three different ways. The derived verdict word never appears — a good
     take-home with full coverage derives to NOT_SUPPORTED, which is not what is true about it. */
  var LABEL = {
    strong: "Good evidence",
    coverage_limited: "Does not ask for one part of it",
    conditions_limited: "Asks the right thing · the conditions limit what it proves",
  };

  function headline(c) {
    if (c.finding === "strong") return "This gives you evidence for what you want to know here. I would not change it.";
    if (c.finding === "coverage_limited") return "The assessment does not actually ask students to demonstrate one part of this.";
    return "The assessment asks for the right thing. Under these conditions the results cannot establish that each student can do it independently.";
  }

  function componentsHtml(c) {
    if (!c.coverage.components.length) return "";
    return '<ul class="esa-comp">' + c.coverage.components.map(function (x) {
      var word = x.status === "present" ? "Asked for" : x.status === "absent" ? "Not asked" : "Out of scope";
      return '<li data-status="' + esc(x.status) + '"><span class="esa-comp__state">' + esc(word) + "</span>" +
        '<span class="esa-comp__what">' + esc(x.component) +
        (x.items && x.items.length ? '<span class="esa-comp__where">item ' + esc(x.items.join(", ")) + "</span>" : "") +
        "</span></li>";
    }).join("") + "</ul>";
  }

  function recHtml(c) {
    var r = c.recommendation;
    if (c.finding === "strong") {
      return '<div class="esa-rec"><p class="esa-rec__none"><strong>No change.</strong> ' +
        esc(c.supports || "") + "</p>" +
        (c.over_verified_note ? '<p class="ast-note" style="margin-top:.7rem">' + esc(c.over_verified_note) + "</p>" : "") +
        "</div>";
    }
    if (!r) return "";
    var h = '<div class="esa-rec">';

    if (c.finding === "conditions_limited") {
      h += '<p class="esa-rec__none"><strong>The assessment does not change.</strong> ' +
        esc(r.inference_boundary || c.conditions_support.supports || "") + "</p>";
      if (r.verification === "short_supervised_observation" && r.add) {
        h += '<p class="ast-p" style="margin-top:1rem"><strong>If you need to be able to say each student can do it:</strong> one short check in the room, alongside this assignment, which stays exactly as it is.</p>' +
          '<div class="esa-item">' + esc(r.add.item_text) + "</div>" +
          '<p class="ast-note" style="margin-top:.7rem">' + esc(r.add.sufficiency_line || "") + "</p>" +
          (r.add.variant_rule ? '<p class="ast-note" style="margin-top:.5rem"><em>To make a fresh version each period:</em> ' + esc(r.add.variant_rule) + "</p>" : "") +
          '<p class="esa-cost">' + esc(r.student_minutes || "?") + " min for students · about " + esc(r.scoring_seconds || "?") + " sec each to read · in the room, " + esc((r.add.conditions || "").replace(/_/g, " ")) + "</p>";
      } else if (r.verification === "no_cheap_check") {
        h += '<p class="ast-p" style="margin-top:1rem"><strong>There is no short check that reaches this.</strong> ' + esc(r.no_short_check_reason || "") + " The boundary above is the honest answer.</p>";
      }
      return h + "</div>";
    }

    // coverage_limited
    if (r.tier === "modify_item" && r.modify) {
      h += '<p class="ast-p"><strong>One item, changed.</strong> Same page, same item count, same minutes.</p>' +
        '<div class="esa-swap"><div><strong>Item ' + esc(r.modify.item_ref) + " now</strong><code>" + esc(r.modify.current_text) + "</code></div>" +
        "<div><strong>Instead</strong><code>" + esc(r.modify.replacement_text) + "</code></div></div>" +
        '<p class="ast-p" style="margin-top:.8rem">' + esc(r.modify.what_it_now_forces) + "</p>";
    } else if (r.add) {
      h += '<p class="ast-p"><strong>One short item, added.</strong> No existing item could be changed to cover this without giving up something it already carries.</p>' +
        (r.why_not_tier_1 ? '<p class="ast-note">' + esc(r.why_not_tier_1) + "</p>" : "") +
        '<div class="esa-item">' + esc(r.add.item_text) + "</div>" +
        '<p class="ast-note" style="margin-top:.7rem">' + esc(r.add.sufficiency_line || "") + "</p>" +
        (r.add.variant_rule ? '<p class="ast-note" style="margin-top:.5rem"><em>To make a fresh version each period:</em> ' + esc(r.add.variant_rule) + "</p>" : "") +
        '<p class="esa-cost">' + esc(r.student_minutes || "?") + " min for students · about " + esc(r.scoring_seconds || "?") + " sec each to read</p>";
    } else if (r.tier === "no_cheap_check") {
      h += '<p class="ast-p"><strong>There is no short check that reaches this.</strong> ' + esc(r.no_short_check_reason || "") + "</p>";
    }
    return h + "</div>";
  }

  function renderReview(r) {
    state.review = r;
    $("r-title").textContent = r.title || "Assessment Review";
    $("r-meta").textContent = [r.subject, r.grade].filter(Boolean).join(" · ");
    var claims = r.claims || [];
    var strong = claims.filter(function (c) { return c.finding === "strong"; }).length;
    $("r-lede").textContent = strong === claims.length
      ? "Every claim you named is carried by this assessment under the conditions you described. There is nothing here I would change."
      : strong + " of " + claims.length + " claims are carried as they stand. Here is each one, and what to do about the rest.";

    $("r-claims").innerHTML = claims.map(function (c) {
      var statement = "";
      (r.claims_confirmed || []).forEach(function (x) { if (x.id === c.claim_id) statement = x.statement; });
      return '<section class="esa-finding" data-finding="' + esc(c.finding) + '">' +
        '<span class="esa-finding__label">' + esc(c.claim_id) + " · " + esc(LABEL[c.finding]) + "</span>" +
        '<p class="esa-finding__claim">' + esc(statement) + "</p>" +
        '<p class="esa-finding__headline">' + esc(headline(c)) + "</p>" +
        '<p class="esa-finding__body">' + esc(c.supports || "") + "</p>" +
        (c.finding === "conditions_limited" ? '<p class="esa-finding__body">' + esc(c.conditions_support.reason || "") + "</p>" : "") +
        componentsHtml(c) +
        (c.does_not_support && c.does_not_support.length
          ? '<p class="ast-mono" style="margin-top:1.4rem">What these results do not reach</p><ul class="ast-list">' +
            c.does_not_support.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>"
          : "") +
        recHtml(c) +
        "</section>";
    }).join("");
    show("s-4");
  }

  /* ── feedback ──────────────────────────────────────────────────────────── */
  function yesno(wrapId, key) {
    $(wrapId).addEventListener("click", function (ev) {
      var b = ev.target.closest("button"); if (!b) return;
      Array.prototype.forEach.call($(wrapId).querySelectorAll("button"), function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      state.fb[key] = b.dataset.v === "1";
    });
  }
  yesno("fb-useful", "useful");
  yesno("fb-again", "again");

  $("btn-fb").addEventListener("click", function () {
    var comment = $("fb-comment").value;
    busy($("btn-fb"), true, "Sending…");
    api({
      t: state.t, action: "feedback",
      was_useful: state.fb.useful, would_bring_another: state.fb.again, comment: comment,
      // Only true when a teacher asks for it themselves. The pilot is paste-only on purpose.
      wants_upload: /\bupload|attach|pdf|docx|word doc|photo|scan\b/i.test(comment),
    }).then(function () {
      $("fb-thanks").textContent = "Thank you — that goes straight to Dalia.";
      $("btn-fb").disabled = true;
    }).catch(function (e) { $("fb-thanks").textContent = e.message; busy($("btn-fb"), false); });
  });

  $("btn-another").addEventListener("click", function () { sessionStorage.removeItem("esa_t"); });

  begin();
})();
