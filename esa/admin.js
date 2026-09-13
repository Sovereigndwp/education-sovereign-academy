/* ESA pilot admin — five rows, three tables, no charts.
   The key is typed each visit and kept only in memory. Fifteen analyses will not give a rate, so
   nothing here computes one: it shows who came back, with what, and what they said. */
(function () {
  "use strict";
  var API = "https://rdqwoqdvqpedlsbaghtr.supabase.co/functions/v1/esa-review";
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  var when = function (s) { return s ? new Date(s).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"; };
  var yn = function (v) { return v === true ? "yes" : v === false ? "no" : "—"; };
  var label = {};

  function rows(tableId, html) { $(tableId).querySelector("tbody").innerHTML = html; }

  function load(key) {
    return fetch(API, {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "admin", key: key }),
    }).then(function (r) {
      return r.json().then(function (j) { if (!r.ok) throw new Error(j.error || "Not authorised."); return j; });
    });
  }

  function draw(j) {
    $("arch").textContent = j.arch_version || "";
    var origin = location.origin;

    (j.invites || []).forEach(function (i) { label[i.token] = i.teacher_label; });

    rows("t-invites", (j.invites || []).map(function (i) {
      var back = i.brought_third ? "third" : i.brought_second ? "second" : "not yet";
      return "<tr>" +
        "<td>" + esc(i.teacher_label) + (i.revoked ? " <em>(revoked)</em>" : "") + "</td>" +
        '<td class="num">' + esc(i.used) + "</td>" +
        '<td class="num">' + esc(i.remaining) + "</td>" +
        "<td>" + esc(back) + "</td>" +
        "<td>" + esc(when(i.first_at)) + "</td>" +
        "<td>" + esc(when(i.last_at)) + "</td>" +
        '<td><code style="font-size:.8rem">' + esc(origin) + "/esa/review/?i=" + esc(i.token) + "</code></td>" +
        "</tr>";
    }).join("") || '<tr><td colspan="7">No invites yet. Insert a row into esa_invites.</td></tr>');

    rows("t-reviews", (j.reviews || []).map(function (r) {
      var c = r.conditions || {};
      var cond = [c.supervision, c.collaboration, c.ai_policy].filter(Boolean).join(" · ").replace(/_/g, " ");
      var flags = []
        .concat((r.span_violations || []).map(function (v) { return v.code; }))
        .concat((r.arch_violations || []).map(function (v) { return v.code; }));
      return "<tr>" +
        "<td>" + esc(when(r.created_at)) + "</td>" +
        "<td>" + esc(label[r.invite_token] || r.invite_token.slice(0, 8)) + "</td>" +
        "<td>" + esc(r.title || "—") + '<span class="esa-comp__where">' + esc([r.subject, r.grade].filter(Boolean).join(" · ")) + "</span></td>" +
        "<td>" + esc(cond || "—") + "</td>" +
        "<td>" + esc(c.needs_individual_attribution === true ? "yes" : c.needs_individual_attribution === false ? "no" : "—") + "</td>" +
        "<td>" + esc(yn(r.claims_corrected)) + "</td>" +
        "<td>" + esc(r.status) + (r.error ? '<span class="esa-comp__where">' + esc(String(r.error).slice(0, 120)) + "</span>" : "") + "</td>" +
        '<td class="num">' + (flags.length ? esc(flags.join(", ")) : "—") + "</td>" +
        "</tr>";
    }).join("") || '<tr><td colspan="8">No reviews yet.</td></tr>');

    rows("t-feedback", (j.feedback || []).map(function (f) {
      return "<tr>" +
        "<td>" + esc(when(f.created_at)) + "</td>" +
        "<td>" + esc(label[f.invite_token] || f.invite_token.slice(0, 8)) + "</td>" +
        "<td>" + esc(yn(f.was_useful)) + "</td>" +
        "<td>" + esc(f.return_reason || "—") + "</td>" +
        "<td>" + esc(f.wants_upload ? "yes" : "—") + "</td>" +
        "<td>" + esc(f.comment || "—") + "</td>" +
        "</tr>";
    }).join("") || '<tr><td colspan="6">Nothing yet.</td></tr>');

    $("gate").classList.add("esa-hide");
    $("view").classList.remove("esa-hide");
  }

  $("go").addEventListener("click", function () {
    var k = $("key").value.trim();
    if (!k) { $("err").textContent = "Enter the key."; return; }
    $("err").textContent = "";
    load(k).then(draw).catch(function (e) { $("err").textContent = e.message; });
  });
  $("key").addEventListener("keydown", function (e) { if (e.key === "Enter") $("go").click(); });
})();
