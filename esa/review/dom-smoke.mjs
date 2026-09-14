// DOM smoke test — loads the SHIPPED esa/index.html + esa/esa.js, stubs fetch with a real review
// payload from the verified run, and checks that a teacher actually sees the right thing.
//
//   node esa/dom-smoke.mjs        (needs jsdom: npm i jsdom)
//
// Order is part of the contract now: answer first, what I would do second, evidence third, the
// usable item last. Several assertions below check POSITION, not just presence.
import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";

const payload = JSON.parse(readFileSync(new URL("./fixtures/review.json", import.meta.url), "utf8"));
let fails = 0;
const ok = (n, c, extra = "") => { if (!c) fails++; console.log(`  ${c ? "PASS" : "FAIL"}  ${n}${extra ? "   " + extra : ""}`); };

const base = new URL("./", import.meta.url);
const dom = new JSDOM(readFileSync(new URL("./index.html", base), "utf8"), {
  url: "https://thesovereign.academy/esa/review/?t=" + "a".repeat(32),
  runScripts: "outside-only", pretendToBeVisual: true,
});
const w = dom.window;
w.fetch = async (_u, init) => {
  const body = JSON.parse(init.body);
  if (body.action === "get") return { ok: true, json: async () => payload };
  if (body.action === "check_invite") return { ok: true, json: async () => ({ ok: true, reviews_allowed: 3, reviews_used: 1, reviews_left: 2 }) };
  return { ok: true, json: async () => ({ ok: true }) };
};
w.scrollTo = () => {};
w.eval(readFileSync(new URL("./esa.js", base), "utf8"));

await new Promise((r) => setTimeout(r, 400));
const d = w.document;
const html = d.getElementById("r-claims").innerHTML;
const visible = (id) => !d.getElementById(id).classList.contains("esa-hide");
const section = (finding) => (html.split(`data-finding="${finding}"`)[1] || "").split("</section>")[0];

console.log("\n1 · the flow lands on the review");
ok("screen 4 is showing", visible("s-4"));
ok("the waiting screen is hidden", !visible("s-wait"));
ok("the title rendered", d.getElementById("r-title").textContent.includes("Fractions"));

console.log("\n2 · three findings, said three different ways");
ok("a strong finding rendered", html.includes('data-finding="strong"'));
ok("a coverage limitation rendered", html.includes('data-finding="coverage_limited"'));
ok("a conditions limitation rendered", html.includes('data-finding="conditions_limited"'));

console.log("\n3 · answer first → action second → evidence third → item last");
for (const f of ["strong", "coverage_limited", "conditions_limited"]) {
  const s = section(f);
  const iHead = s.indexOf("esa-finding__headline");
  const iAct = s.indexOf("esa-action");
  const iEv = s.indexOf("esa-details");
  const iDo = s.indexOf("esa-do");
  ok(`${f}: heading comes first`, iHead >= 0 && (iAct < 0 || iHead < iAct));
  ok(`${f}: "What I would do" precedes the evidence`, iAct >= 0 && (iEv < 0 || iAct < iEv));
  if (iDo >= 0) ok(`${f}: the usable item comes after the reasoning`, iDo > iAct);
}
ok("the evidence is collapsed behind a summary", html.includes("<details") && html.includes("Show the evidence behind this"));
ok("the detailed reasoning is still on the page", /The reasoning|Why the setting matters|do not reach/.test(html));

console.log("\n4 · the plain-language finding is plain");
ok("strong says it is doing its job", section("strong").includes("This is doing its job"));
ok("coverage names the part never asked for", section("coverage_limited").includes("never actually gets asked"));
ok("conditions separates the questions from the setting", section("conditions_limited").includes("The questions are right"));
ok("conditions explains the setting in the teacher's own terms",
  /they do it at home/.test(section("conditions_limited")) && /on their own/.test(section("conditions_limited")));

console.log("\n5 · what I would do — three tiers, pinned to A4 (2026-09-13)");
ok("strong → leave it alone", section("strong").includes("Leave it alone"));
ok("coverage → keep it, add one short question", section("coverage_limited").includes("Keep the assessment. Add one short question"));
ok("conditions → keep it, add a short check", section("conditions_limited").includes("Keep the assignment"));
ok("NO branch offers an item swap — modify-one-item is out of pilot scope",
  d.body.innerHTML.indexOf("esa-swap") === -1);
ok("the teacher is never told to change an existing item", !d.body.textContent.includes("Change one item"));

console.log("\n6 · no-change is earned, not empty");
const s0 = section("strong");
ok("a strong claim gives a concrete reason", s0.replace(/<[^>]+>/g, "").length > 400, `${s0.replace(/<[^>]+>/g, "").length} chars`);
ok("a strong claim still states one boundary", s0.includes("Worth knowing:"));

console.log("\n7 · engine vocabulary never reaches the teacher");
const body = d.body.textContent;
for (const t of ["NOT_SUPPORTED", "NOT SUPPORTED", "LIMITED ", "KEEP", "NO_CHEAP_CHECK",
                 "coverage_limited", "conditions_limited", "limitation_type", "Stage A", "Stage B",
                 "component map", "gate 1", "modify_item", "add_observation"]) {
  ok(`"${t.trim()}" is absent from the page`, !body.includes(t));
}

