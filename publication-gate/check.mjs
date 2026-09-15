#!/usr/bin/env node
/* ESA Publication Gate — the automated half.
 *
 *   node publication-gate/check.mjs              all declared surfaces
 *   node publication-gate/check.mjs assignment-studio
 *
 * No dependencies. Reads the repo from disk; proves nothing about a deployment.
 * It deliberately does NOT try to judge whether a page looks right — see
 * ESA-PUBLICATION-GATE.md, section "The visual review".
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ESA_PROJECT = 'svrbfpjoufhhxdshwlvt';
const BSA_PROJECT = 'rdqwoqdvqpedlsbaghtr';
const HOMEPAGE = 'esa/index.html';

/* ── The manifest. This is the list of what ESA publishes. ─────────────── */
const SURFACES = {
  'esa-home': {
    title: 'ESA homepage',
    pages: ['esa/index.html'],
    publicPath: '/esa/',
    isHomepage: true,
    linkedFromHome: false,           // it IS the home
    backToEsaRequired: false,
  },
  'assignment-studio': {
    title: 'Assignment Studio',
    pages: ['assignment-studio/index.html', 'assignment-studio/studio/index.html'],
    publicPath: '/assignment-studio/',
    linkedFromHome: true,
    backToEsaRequired: true,
    ownStyles: ['assignment-studio/as.css'],
    rollback: {
      allowed: false,
      note: 'BSA project is the historical home of as-studio and stays as rollback, but no shipped browser file may reference it.',
    },
  },
  'assessment-review': {
    title: 'Assessment Review (invited pilot)',
    pages: ['esa/review/index.html'],
    publicPath: '/esa/review/',
    linkedFromHome: false,
    unlistedReason: 'Invite-gated pilot. noindex,nofollow; reachable only by invitation link. Owner ruling 2026-09-11.',
    backToEsaRequired: true,
    ownStyles: ['esa/review/esa.css'],
  },
};

/* ── Deliberately NOT published ────────────────────────────────────────────
   Kept in the repository, excluded from the deployment. The gate asserts the
   exclusion still holds: if one of these becomes reachable again, that is a FAIL,
   not a warning. Preservation is the point — nothing here is ever deleted or
   moved to solve a publication problem. */
const INTERNAL = {
  'esa-admin': {
    title: 'ESA pilot admin',
    files: ['esa/admin.html', 'esa/admin.js'],
    ruling:
      'Owner ruling 2026-09-15 (Option A): excluded from the deployment, source stays tracked. ' +
      'Administration is local-only. ESA_ADMIN_KEY remains the server-side security boundary; ' +
      'the admin endpoint is public either way. See publication-gate/HARDENING-BACKLOG.md.',
  },
  'research': {
    title: 'ESA research, prototypes and source material',
    files: ['research/'],
    ruling:
      'Institutional and product research stored in ESA, not ESA publications. Preservation is ' +
      'mandatory: serving boundary only, never deletion or relocation.',
  },
};

const BANNED_HEX = {
  '#C7CCD1': 'TSA silver — ESA must not hard-code the parent accent',
  '#FF9A00': 'BSA orange', '#FF7A00': 'BSA orange', '#FFD400': 'BSA gold',
  '#34D399': 'FSA mint', '#10B981': 'FSA emerald',
};
const SECRET_PATTERNS = [
  [/sbp_[A-Za-z0-9]{20,}/, 'Supabase access token'],
  [/service_role/i, 'service-role reference'],
  [/sk-ant-[A-Za-z0-9-]{20,}/, 'Anthropic API key'],
  [/\bAKIA[0-9A-Z]{16}\b/, 'AWS access key'],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, 'private key'],
];

let FAIL = 0, WARN = 0, PASS = 0;
const read = p => { try { return fs.readFileSync(path.join(ROOT, p), 'utf8'); } catch { return null; } };
const exists = p => fs.existsSync(path.join(ROOT, p));
const ok   = (id, m) => { PASS++; console.log(`  \x1b[32mPASS\x1b[0m ${id}  ${m}`); };
const bad  = (id, m) => { FAIL++; console.log(`  \x1b[31mFAIL\x1b[0m ${id}  ${m}`); };
const warn = (id, m) => { WARN++; console.log(`  \x1b[33mWARN\x1b[0m ${id}  ${m}`); };

