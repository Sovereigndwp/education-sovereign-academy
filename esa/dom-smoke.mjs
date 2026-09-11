// DOM smoke test — loads the SHIPPED esa/index.html + esa/esa.js, stubs fetch with a real review
// payload from the verified run, and checks that a teacher actually sees the right thing.
import { readFileSync } from "node:fs";
import { JSDOM } from "/tmp/node_modules/jsdom/lib/api.js";

const payload = JSON.parse(readFileSync("/tmp/review.json", "utf8"));
let fails = 0;
const ok = (n, c, extra = "") => { if (!c) fails++; console.log(`  ${c ? "PASS" : "FAIL"}  ${n}${extra ? "   " + extra : ""}`); };

const dom = new JSDOM(readFileSync("/tmp/index.html", "utf8"), {
  url: "https://thesovereign.academy/esa/?t=" + "a".repeat(32),
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
w.eval(readFileSync("/tmp/esa.js", "utf8"));

await new Promise((r) => setTimeout(r, 400));
const d = w.document;
const html = d.getElementById("r-claims").innerHTML;
const visible = (id) => !d.getElementById(id).classList.contains("esa-hide");

console.log("\n1 · the flow lands on the review");
ok("screen 4 is showing", visible("s-4"));
ok("the waiting screen is hidden", !visible("s-wait"));
ok("the title rendered", d.getElementById("r-title").textContent.includes("Fractions"));

console.log("\n2 · three findings, said three different ways");
ok("a strong finding rendered", html.includes('data-finding="strong"'));
ok("a coverage limitation rendered", html.includes('data-finding="coverage_limited"'));
ok("a conditions limitation rendered", html.includes('data-finding="conditions_limited"'));
ok("the strong one says leave it alone", html.includes("I would not change it"));
ok("the conditions one says the assessment does not change", html.includes("The assessment does not change"));
ok("the coverage one offers a single changed item", html.includes("One item, changed"));

console.log("\n3 · the verdict word never reaches the teacher");
const body = d.body.textContent;
for (const w2 of ["NOT_SUPPORTED", "NOT SUPPORTED", "LIMITED ", "KEEP", "NO_CHEAP_CHECK"]) {
  ok(`"${w2.trim()}" is absent from the page`, !body.includes(w2));
}

console.log("\n4 · banned vocabulary is absent");
for (const w2 of ["sufficient", "AI-proof", "AI-resistant", "cheat-proof", "confidence score"]) {
  ok(`"${w2}" is absent`, !new RegExp(w2.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"), "i").test(body));
}

console.log("\n5 · the conditions branch shows the boundary, not a rewrite");
ok("an inference boundary sentence is shown", /do not support|cannot|does not support/i.test(html));
ok("no item-swap block on the conditions claim",
  (html.split('data-finding="conditions_limited"')[1] || "").split("</section>")[0].indexOf("esa-swap") === -1);

console.log("\n6 · component maps render, verbless entries do not");
ok("component rows rendered", (html.match(/class="esa-comp"/g) || []).length >= 1);
ok("component states read as English, not schema", html.includes("Asked for") || html.includes("Not asked"));

console.log(fails === 0 ? "\nALL DOM SMOKE TESTS PASS\n" : `\n${fails} FAILED\n`);
process.exit(fails === 0 ? 0 : 1);