console.log("\n8 · banned vocabulary is absent");
for (const t of ["sufficient", "AI-proof", "AI-resistant", "cheat-proof", "confidence score"]) {
  ok(`"${t}" is absent`, !new RegExp(t.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"), "i").test(body));
}

console.log("\n9 · the feedback block asks one question, not two");
ok('"Would you bring another assessment?" is gone', !body.includes("Would you bring another"));
ok('"Was this worth the five minutes?" stays', body.includes("Was this worth the five minutes"));
ok("the return question is hidden on a first submission", !visible("fb-return-wrap"));

console.log("\n10 · the return question appears only after a real second submission");
const dom2 = new JSDOM(readFileSync(new URL("./index.html", base), "utf8"), {
  url: "https://thesovereign.academy/esa/review/?t=" + "b".repeat(32), runScripts: "outside-only", pretendToBeVisual: true,
});
const w2 = dom2.window;
const second = JSON.parse(JSON.stringify(payload));
second.review.submission_index = 2;
w2.fetch = async () => ({ ok: true, json: async () => second });
w2.scrollTo = () => {};
w2.eval(readFileSync(new URL("./esa.js", base), "utf8"));
await new Promise((r) => setTimeout(r, 400));
ok("on the second submission it is shown",
  !dom2.window.document.getElementById("fb-return-wrap").classList.contains("esa-hide"));
ok("and it asks what made her come back",
  dom2.window.document.body.textContent.includes("What made you want to check this one"));

console.log("\n11 · the strong-claim boundary is rendered, not dumped");
// The part a teacher reads without clicking anything.
const strongCollapsed = section("strong").split("<details")[0];
const strongDetails = (section("strong").split("<details")[1] || "");
const rawFirst = (payload.review.claims.find((c) => c.finding === "strong").does_not_support || [])[0] || "";
ok("a boundary sentence is shown", /Worth knowing: It does not/.test(strongCollapsed), strongCollapsed.match(/Worth knowing:[^<]*/)?.[0] || "");
ok("it is one short sentence", (strongCollapsed.match(/Worth knowing: ([^<]*)/) || ["", ""])[1].length <= 170);
ok("the raw stored entry is NOT dumped verbatim into the collapsed view", !strongCollapsed.includes(rawFirst));
ok("the engine's justification tail stays out of the collapsed view", !/since item 9 names the error/.test(strongCollapsed));
ok("but the full stored entry survives inside the evidence", strongDetails.includes(rawFirst));
// Scoped to the boundary sentence, which is what this renderer is responsible for. The paragraph
// above it is the engine's own `supports` field, rendered verbatim by design — see the note in
// plainOf(). It is NOT covered here, and at least one real record opens it with "Independent
// evidence that…", which is engine phrasing. That is a separate sentence and a separate decision.
const boundarySentence = (strongCollapsed.match(/Worth knowing: ([^<]*)/) || ["", ""])[1];
for (const t of ["does not support", "independent evidence", "claim component", "narrower inference", "adjacent claim", "verdict", "elicits"]) {
  ok(`"${t}" never reaches the boundary sentence`, !new RegExp(t, "i").test(boundarySentence));
}

console.log("\n11b · the opening sentence is plain, and prose never doubles its punctuation");
ok("the strong claim opens with 'This shows that'", /This shows that/.test(strongCollapsed));
ok("the engine's lead-in is gone", !/Independent evidence that/i.test(strongCollapsed));
// Every string the page COMPOSES, as opposed to the assessment text it quotes verbatim.
const composed = Array.prototype.map.call(
  d.querySelectorAll(".esa-finding__headline, .esa-finding__body, .esa-action__verb, .esa-action__line, .esa-details__body .ast-p, .esa-details__body li"),
  (el) => el.textContent,
);
const doubled = composed.filter((t) => /\.\./.test(t));
ok("no doubled full stop anywhere in composed prose", doubled.length === 0, doubled[0] || "");
ok("the coverage claim reads cleanly across the join",
  /selected\. So the results/.test(section("coverage_limited")), (section("coverage_limited").match(/selected[^<]{0,24}/) || [""])[0]);

console.log("\n12 · when no clean boundary exists, the line is omitted — never fudged");
const dom3 = new JSDOM(readFileSync(new URL("./index.html", base), "utf8"),
  { url: "https://thesovereign.academy/esa/review/?t=" + "c".repeat(32), runScripts: "outside-only", pretendToBeVisual: true });
const noBoundary = JSON.parse(JSON.stringify(payload));
const sc = noBoundary.review.claims.find((c) => c.finding === "strong");
sc.does_not_support = [
  "Does not support an independent evidence claim about that component.",
  "Adjacent claim it could be mistaken for: the weighting required in H4.",
];
dom3.window.fetch = async () => ({ ok: true, json: async () => noBoundary });
dom3.window.scrollTo = () => {};
dom3.window.eval(readFileSync(new URL("./esa.js", base), "utf8"));
await new Promise((r) => setTimeout(r, 400));
const h3 = dom3.window.document.getElementById("r-claims").innerHTML;
const s3 = (h3.split('data-finding="strong"')[1] || "").split("</section>")[0];
ok("no boundary line is rendered", !s3.split("<details")[0].includes("Worth knowing"));
ok("and the stored entries are still there in full", s3.split("<details")[1].includes("Adjacent claim it could be mistaken for"));

console.log(fails === 0 ? "\nALL DOM SMOKE TESTS PASS\n" : `\n${fails} FAILED\n`);
process.exit(fails === 0 ? 0 : 1);