function walkHtml(dir, acc = []) {
  for (const e of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
    const rel = path.posix.join(dir, e.name);
    if (e.isDirectory()) {
      if (['.git', 'node_modules'].includes(e.name)) continue;
      walkHtml(rel, acc);
    } else if (e.name.endsWith('.html')) acc.push(rel);
  }
  return acc;
}

function checkSurface(key, s) {
  console.log(`\n\x1b[1m${s.title}\x1b[0m  (${s.publicPath})`);
  const home = read(HOMEPAGE) || '';

  for (const page of s.pages) {
    const html = read(page);
    if (html === null) { bad('C5', `${page} — file missing`); continue; }
    const tag = `[${path.posix.basename(path.posix.dirname(page))}/${path.posix.basename(page)}]`;

    /* A1 — platform attribute */
    /<html[^>]*\sdata-platform=["']esa["']/.test(html)
      ? ok('A1', `${tag} data-platform="esa"`)
      : bad('A1', `${tag} <html> is missing data-platform="esa" — the page will render in TSA silver`);

    /* A2 — an ESA accent source is actually loaded */
    const sheets = [...html.matchAll(/<link[^>]+href=["']([^"']+\.css)["']/g)].map(m => m[1]);
    let esaSource = /\[data-platform=["']esa["']\]/.test(html) ? html : '';
    for (const href of sheets) {
      const local = href.startsWith('/') ? href.slice(1) : path.posix.join(path.posix.dirname(page), href);
      const css = read(local) || '';
      if (/\[data-platform=["']esa["']\]/.test(css)) esaSource += '\n' + css;
    }
    const defines = esaSource.length > 0;
    defines
      ? ok('A2', `${tag} an ESA accent source is loaded`)
      : bad('A2', `${tag} nothing binds the ESA blue — add <link rel="stylesheet" href="/css/esa-platform.css">`);
    sheets.some(h => /tsa-brand\.css/.test(h))
      ? ok('A2', `${tag} inherits the TSA foundation`)
      : warn('A2', `${tag} does not load tsa-brand.css`);

    /* A3 — no hard-coded sibling-brand hex, in the page or its own stylesheets */
    const bodies = [[page, html], ...(s.ownStyles || []).map(f => [f, read(f) || ''])];
    let hexHits = 0;
    for (const [f, body] of bodies)
      for (const [hex, why] of Object.entries(BANNED_HEX))
        if (new RegExp(hex, 'i').test(body)) { bad('A3', `${f} hard-codes ${hex} (${why})`); hexHits++; }
    if (!hexHits) ok('A3', `${tag} no hard-coded sibling-brand hex`);


    /* A8 — the silent-silver trap. A component whose colour comes from a token this
       page's ESA source never re-points will render in the TSA parent's silver, with
       nothing broken and no warning. That is exactly how Assignment Studio shipped
       looking like TSA. Check the pairs, not the whole token set: the homepage and
       Assessment Review each bind a deliberate subset, and that is fine while nothing
       on them consumes the unbound tokens. */
    const TRAPS = [
      ['fade-brand',  '--brand-solid', 'the gradient word accent'],
      ['tsa-hr-fade', '--tsa-fade-h',  'the fade rule'],
    ];
    let trapped = 0;
    for (const [cls, token, what] of TRAPS) {
      if (!new RegExp(`class=["'][^"']*\\b${cls}\\b`).test(html)) continue;
      new RegExp(`${token}\\s*:`).test(esaSource)
        ? ok('A8', `${tag} uses .${cls} and binds ${token}`)
        : (bad('A8', `${tag} uses .${cls} (${what}) but its ESA source never binds ${token} — it will render in TSA silver`), trapped++);
    }
    if (!trapped) ok('A8', `${tag} no unbound accent tokens in use`);
    /* B2 — route back to ESA */
    if (s.backToEsaRequired) {
      /href=["']\/esa\/?["']/.test(html)
        ? ok('B2', `${tag} has a route back to /esa/`)
        : bad('B2', `${tag} has no link back to /esa/ — a teacher who lands here cannot get to the academy`);
    }

    /* B5 — TSA parent still reachable */
    /thesovereign\.academy/.test(html)
      ? ok('B5', `${tag} TSA parent link present`)
      : warn('B5', `${tag} no link to the TSA parent`);

    /* C2/C3 — backend routing */
    const refs = [...html.matchAll(/([a-z]{20})\.supabase\.co/g)].map(m => m[1]);
    for (const js of [...html.matchAll(/<script[^>]+src=["'](\/[^"']+\.js)["']/g)].map(m => m[1].slice(1))) {
      const body = read(js) || '';
      refs.push(...[...body.matchAll(/([a-z]{20})\.supabase\.co/g)].map(m => m[1]));
    }
    const uniq = [...new Set(refs)];
    if (uniq.length) {
      uniq.every(r => r === ESA_PROJECT)
        ? ok('C2', `${tag} backend → ESA project ${ESA_PROJECT}`)
        : uniq.includes(BSA_PROJECT) && s.rollback?.allowed
          ? warn('C3', `${tag} references BSA project (declared rollback: ${s.rollback.note})`)
          : bad('C3', `${tag} references a non-ESA Supabase project: ${uniq.filter(r => r !== ESA_PROJECT).join(', ')}`);
    }

    /* C4 — secrets */
    let leaked = 0;
    for (const [f, body] of bodies)
      for (const [re, what] of SECRET_PATTERNS)
        if (re.test(body)) { bad('C4', `${f} appears to contain a ${what}`); leaked++; }
    if (!leaked) ok('C4', `${tag} no secret-shaped strings`);

    /* C5 — local assets resolve */
    const assets = [...html.matchAll(/(?:href|src)=["'](\/[^"'#?]+\.(?:css|js|png|svg|jpg|webp|ico))["']/g)].map(m => m[1].slice(1));
    const missing = assets.filter(a => !exists(a));
    missing.length
      ? bad('C5', `${tag} missing assets: ${missing.join(', ')}`)
      : ok('C5', `${tag} all ${assets.length} local assets resolve`);

    /* D1 — responsive declared */
    /<meta[^>]+name=["']viewport["']/.test(html)
      ? ok('D1', `${tag} viewport declared`)
      : bad('D1', `${tag} no viewport meta — mobile will render at desktop width`);

    /* metadata */
    /<title>[^<]{10,}<\/title>/.test(html) && /<meta[^>]+name=["']description["']/.test(html)
      ? ok('D5', `${tag} has a title and description`)
      : warn('D5', `${tag} thin or missing title/description`);
  }

  /* C9 — an unresolved owner decision on a published surface is a FAIL.
     It is not downgraded to a warning to make a run look green. */
  if (s.openDecision) bad('C9', `owner decision OPEN — ${s.openDecision}`);

  /* B1 — discoverable from the ESA homepage */
  if (s.linkedFromHome) {
    const linked = new RegExp(`href=["']${s.publicPath.replace(/\//g, '\\/')}`).test(home);
    linked
      ? ok('B1', `linked from the ESA homepage`)
      : bad('B1', `NOT linked from the ESA homepage — ${s.publicPath} is a public tool nobody can find`);
  } else if (s.unlistedReason) {
    ok('B1', `intentionally unlisted — ${s.unlistedReason}`);
    if (!s.pages.every(p => /noindex/.test(read(p) || '')))
      bad('B1', `declared unlisted but not every page carries noindex`);
  }
}

/* ── B3 · the serving boundary ─────────────────────────────────────────── */
function ignoreRules() {
  const raw = read('.vercelignore');
  return raw === null ? null : raw.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
}
function isExcluded(file, rules) {
  return !rules ? false : rules.some(r =>
    r.endsWith('/') ? file.startsWith(r) : (r === file || file.startsWith(r + '/')));
}
function walkFiles(dir, re, acc = []) {
  for (const e of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
    const rel = path.posix.join(dir, e.name).replace(/^\.\//, '');
    if (e.isDirectory()) { if (['.git', 'node_modules'].includes(e.name)) continue; walkFiles(rel, re, acc); }
    else if (re.test(e.name)) acc.push(rel);
  }
  return acc;
}

function servingBoundary() {
  console.log(`\n\x1b[1mServing boundary\x1b[0m  (what the deployment publishes, vs what the repo keeps)`);
  const rules = ignoreRules();
  if (!rules) {
    bad('B3', '.vercelignore missing — Vercel serves this repo statically, so every committed file is public');
    return;
  }
  ok('B3', `.vercelignore present — ${rules.length} exclusion rules`);

  /* Nothing a published surface needs may be excluded. */
  const needed = Object.values(SURFACES).flatMap(s => [...s.pages, ...(s.ownStyles || [])]);
  const broken = needed.filter(f => isExcluded(f, rules));
  broken.length
    ? bad('B3', `the boundary excludes files a published surface needs: ${broken.join(', ')}`)
    : ok('B3', `no published surface is cut off by the boundary`);

  /* Every .html that would be served must be a declared surface. */
  const declared = new Set(Object.values(SURFACES).flatMap(s => s.pages));
  const kept = [], undeclared = [];
  for (const f of walkHtml('.').map(p => p.replace(/^\.\//, ''))) {
    if (declared.has(f)) continue;
    (isExcluded(f, rules) ? kept : undeclared).push(f);
  }
  undeclared.length
    ? bad('B3', `${undeclared.length} page(s) would be served but are not declared surfaces:\n         ${undeclared.join('\n         ')}`)
    : ok('B3', `no orphan public pages — every served .html is a declared surface`);
  if (kept.length) ok('B3', `${kept.length} page(s) kept in the repo and not published (research, prototypes, tooling)`);

  /* Every deliberately-unpublished surface must still be excluded. */
  for (const [k, i] of Object.entries(INTERNAL)) {
    const leaked = i.files.filter(f => !isExcluded(f, rules));
    leaked.length
      ? bad('B3', `${i.title} is declared internal but WOULD BE SERVED: ${leaked.join(', ')}`)
      : ok('B3', `${i.title} — excluded as ruled (${i.files.join(', ')})`);
    const gone = i.files.filter(f => !exists(f));
    gone.length
      ? bad('B3', `${i.title} — source missing from the repo, which is a preservation failure: ${gone.join(', ')}`)
      : ok('B3', `${i.title} — source preserved in the repo`);
  }

  /* Source and documentation should not be served either. */
  const leaks = walkFiles('.', /\.(md|mjs|sql|ts)$/).filter(f => !isExcluded(f, rules));
  leaks.length
    ? warn('B3', `${leaks.length} source/doc file(s) still served: ${leaks.slice(0, 6).join(', ')}${leaks.length > 6 ? ' …' : ''}`)
    : ok('B3', `no source or documentation files served`);

  console.log(`
  \x1b[33mC8 — NOT PROVEN BY THIS SCRIPT.\x1b[0m .vercelignore is applied by Vercel at deploy
  time; all this script did was read the file. After the next deploy, confirm these
  return 404 — until then the boundary is intended, not verified:
      /research/TEACHER-WORK-MAP.html
      /esa/admin.html
      /CLAUDE.md
      /assignment-studio/README.md`);
}

/* ── run ───────────────────────────────────────────────────────────────── */
const only = process.argv[2];
if (only && !SURFACES[only]) {
  console.error(`Unknown surface "${only}". Known: ${Object.keys(SURFACES).join(', ')}`);
  process.exit(2);
}
console.log('\x1b[1mESA Publication Gate — automated checks\x1b[0m');
for (const [k, s] of Object.entries(SURFACES)) if (!only || k === only) checkSurface(k, s);
if (!only) servingBoundary();

console.log(`\n${'─'.repeat(72)}`);
console.log(`  ${PASS} pass · ${WARN} warn · ${FAIL} fail`);
console.log(`
  \x1b[1mThe script is only half the gate.\x1b[0m Nothing above looked at the page.
  Before calling this published, do the visual review in
  publication-gate/ESA-PUBLICATION-GATE.md — on the deployed URL.
  Checks A4-A7, B1 placement, C6, D1-D5 are NOT covered by anything above.`);
process.exit(FAIL ? 1 : 0);
