from playwright.sync_api import sync_playwright
import os
foot='<div style="width:100%;font-size:7.5pt;color:#666;font-family:Helvetica,Arial,sans-serif;display:flex;justify-content:space-between;border-top:1px solid #ccc;padding-top:3pt;margin:0 0.65in"><span>AI-Era Evidence Pack · Algebra I: Linear Functions · Sample v0.1 · The Sovereign Academy · complimentary · student pages may be copied for classroom use</span><span>p. <span class="pageNumber"></span> / <span class="totalPages"></span></span></div>'
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page()
    pg.goto('file://'+os.path.abspath('06-EVIDENCE-PACK.html')); pg.wait_for_timeout(300)
    pg.pdf(path='06-EVIDENCE-PACK.pdf', format='Letter', print_background=True, prefer_css_page_size=True, display_header_footer=True, header_template='<span></span>', footer_template=foot)
    b.close()
