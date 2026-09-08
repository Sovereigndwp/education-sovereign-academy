/* Assignment Studio — shared client. No frameworks, no cookies, no PII in events. */
(function () {
  const SUPABASE_URL = "https://rdqwoqdvqpedlsbaghtr.supabase.co";
  // Publishable key: insert-only on ast_events under RLS (same contract as the Stress Test).
  const PUB_KEY = "sb_publishable_wppmprcDhDQ34qdO2Aqk4Q_dQQiejBq";
  const FN = SUPABASE_URL + "/functions/v1/as-studio";

  const params = new URLSearchParams(location.search);
  const channel = params.get("s") || params.get("c") || null;
  const pilotParam = params.get("pilot") || null;

  // Session id (per tab) for funnel events; teacher key (per browser) for repeat-use measurement. Both random.
  let sid = null;
  try {
    sid = sessionStorage.getItem("as_sid");
    if (!sid) { sid = Math.random().toString(36).slice(2) + Date.now().toString(36); sessionStorage.setItem("as_sid", sid); }
    if (channel) sessionStorage.setItem("as_channel", channel);
  } catch (_) { sid = "s" + Date.now().toString(36); }
  let storedChannel = channel;
  try { storedChannel = storedChannel || sessionStorage.getItem("as_channel"); } catch (_) {}

  function teacherKey() {
    try {
      let k = localStorage.getItem("as_teacher_key");
      if (!k) { k = "t_" + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2); localStorage.setItem("as_teacher_key", k); }
      return k;
    } catch (_) { return null; }
  }
  function pilotId() {
    try {
      if (pilotParam) localStorage.setItem("as_pilot", pilotParam);
      return pilotParam || localStorage.getItem("as_pilot") || null;
    } catch (_) { return pilotParam; }
  }
  function rememberToken(t, title) {
    try {
      const list = JSON.parse(localStorage.getItem("as_recent") || "[]").filter(function (r) { return r.t !== t; });
      list.unshift({ t: t, title: title || "", at: Date.now() });
      localStorage.setItem("as_recent", JSON.stringify(list.slice(0, 20)));
    } catch (_) {}
  }
  function recent() { try { return JSON.parse(localStorage.getItem("as_recent") || "[]"); } catch (_) { return []; } }

  function track(event, props, assignmentId) {
    try {
      const body = JSON.stringify({
        session_id: sid, event: "as_" + event, page: location.pathname, channel: storedChannel || null,
        submission_id: assignmentId || null, props: Object.assign({ pilot: pilotId() }, props || {}),
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

  // ── API ───────────────────────────────────────────────────────────────────
  function api(body) {
    return fetch(FN, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok && !j.error) j.error = "Request failed (" + r.status + ")"; return j; }); });
  }
  function upload(formData) {
    return fetch(FN, { method: "POST", body: formData })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok && !j.error) j.error = "Upload failed (" + r.status + ")"; return j; }); });
  }

  // ── Minimal Markdown → HTML (headings, lists, tables, bold/italic, blank lines) ──
  function inline(s) {
    s = esc(s);
    s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>").replace(/`([^`]+)`/g, "<code>$1</code>");
    s = s.replace(/_{4,}/g, '<span class="as-blank"></span>');
    return s;
  }
  function md(src) {
    const lines = String(src || "").replace(/\r/g, "").split("\n");
    let out = "", i = 0, list = null;
    function closeList() { if (list) { out += "</" + list + ">"; list = null; } }
    while (i < lines.length) {
      const L = lines[i];
      const h = /^(#{1,3})\s+(.*)$/.exec(L);
      const ul = /^\s*[-*•]\s+(.*)$/.exec(L);
      const ol = /^\s*(\d+)[.)]\s+(.*)$/.exec(L);
      if (/^\s*$/.test(L)) { closeList(); i++; continue; }
      if (h) { closeList(); out += "<h" + (h[1].length) + ">" + inline(h[2]) + "</h" + (h[1].length) + ">"; i++; continue; }
      if (/^\s*(-{3,}|\*{3,})\s*$/.test(L)) { closeList(); out += "<hr>"; i++; continue; }
      if (/^\s*\|/.test(L) && i + 1 < lines.length && /^\s*\|?\s*:?-{2,}/.test(lines[i + 1])) {
        closeList();
        const cells = function (r) { return r.replace(/^\s*\|/, "").replace(/\|\s*$/, "").split("|").map(function (c) { return c.trim(); }); };
        out += "<table><thead><tr>" + cells(L).map(function (c) { return "<th>" + inline(c) + "</th>"; }).join("") + "</tr></thead><tbody>";
        i += 2;
        while (i < lines.length && /^\s*\|/.test(lines[i])) { out += "<tr>" + cells(lines[i]).map(function (c) { return "<td>" + inline(c) + "</td>"; }).join("") + "</tr>"; i++; }
        out += "</tbody></table>"; continue;
      }
      if (/^\s*>/.test(L)) { closeList(); out += "<blockquote>" + inline(L.replace(/^\s*>\s?/, "")) + "</blockquote>"; i++; continue; }
      if (ul) { if (list !== "ul") { closeList(); out += "<ul>"; list = "ul"; } out += "<li>" + inline(ul[1]) + "</li>"; i++; continue; }
      if (ol) { if (list !== "ol") { closeList(); out += '<ol start="' + ol[1] + '">'; list = "ol"; } out += "<li>" + inline(ol[2]) + "</li>"; i++; continue; }
      closeList(); out += "<p>" + inline(L) + "</p>"; i++;
    }
    closeList();
    return out;
  }

  // ── Word export: a real .docx built by hand (JSZip), no docx library ─────
  function xml(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function runs(text) {
    // **bold** and *italic* → runs
    const parts = [];
    const re = /(\*\*[^*]+\*\*|\*[^*\n]+\*|_{4,})/g;
    let last = 0, m;
    while ((m = re.exec(text))) {
      if (m.index > last) parts.push({ t: text.slice(last, m.index) });
      const tok = m[0];
      if (tok.startsWith("**")) parts.push({ t: tok.slice(2, -2), b: true });
      else if (tok.startsWith("*")) parts.push({ t: tok.slice(1, -1), i: true });
      else parts.push({ t: "________________" });
      last = m.index + tok.length;
    }
    if (last < text.length) parts.push({ t: text.slice(last) });
    return parts.map(function (p) {
      return "<w:r><w:rPr>" + (p.b ? "<w:b/>" : "") + (p.i ? "<w:i/>" : "") + '</w:rPr><w:t xml:space="preserve">' + xml(p.t) + "</w:t></w:r>";
    }).join("");
  }
  function para(text, opts) {
    opts = opts || {};
    let pPr = "";
    if (opts.style) pPr += '<w:pStyle w:val="' + opts.style + '"/>';
    if (opts.numId) pPr += '<w:numPr><w:ilvl w:val="0"/><w:numId w:val="' + opts.numId + '"/></w:numPr>';
    if (opts.indent) pPr += '<w:ind w:left="' + opts.indent + '"/>';
    pPr += '<w:spacing w:after="120"/>';
    return "<w:p><w:pPr>" + pPr + "</w:pPr>" + runs(text) + "</w:p>";
  }
  function mdToDocxBody(src) {
    const lines = String(src || "").replace(/\r/g, "").split("\n");
    let body = "", i = 0;
    while (i < lines.length) {
      const L = lines[i];
      const h = /^(#{1,3})\s+(.*)$/.exec(L);
      const ul = /^\s*[-*•]\s+(.*)$/.exec(L);
      const ol = /^\s*(\d+)[.)]\s+(.*)$/.exec(L);
      if (/^\s*$/.test(L)) { i++; continue; }
      if (h) { body += para(h[2].replace(/\*\*/g, ""), { style: "Heading" + h[1].length }); i++; continue; }
      if (/^\s*<<<PAGEBREAK>>>\s*$/.test(L)) { body += '<w:p><w:r><w:br w:type="page"/></w:r></w:p>'; i++; continue; }
      if (/^\s*(-{3,}|\*{3,})\s*$/.test(L)) { body += para(""); i++; continue; }
      if (/^\s*\|/.test(L) && i + 1 < lines.length && /^\s*\|?\s*:?-{2,}/.test(lines[i + 1])) {
        const cells = function (r) { return r.replace(/^\s*\|/, "").replace(/\|\s*$/, "").split("|").map(function (c) { return c.trim(); }); };
        const rows = [cells(L)]; i += 2;
        while (i < lines.length && /^\s*\|/.test(lines[i])) { rows.push(cells(lines[i])); i++; }
        body += '<w:tbl><w:tblPr><w:tblStyle w:val="TableGrid"/><w:tblW w:w="0" w:type="auto"/><w:tblBorders>' +
          ["top", "left", "bottom", "right", "insideH", "insideV"].map(function (e) { return "<w:" + e + ' w:val="single" w:sz="4" w:space="0" w:color="999999"/>'; }).join("") +
          "</w:tblBorders></w:tblPr>" +
          rows.map(function (r, ri) { return "<w:tr>" + r.map(function (c) { return '<w:tc><w:tcPr><w:tcW w:w="0" w:type="auto"/></w:tcPr>' + para(ri === 0 ? "**" + c + "**" : c) + "</w:tc>"; }).join("") + "</w:tr>"; }).join("") +
          "</w:tbl>" + para("");
        continue;
      }
      if (/^\s*>/.test(L)) { body += para(L.replace(/^\s*>\s?/, ""), { indent: 720 }); i++; continue; }
      if (ul) { body += para(ul[1], { numId: 1 }); i++; continue; }
      if (ol) { body += para(ol[1] + ". " + ol[2], { indent: 360 }); i++; continue; }
      body += para(L); i++;
    }
    return body;
  }
  function buildDocx(markdown, title) {
    if (!window.JSZip) return Promise.reject(new Error("Word export library did not load."));
    const zip = new JSZip();
    zip.file("[Content_Types].xml", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/></Types>');
    zip.file("_rels/.rels", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>');
    zip.file("word/_rels/document.xml.rels", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/></Relationships>');
    zip.file("word/styles.xml", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/><w:sz w:val="22"/></w:rPr></w:rPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style><w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:before="240" w:after="120"/></w:pPr><w:rPr><w:b/><w:sz w:val="32"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:before="200" w:after="100"/></w:pPr><w:rPr><w:b/><w:sz w:val="26"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading3"><w:name w:val="heading 3"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:before="160" w:after="80"/></w:pPr><w:rPr><w:b/><w:sz w:val="23"/></w:rPr></w:style><w:style w:type="table" w:styleId="TableGrid"><w:name w:val="Table Grid"/><w:tblPr><w:tblCellMar><w:left w:w="80" w:type="dxa"/><w:right w:w="80" w:type="dxa"/></w:tblCellMar></w:tblPr></w:style></w:styles>');
    zip.file("word/numbering.xml", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:abstractNum w:abstractNumId="0"><w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="•"/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="720" w:hanging="360"/></w:pPr></w:lvl></w:abstractNum><w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num></w:numbering>');
    const body = (title ? para(title, { style: "Heading1" }) : "") + mdToDocxBody(markdown) +
      '<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1080" w:right="1080" w:bottom="1080" w:left="1080" w:header="720" w:footer="720" w:gutter="0"/></w:sectPr>';
    zip.file("word/document.xml", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>' + body + "</w:body></w:document>");
    return zip.generateAsync({ type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
  }
  /** Combine several versions into one .docx, one per page, with a one-line header each. */
  function buildSetDocx(parts, title) {
    var md = parts.map(function (p, i) { return (i ? "<<<PAGEBREAK>>>\n" : "") + "# " + p.label + (title ? " — " + title : "") + "\n\n" + p.text; }).join("\n\n");
    return buildDocx(md, "");
  }
  function download(blob, filename) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = filename; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }
  function safeName(s) { return String(s || "assignment").replace(/[^\w\- ]+/g, "").trim().replace(/\s+/g, "-").slice(0, 60) || "assignment"; }

  window.AS = {
    SUPABASE_URL, PUB_KEY, FN, sid, channel: storedChannel,
    teacherKey, pilotId, rememberToken, recent, track, esc, api, upload, md, buildDocx, buildSetDocx, download, safeName,
    MODE_LABEL: { support: "Support", advanced: "Advanced", visible: "Make Thinking More Visible" },
    STATUS_LABEL: { PRESERVED: "Preserved", ADAPTED_AS_PERMITTED: "Adapted as permitted", INTENTIONALLY_EXTENDED: "Intentionally extended", REVIEW_REQUIRED: "Review required" },
    FIELD_LABEL: { learning_target: "Learning target", required_thinking: "Required thinking", required_evidence: "Required evidence", teacher_constraints: "Teacher constraints", correctness: "Correctness" },
    fmtDate: function (iso) { try { return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }); } catch (_) { return iso || ""; } },
  };
})();
