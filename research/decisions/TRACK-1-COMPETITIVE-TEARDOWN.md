# Track 1 — Competitive / Demand Teardown (deepened)

The Sovereign Academy · Assessment Stress Test · 2026-09-04
Analysis only. No software built, no outreach sent. Builds on CONTEXT.md; evidence already listed there is not re-researched.

Every claim below is tagged **[OBSERVED]** (fetched from a cited page on 2026-09-04) or **[MODELED]** (my inference). Reddit is blocked at the network layer in this environment (HTTP 403 on every reddit.com request), so item 4 draws on press interviews, teacher Substacks and blog comment threads, a Substack analysis of 415 Reddit posts, and the Learning First survey open responses. That is a real limitation and I say so again in item 4.

---

## Honest summary (≤300 words)

The whitespace is narrower than the plan assumes, and the moat is not where the plan puts it.

**What I verified.** Turnitin Clarity is real, shipping, and already in secondary schools (nearly 100 secondary schools/districts piloted in its first 60 days; a Google Classroom add-on since May 2026; "Multipart Assignments" checkpoints since August 2026). But it is structurally a *writing-submission* instrument: students must compose inside its editor, it is "well-suited for all types of writing assignments," and it cannot see a math problem set, a lab, or a project. It never touches the assignment itself. That boundary is solid.

**What I could not verify as whitespace.** "AI-resistant assignment" advice at the assignment level already exists as free generative features: MagicSchool ships "AI-Resistant Assignment Suggestions" and a "Multi-Step Assignment Generator"; CK-12 has a free "AI-Resistant Assignment Generator." They are generic, unreviewed, and make no preservation claim — but a C&I director cannot tell the difference from a brochure. Our free deliverable is competing against $0 generators, not against nothing.

**The uncomfortable finding.** Learning First's May 2026 report (the source of the 40%/14% figures) now explicitly recommends that schools "map assessment tasks across subjects/year levels to identify vulnerability levels." That is our Stage 4 product, stated by a think tank as a school-leader to-do. Good for demand; it also means Solution Tree, McTighe, and AI for Education will sell it within a year using relationships we do not have.

**Buyer reality.** A $6–15k department engagement sits under the federal micro-purchase threshold ($15,000 since Oct 2025) and under most district board thresholds; professional services are often bid-exempt. That is a signature-and-PO purchase, not a procurement. The window that matters is Sept–Jan planning and the June PO spike.

**Recommendation.** Keep the direction. Change what we think the moat is: not "assignment-level," which is copyable, but *human-reviewed judgment plus the preservation claim plus the run-cost estimate*, delivered through the PD budget line. And reopen the math wedge (see final section).

---

## 1 · Turnitin "learning integrity" / Clarity — teardown

### What it actually is today [OBSERVED]

| Dimension | Finding | Source |
|---|---|---|
| Product | Turnitin Clarity: a paid add-on to Feedback Studio; "works alongside Turnitin Originality." Captures "students' entire drafting process, including pasted text, writing time, construction time, and draft history." Includes an optional AI writing assistant that "gives students real-time feedback, but will not write for them." | turnitin.com/products/feedback-studio/clarity; turnitin.com/blog/what-is-learning-integrity |
| Framework | "Learning integrity" = "a proactive framework… that prioritizes the integrity of the process of learning over the final product." Marketing frame, not a product. The page contains no mention of K-12 and no discussion of helping teachers redesign assignments. | turnitin.com/blog/what-is-learning-integrity |
| Hard requirement on students | "all writing, revision, and editing must be completed within the writing space." Work done outside the editor is not tracked. No offline editing; no peer collaboration; internet required. | guides.turnitin.com FAQs for Instructors |
| Assignment scope | "well-suited for all types of writing assignments, including essays, reflections, and research papers." Nothing for math, labs, problem sets, projects, presentations. | same |
| Institutional requirements | Paid add-on, priced through an account manager; "For the optimal experience, we recommend… Feedback Studio via an LTI 1.3 integration." | guides.turnitin.com FAQs for administrators |
| K-12 route | Google Classroom add-on launched May 12, 2026 (post closed beta), bundling Feedback Studio, AI detection, Standard Assignment and the Clarity Student Writing assignment. **Requires the institution to hold Google Workspace for Education Plus.** | turnitin.com/press/turnitin-announces-google-classroom-add-on… |
| K-12 traction | "Nearly 100 secondary schools/districts launched Turnitin Clarity pilots in the first 60 days of availability" (press release Sept 24, 2025). | turnitin.com/press/secondary-education-leads-in-prioritizing-ai-literacy |
| Per-assignment AI settings (May 27, 2026) | Instructors toggle four assistance areas (planning/ideas, illustrative examples, revisions, proofreading) and three reading levels "during assignment setup." Instructors can "preview examples of the AI guidance and prompts students will experience before officially publishing an assignment." | turnitin.com/blog/ai-your-way… |
| Multipart Assignments (Aug 6, 2026) | Link Feedback Studio and Clarity assignments into "structured checkpoints that fit your instructional goals." | guides.turnitin.com Turnitin product updates |
| Data they publish | 15% of essay submissions (Oct 2025–Feb 2026) contained >80% AI-generated text, up from 3% baseline (Apr–Aug 2023). | turnitin.com/press/turnitin-data-shows-transparency… |
| Assignment-design content | An ebook "Building AI-ready assignments: A practical guide to responsible AI use" exists in search indexes; the URL returned 404 on fetch. Content marketing, not a product. | turnitin.com/ebooks/… (404) |

### Announced vs. shipping [OBSERVED]
Everything above is shipping. I found no announced-but-unshipped assignment-design or assignment-audit capability in the 2026 release notes. The 2026 Clarity updates are editor features (pagination, citations, 19 languages, mobile) plus the two structural moves that matter to us: per-assignment AI configuration and multipart checkpoints.

### Where an assignment-level audit is precisely outside Clarity [OBSERVED boundary, MODELED implication]

1. **Unit of analysis.** Clarity instruments the *submission process*; it has no representation of what the task was trying to measure and no way to say whether the task still measures it. A student who produces a full draft-history inside Clarity while reasoning entirely in a second ChatGPT window produces a clean Writing Report. [OBSERVED: what it captures; MODELED: the evasion.]
2. **Subject boundary.** Writing only. Secondary math, science, CS, art and any project-based task are outside it. This is the single cleanest boundary and it maps exactly onto the math wedge. [OBSERVED]
3. **Precondition stack.** Feedback Studio contract → Clarity add-on → LTI 1.3 or Workspace for Education Plus → students composing in-editor. Any teacher whose school lacks one link in that chain has nothing. Our audit needs none of them. [OBSERVED preconditions; MODELED that this is a meaningful share of secondary teachers — I did not find a Workspace-Plus penetration figure.]
4. **Direction of travel.** Multipart Assignments + per-assignment AI settings mean Turnitin is moving *toward* "the teacher designs the process in our tool." The next logical step is a "suggest checkpoints for this assignment" feature. That is a threat, not to the audit's validity, but to the *verification mechanism* half of our deliverable — see item 6. [MODELED]

---

## 2 · Brisk Curriculum Intelligence and MagicSchool district tier

### Brisk [OBSERVED]
- Curriculum Intelligence: "AI that uses your adopted curriculum and instructional philosophy as a starting point for everything it creates," anchored to adopted curricula, instructional philosophy, and scope/sequence/pacing; "Brisk Ready Curricula" aligned to major ELA, math, science and social studies programs. "Live for Back to School 2026." Powers 30+ tools including quiz generator, rubric generator, batch feedback. Leaders get "visibility into how curriculum is being applied across classrooms." No assessment-validity, AI-use policy, or assignment-audit feature on the page. (briskteaching.com/curriculum-intelligence; briskteaching.com/post/brisk-announces-curriculum-intelligence-for-back-to-school-2026)
- **Inspect Writing** (existing, free tier): "a video-style replay of a student's writing process from first draft to final version. See what they added, deleted, or pasted in." Works in Google Docs via the Chrome extension. (briskteaching.com/inspect-writing) — i.e. Brisk already ships the cheap version of process evidence, for free, with no LMS contract.
- Funding: $15M (Apr 2025, EdWeek Market Brief). District pricing quote-based; free educator tier. (marketbrief.edweek.org; edusageai.com)

### MagicSchool [OBSERVED]
- Enterprise tier ("Custom") includes SSO, "Full SIS/LMS Integration (Clever, ClassLink, Canvas, Schoology)," "Enterprise Custom Tools," "Tool management controls and guardrails," "Advanced data dashboards," and — critically — "Dedicated customer service manager and professional development," "White-Glove Onboarding," and "Professional Services (additional cost)." (magicschool.ai/pricing)
- **"AI-Resistant Assignment Suggestions"** is an existing tool (listed in TCEA's tool roundup; MagicSchool's own May 8, 2025 post "Make your assignments AI-resistant this year" describes input = "assignment criteria and specifications," output = "suggestions for redesigning assignments to be more challenging for AI chatbots," alongside a "Multi-Step Assignment Generator"). Their framing: "AI detection is a false promise." (blog.tcea.org/magicschool; magicschool.ai/blog-posts/make-your-assignments-ai-resistant-this-year)
- Scale: 6M+ educators, 10,000+ schools; $45M Series B on Aug 5, 2026 ($63M total). Analysts name conversion of the free base into "paid district-level contracts" as the metric to watch. (valueaddvc.com)
- April 2026 updates: quiz control, student-thread export, admin moderation, district branding. Nothing on assessment validity. (magicschool.ai/blog-posts/whats-new-april-2026)
- Adjacent free tools: CK-12 "AI-Resistant Assignment Generator" (inputs: subject, type, grade, description; outputs strategy suggestions like "passion projects with checkpoints"; "always free"). Musely offers a similar generator. (info.ck12.org/teacher-tools/ai-resistant-assignment-generator)

### Can either add assessment-validity auditing as a feature, and how fast? [MODELED]

| Layer of our deliverable | Does an incumbent already have it? | Time for them to ship a credible version |
|---|---|---|
| Generic "make this harder for AI" suggestions | **Yes** — MagicSchool, CK-12, Musely | Already shipped |
| Objective reconstruction ("what this task is trying to measure") grounded in the district's actual standards/pacing | Brisk CI has the grounding; nobody surfaces it as an audit | Weeks — it is a prompt over data they already hold |
| Three-band substitution judgment with the task element cited | No | Weeks to prototype; the hard part is not building it, it is *not* turning it into a score (they will) |
| Preservation claim ("what did not change," auditable by the teacher) | No | Months — requires a cognitive-demand model per subject; easy to fake, hard to make true |
| Human review, teacher ownership, no-school-sharing guarantee | No — and their Enterprise value proposition is *leader visibility*, the opposite | Not in their model |
| Department "share of assessments requiring observable reasoning," re-measured per term | No | Brisk CI's "leaders get visibility into how curriculum is being applied" is one report away from this |

Bottom line: the *software* version of our audit is 1–3 months of work for either company and both have the distribution to make it free. What they will not do is put a named human's judgment behind each audit, guarantee the teacher owns it, or sell it as a PD outcome. That is the whole defensible surface, and it is a service surface, which is consistent with locked decision 5.

---

## 3 · Buyer map — who signs, thresholds, cycle length

### Budget lines and signers

| Budget line | Who owns it | Who signs a $6–15k engagement | Evidence |
|---|---|---|---|
| Title II-A | District federal-programs director / Title coordinator prepares the consolidated application; PD content is chosen by the C&I director / assistant superintendent for instruction | Asst. supt. or superintendent signature on a PO; often a consent-agenda item, rarely a discussion item | [OBSERVED] Title II-A "activities may be carried out through a grant or contract with a for-profit or non-profit entity" (CDE Colorado). Funds "made available on July 1" with a 27-month obligation window (15 months + 12-month Tydings extension); 100% carryover allowed (Oregon ODE). FY26 level-funded at $2.19B (Learning Forward, Jan 20 2026). [MODELED] title of the signer varies by district size; in districts under ~5k students the superintendent signs personally. |
| Building PD / principal discretionary | Principal | Principal, within building budget | [MODELED] I could not fetch EdWeek's principal buying-power survey (robots-blocked). Treat "principal can authorize under ~$5k" as unverified. |
| Curriculum services | C&I director | Same as Title II-A when Title II-funded; general fund otherwise | [OBSERVED] Solution Tree's $236,862 College Station ISD contract (Oct 21 2025) was Title II-funded; the district said ~97% of its Solution Tree spend since 2002 came from federal sources. |
| Assessment platforms | Assessment & accountability office + IT/CTO gatekeeping for data privacy | Board, because these are multi-year software with student data | [OBSERVED] CTO/IT director is "technical gatekeeper" evaluating FERPA/COPPA (civiciq.com guide). Not our path. |

### Approval thresholds [OBSERVED, three real district policies + federal rule]

- **Federal micro-purchase threshold: $15,000** (raised from $10,000 effective Oct 1, 2025); simplified acquisition threshold $350,000. Under the micro-purchase threshold, federally funded purchases can be made without soliciting competitive quotes if the price is reasonable. (mrsc.org, Nov 2025)
- **Union Public Schools (OK):** superintendent/CFO may issue POs "for less than $100,000 without prior Board approval"; $0–10,000 informal quotes recommended; "contracted professional and technical services" **exempt from competitive bidding** regardless of amount. (unionps.org policy 3010)
- **Northbrook D27 (IL):** budgeted services purchasable by superintendent without further approval; written quotes solicited above $25,000; state bid law above $35,000; "all contracts require Board approval" (as a routine agenda item). (nb27.org policy 4:60)
- Iowa policies returned in search (Mid-Prairie, Maquoketa Valley, Red Oak) follow the same shape — not fetched, not relied on.

**Implication [MODELED]:** a $6–15k department sprint sits under the federal micro-purchase line and under every local quote threshold I found. It is a *signature purchase*, typically one asst.-superintendent approval plus a PO, and at most a consent-agenda line. That is the strongest structural fact in this teardown and it is why the PD line is the right door. It also means the ceiling is real: above ~$25k we start triggering quotes; above ~$35–50k in many states we trigger bids or a real board vote.

### Cycle length

- [OBSERVED] Software vendors report 12–18 months for new district relationships, 3–6 months for renewals/expansions, 30–60 days when on a cooperative contract. Fiscal year July 1–June 30; "September through January is when departments identify needs and budget is shaped"; PO volume "spikes 4–5x in June." (civiciq.com guide, 2026)
- [MODELED] For a sub-$15k PD engagement with an already-budgeted PD line and a department chair champion: **4–10 weeks** from first conversation to PO if the ask lands inside a planned in-service slot; **one budget cycle (6–9 months)** if it has to be written into next year's Title II plan. Summer institutes are booked by March–April. Our realistic first paid engagements are therefore January–June 2027 in-service days funded from FY26 carryover (allowed at 100%) or building PD, not Title II 2027-28 plans.

### Who the champion is [MODELED, consistent with the plan]
The department chair does not sign but is the only person who can vouch for the artifact's quality to the person who does. Every paid path runs chair → C&I director. The C&I director's buying condition, per CONTEXT.md, is "measurable instructional outcomes" — the before/after assessment map is the evidence, and the Learning First recommendation (item 4) is the citation that legitimizes it.

---

## 4 · Teacher language — complaints and workarounds in their own words

Constraint stated up front: reddit.com is 403-blocked from this environment (verified with both WebFetch and curl through the proxy). Below are 19 verbatim quotes from teachers and instructors, with links. Where the speaker is higher-ed, it is labelled. Quotes are grouped by what they tell us the product must say.

### "I can't trust the artifact anymore" (validity, in teacher words)

1. **Sara Falls, high-school English teacher:** "You become a paranoid person. You distrust every single thing your students give you." — [Chalkbeat, Nov 2025](https://www.chalkbeat.org/2025/11/04/three-theories-on-ai-in-schools-about-cheating-teaching-and-tutoring/)
2. **Craig Barton, maths teacher/author (UK):** "The reliability of assessing understanding outside of the classroom, whether homework, assignment, or past exam paper, is now zero." — [Eedi Substack](https://eedi.substack.com/p/is-maths-homework-dead)
3. **Craig Barton:** "Students who can't be bothered doing their homework but don't want to get in trouble can take pictures of the questions, send them to ChatGPT, copy the working out, and score full marks." — same
4. **Ashley Kannan, 8th-grade U.S. history, Oak Park IL:** "The war is over — we've lost." and homework has become "a race to see who can plagiarize and cheat the best." — [The 74](https://www.the74million.org/article/homework-artificial-intelligence-cheating/)
5. **Al Rabanera, high-school math, La Vista HS, Fullerton CA (to his students):** "I'm not going to pretend like you aren't [using AI]. I know it's readily available for most of you, if not all of you." — same
6. **Secondary teacher, NSW (Learning First survey, n≈3,400):** "Students' expectation is to offload close to 100% of their own cognitive effort." — [Learning First, May 2026](https://learningfirst.com/research/aiuseinschools)
7. **Secondary teacher, NSW:** "They don't develop [thinking process], they just arrive at a conclusion. [AI] is not helping them be thinkers." — same
8. **Panos Ipeirotis, NYU Stern (higher ed):** "I don't trust written assignments anymore to be the result of actual thinking." — [Fortune, Mar 2026](https://fortune.com/2026/03/25/oral-exams-colleges-anti-ai-teaching-method-gen-z-stare/)
9. **NCSM session title, Feb 2026 (Chadd McGlone):** "When Good Work Stops Being Evidence: Rethinking Assessment in an AI World." — [NCSM AI Virtual Summit](https://www.mathedleadership.org/ai-virtual-summit/) — this is the best six-word statement of our problem I found, and it came from the math-supervisor community.

### The workaround: pull everything in-class, and pay for it

10. **Laura Stebbins, teacher (comment):** "I finally just got to a point where all the work has to be done in the classroom to ensure that they are the ones doing it." — [Cult of Pedagogy comments](https://www.cultofpedagogy.com/ai-integrity/)
11. **David Cutler, high-school history/government/journalism, Brimmer and May (MA):** "I'm done assigning large take-home papers. The tech is too advanced, too easy to use and too aggressively marketed." — [PBS NewsHour Classroom, Oct 2025](https://www.pbs.org/newshour/classroom/classroom-voices/educator-voices/2025/10/generative-ai-has-no-place-in-my-classroom)
12. **David Cutler (the cost, in his words):** "Something will have to give; with more time devoted to writing in class, I may cover less content." — same
13. **Anne Flaherty, maths teacher (comment):** in-class quiz feedback "is better than marking work parents, tutors or ai has done." — [Eedi Substack comments](https://eedi.substack.com/p/is-maths-homework-dead)
14. **Ryan Y, maths teacher (comment):** "When students copy work from technology, the work usually just has a different look to it than the way that we did the problems in class." — same (note: this is the informal detection heuristic teachers actually use; it is the thing the audit replaces)
15. **Jess League (comment):** "It's easier to copy and paste from AI and take the chance that the teacher will overlook it, especially since it is difficult for teachers to prove it." — Cult of Pedagogy comments

### Teachers who have started redesigning, and the principle they use

16. **Sarah Carr, LIEP department chair, Henrico County (VA):** "For writing assignments in particular, the process *is* the product." and "If a student believes the linguistic output is far out of their range, they will default to LLMs." — [EdWeek, May 2026](https://www.edweek.org/technology/opinion-what-in-the-chatgpt-is-this-how-el-teachers-are-navigating-ai-use/2026/05) — the second sentence is a design rule about *cognitive-demand fit*, not AI-resistance, and it is exactly the tone rule in the plan.
17. **Cherie Shields, high-school English, Oregon:** "We need to kind of move away from the standard five-paragraph essay response and we need to do something a lot more imaginative to get our students to respond." — [NEA Today](https://www.nea.org/nea-today/all-news-articles/chatgpt-enters-classroom-teachers-weigh-pros-and-cons)
18. **Josh Brake, engineering professor (higher ed):** "If you can pivot your long-form essay to an in-class writing assignment without substantially changing it, I'd question whether it was a well-designed assessment in the first place." and "we would be much better off spending our time revising our assignments." — [Substack](https://joshbrake.substack.com/p/blue-books-and-oral-exams-are-not-the-answer)
19. **Risa Morimoto, SOAS (higher ed) — the workload line:** "AI is supposed to help us work efficiently, but my workload has skyrocketed because of it. I have to spend lots of time figuring out whether the work students are handing in was really written by them." — [The Cheat Sheet](https://thecheatsheet.substack.com/p/375-professor-ai-has-made-my-workload)

### Aggregate signal from Reddit, second-hand [OBSERVED via a secondary analysis]
A Substack author coded 415 Reddit posts on AI in schools: 76% of emotionally significant keywords were negative or uncertain; top themes concern (13.5%), confusion (9.4%), skepticism (8.6%). Teacher complaints they paraphrase include a "circular (and insane) policy: if students use ChatGPT to write papers, teachers are expected to use ChatGPT to evaluate and provide feedback," and that teachers "lack the tools, funding, support, and authority needed to establish meaningful safeguards around AI use." — [wonderingaboutai.substack.com](https://wonderingaboutai.substack.com/p/i-analyzed-415-reddit-posts-about) (author states quotes are paraphrased for Reddit TOS; treat as thematic, not verbatim.)

### What the language tells us [MODELED]
- Teachers do not say "validity." They say *trust, prove, paranoid, evidence, look different from class.* The audit should use "evidence" and "what this still proves," never "validity" or "AI-resistant."
- The workaround (all in-class) is described as a *defeat* ("finally just got to a point," "I'm done," "something will have to give"), not a solution. That is our opening — but note the workaround costs teachers *content coverage*, not grading time. The plan's stated risk (redesign adds review minutes) is real, but the cost teachers name first is *class minutes*. The run-cost line in the audit should quote both.
- Math teachers' language is about *homework being dead*, and their fix is *in-class quizzes* (cheap, already familiar). That is a lower-pain, lower-willingness-to-pay pattern than the writing teachers' language. See the reopen note at the end.
- The strongest single phrase to reuse is McGlone's: "when good work stops being evidence."

---

## 5 · Organizations already selling assessment-design PD

| Provider | What they sell | Price (where findable) | What the deliverable actually contains | AI-era assessment content? |
|---|---|---|---|---|
| **Solution Tree** (incl. Marzano Resources) | Assessment PD: keynotes, one-day services, 2–4-day workshops, multi-day embedded coaching; on-site and virtual. Workshop "Designing Quality Assessments" where teachers "design or revise current assessments to more effectively guide instruction." | Quote-based. Comparable: College Station ISD approved **$236,862** (Oct 2025, Title II) for PLC/RTI coaching across 19 campuses. | "Customized guidance and support from an expert," "Classroom-ready plans for implementation," "Customized action plan." No per-teacher audited artifact. | Yes, thin: "Solution Tree Master Class: Educator AI" — a mini-series of 90-minute recorded sessions, 365-day access, one strand titled "Accurately Measuring Mastery in an AI World." [OBSERVED] |
| **McTighe & Associates (Jay McTighe / UbD)** | "Designing Authentic Performance-based Assessment Tasks and Rubrics" (1–2 days), "Using Classroom Assessments to Enhance Learning" (1 day), webinars 90 min–3 hrs; performancetask.com online modules with optional "performance task certification." | Not listed; contact for pricing. Booked via speaker bureaus. | Framework (UbD), task templates, rubric design practice. No AI content on the workshop list at all. [OBSERVED] | No |
| **AI for Education (Amanda Bickerstaff)** | Free webinar series ("AI Launchpad"), 2-hour virtual seminars, district PD contracts, state-level work (e.g., Utah USBE). "Authentic Assessment with AI" webinar. | Free webinars; seminars/master classes not priced publicly; district contract amounts not found. | Prompt library ("Authentic Assessment Prompt"), EVERY framework, tool pointers (Unrulr, TeachFX). Emphasis on process documentation and metacognition. No per-assignment output. [OBSERVED] | Yes — the closest positioning to ours, but generic and tool-centric |
| **Smekens Education** (literacy PD; useful as a *rate card*) | On-site & virtual consulting; schoolwide plans | **$2,700–$6,500 per day** plus travel; "Implement Plan" $9,500/yr incl. 8 hours virtual coaching; $99–$169 per-person on-demand. | Videos, workshops, coaching hours. [OBSERVED] | No |
| **Ditch That Textbook (Matt Miller)** | "AI for Educators" 4-week cohort course; keynotes | Course **$49** (5 PD hours certificate); keynote **$10,000–$20,000** (speaker bureau estimate). | Weekly live sessions, PDFs; Week 3 covers "Cheating and Plagiarism." [OBSERVED] | Yes, at the awareness level |
| **NCSM (math supervisors)** | AI Virtual Summit, Feb 17 2026 | Free to members; **$85** non-members (incl. membership) | Sessions incl. "When Good Work Stops Being Evidence: Rethinking Assessment in an AI World." [OBSERVED] | Yes — and it is the math leadership channel |
| Higher-ed teaching centers (JHU "Practical Strategies for AI-Resilient Assessments," Mizzou "Rethink and Redesign Assessments… Undermined by AI," Duke, CSU) | Free internal workshops | $0 | Frameworks and checklists; the Frontiers (Jul 2026) four-pillar paper ships a six-question "Vulnerability Audit Tool" and an oral-defense protocol at 8–12 min/student — but states it has "no empirical outcomes or validation data" and is higher-ed only. [OBSERVED] | Yes — this is where the intellectual content is being produced, for free |

### What none of them deliver [OBSERVED absence across all seven]
A teacher's own assignment, audited and returned redesigned, with a statement of what the redesign preserves. Every deliverable is a framework, a template, a plan, or recorded hours. Solution Tree's "design or revise current assessments" workshop is the nearest — the teacher revises in the room, unreviewed, and leaves with whatever they got done.

### Price anchors this gives us [MODELED from the observed rate card]
- One consultant day: $2,700–$6,500 (Smekens) up to $10–20k for a name keynote.
- A $6–15k sprint = 1.5–3 consultant-days at market rates. Our sprint (25–50 audited assignments + a half-day) is priced *inside* the market band for 2–3 days of PD — which is fine for entry, but it means we are not selling a premium; we are selling a *different deliverable at the same price*. The margin story has to come from the audit taking ≤45 min each, not from price.

---

## 6 · Conclusions

### The single strongest existing product to make materially better

**The 1–2 day "Designing Quality / Authentic Assessments" workshop** — the Solution Tree and McTighe format that districts already buy from Title II. Not Turnitin, not MagicSchool.

Why this one, sharpened from the plan:
- It is bought on a signature (item 3), from a protected line (Title II-A level-funded FY26), by a buyer who now has a think-tank citation telling them to "map assessment tasks… to identify vulnerability levels" (Learning First, May 2026).
- Its deliverable is verifiably weak in one way we can fix: the teacher revises alone in the room. We replace "revise in the room" with "arrives with their audits already done, spends the room on the run-cost question."
- Its providers have no AI-era content beyond a recorded strand (Solution Tree) or none (McTighe). That gap is 12 months wide at most — see below.

The product we would be *materially better than* in software terms is MagicSchool's "AI-Resistant Assignment Suggestions" — but per locked decision 5 we should not build it, and per item 2 it would be free within weeks of being good.

### The three most likely ways an incumbent kills us

1. **MagicSchool or Brisk ships the audit as a free tool and bundles the PD.** Brisk Curriculum Intelligence already holds the district's standards, pacing and materials — objective reconstruction is a prompt over data they own. MagicSchool Enterprise already includes "professional development" and sells "Professional Services." A C&I director choosing between a $12k sprint from an unknown and a free feature inside a tool they already license, with a PD day thrown in, chooses the tool. Probability high; timing 6–18 months; trigger is any of our material getting traction. [MODELED]
2. **Turnitin sells the verification machinery, so redesign stops being necessary.** Multipart Assignments + Clarity process capture + Google Classroom add-on = "make thinking visible" without touching the task. This attacks our biggest known risk from the other side: it gives the teacher cheap process evidence and lets the assignment stay as it was. Districts that buy Clarity will believe they have solved the problem. Limited to writing, limited to Workspace Plus/LTI districts — which is why math and non-Workspace-Plus schools remain ours. [OBSERVED capability, MODELED behavior]
3. **Solution Tree / AI for Education add an "assessment in the AI era" strand with their sales force.** They own the buyer relationship, the Title II paperwork fluency, and the "evidence-based" language; Solution Tree already has a recorded strand titled "Accurately Measuring Mastery in an AI World." They would deliver it as slideware, which is worse than ours — and it would not matter, because the buyer cannot evaluate the deliverable before purchase. [OBSERVED strand exists; MODELED move]

A fourth, not an incumbent: **prohibition stays free.** NYC's ban (CONTEXT.md), the Ofqual/JCQ briefing that tells UK leaders to enforce rather than redesign, and every teacher in item 4 who "finally" moved everything in-class. The free substitute is administratively simpler than we are and it is already winning.

### The strongest argument against my own recommendation

The PD line is the right door, but the thing we carry through it may not be worth what we charge. Three honest problems:

- **We cannot yet distinguish ourselves from a $0 generator in a way the buyer can see.** The buyer cannot audit our audit. Our differentiation — human review, a preservation claim, a run-cost estimate — is real only if teachers *use* the redesigns, and we have no evidence yet that they will. Until the Phase-2 numbers exist, "materially better" is a claim, not an observation.
- **The buyer's stated condition is "evidence-based," and we have none.** Every incumbent in item 5 can point to a research base (UbD, Marzano, decades of assessment-literacy literature). We can point to Stanford/ETS and a Frontiers paper that says its own tools are unvalidated. A federal-programs director who is asked "what's the evidence base" will get a weaker answer from us than from Solution Tree.
- **The pain is loudest where we are weakest.** Every "I'm done," "paranoid," "war is over" quote is from a writing-heavy subject. Math teachers say homework is dead and reach for in-class quizzes, which cost nothing. Turnitin's boundary makes math our competitive whitespace; the teachers' language makes it a demand desert. Whitespace with no demand is just space.

If those three hold, the correct move is not a paid sprint but a free artifact good enough to get quoted — and the revenue comes later, from the corpus and the department metric, not from PD days. That is compatible with the plan; it just means Stage 3 should be treated as a hypothesis with a real chance of a null result, not as the business.

---

## Observed vs. modeled ledger

| # | Claim | Status | Source |
|---|---|---|---|
| 1 | Clarity requires all writing inside its editor; writing assignments only | OBSERVED | guides.turnitin.com instructor FAQs |
| 2 | Clarity is a paid add-on; LTI 1.3 recommended | OBSERVED | guides.turnitin.com admin FAQs |
| 3 | Google Classroom add-on (May 2026) requires Workspace for Education Plus | OBSERVED | turnitin.com press release |
| 4 | ~100 secondary schools/districts piloted Clarity in first 60 days | OBSERVED (vendor-reported) | turnitin.com press, Sept 2025 |
| 5 | Multipart Assignments (Aug 2026), configurable AI settings (May 2026) | OBSERVED | guides.turnitin.com product updates; turnitin.com blog |
| 6 | Turnitin has no assignment-audit feature | OBSERVED absence in 2026 release notes | same |
| 7 | Brisk CI grounds generation in adopted curriculum; live BTS 2026; no validity feature | OBSERVED | briskteaching.com |
| 8 | Brisk Inspect Writing = free process replay in Google Docs | OBSERVED | briskteaching.com/inspect-writing |
| 9 | MagicSchool ships "AI-Resistant Assignment Suggestions" + "Multi-Step Assignment Generator" | OBSERVED | TCEA; magicschool.ai blog May 2025 |
| 10 | MagicSchool Enterprise bundles PD and sells professional services; $45M Series B Aug 2026 | OBSERVED | magicschool.ai/pricing; valueaddvc.com |
| 11 | CK-12 free AI-resistant assignment generator | OBSERVED | info.ck12.org |
| 12 | Incumbents could ship a software audit in 1–3 months | MODELED | — |
| 13 | Federal micro-purchase threshold $15,000 from Oct 1 2025 | OBSERVED | mrsc.org |
| 14 | Professional services bid-exempt; superintendent PO authority to $100k (Union PS); quotes >$25k, bids >$35k, contracts to board (Northbrook D27) | OBSERVED (two districts) | district policy pages |
| 15 | Title II-A: July 1 availability, 27-month window, 100% carryover, contracts with for-profits allowed; FY26 $2.19B level | OBSERVED | Oregon ODE; CDE Colorado; Learning Forward |
| 16 | Signer titles for a $6–15k PD engagement | MODELED from 14–15 | — |
| 17 | 4–10 week cycle inside a planned slot; 6–9 months otherwise | MODELED | anchored on civiciq 12–18 mo software figure and July–June FY |
| 18 | Principal discretionary threshold | UNVERIFIED (source robots-blocked) | — |
| 19 | 19 teacher quotes | OBSERVED, linked | item 4 |
| 20 | Reddit quotes | NOT OBSERVED directly (403); one secondary paraphrased analysis | wonderingaboutai.substack.com |
| 21 | Learning First May 2026: n≈3,400 teachers; recommends mapping task vulnerability | OBSERVED | learningfirst.com |
| 22 | Solution Tree Educator AI strand "Accurately Measuring Mastery in an AI World"; College Station $236,862 Title II contract | OBSERVED | solutiontree.com; citizenportal.ai |
| 23 | Consultant day rate $2,700–$6,500; keynote $10–20k | OBSERVED (one provider; one bureau estimate) | smekenseducation.com; allamericanspeakers.com |
| 24 | McTighe workshops have no AI content | OBSERVED (workshop list) | jaymctighe.com/workshops |
| 25 | Frontiers four-pillar framework: unvalidated, higher-ed only, 8–12 min oral defense per student | OBSERVED | frontiersin.org, Jul 2026 |
| 26 | Math is competitive whitespace but lower-pain | MODELED from 1, 19 | — |
| 27 | Three kill paths and their timing | MODELED | — |

---

## Locked decisions — what I think should be reopened, and why

**Decision 4 (wedge = secondary math, 20-teacher ELA/history contrast cell) — reopen the *ratio*, not the subject.**
Reason, from evidence in this teardown: (a) Turnitin Clarity's boundary is *writing-only*, so math is where the strongest incumbent structurally cannot follow us — that argues *for* math; (b) every high-intensity teacher quote I could find is from a writing-heavy subject, and math teachers' own language ("homework is dead") points to a cheap, familiar workaround (in-class quizzes) rather than a redesign need — that argues *against* math as the demand beachhead. Both are true at once. I recommend making the contrast cell **40/60 rather than 80/20** so the Phase-2 kill criteria can actually discriminate between "math is a demand desert" and "the offer is wrong." Keeping 80/20 risks a null result we cannot interpret. Your credibility argument for math still stands; it just should not be allowed to hide the demand question.

**Decision 6 (free deliverable is a real value exchange) — not reopened, but tightened.** The free audit is now competing with MagicSchool's and CK-12's free generators, not with nothing. The deliverable has to be visibly *not* a generator output: named reviewer, preservation claim, run-cost estimate, and the teacher-ownership guarantee stated on page 1. If it reads like a generator, the behavioral validation will measure generator demand, not ours.

No other locked decision is contradicted by anything I found. Decision 1 (no score) is reinforced: Learning First's "vulnerability levels" recommendation is qualitative, and the only published scoring rubric (Frontiers) admits it is unvalidated. Decision 2 (assignments only) is now also our cleanest competitive sentence: *Turnitin needs the student; we need only the task.*

---

## Sources

Turnitin
- https://www.turnitin.com/products/feedback-studio/clarity
- https://www.turnitin.com/blog/what-is-learning-integrity
- https://guides.turnitin.com/hc/en-us/articles/37198804513165-FAQs-for-Instructors-Using-Turnitin-Clarity
- https://guides.turnitin.com/hc/en-us/articles/37670935742989-FAQs-for-administrators-using-Turnitin-Clarity
- https://guides.turnitin.com/hc/en-us/articles/29645383597965-Turnitin-product-updates
- https://www.turnitin.com/blog/ai-your-way-new-settings-for-more-flexible-learning-in-turnitin-clarity
- https://www.turnitin.com/press/turnitin-announces-google-classroom-add-on-to-promote-responsible-ai-use-in-schools
- https://www.turnitin.com/press/secondary-education-leads-in-prioritizing-ai-literacy
- https://www.turnitin.com/press/turnitin-data-shows-transparency-about-ai-use-benefits-students-and-educators
- https://tips.uark.edu/turnitin-clarity-pilot-for-spring-2026/
- https://www.turnitin.com/ebooks/building-ai-ready-assignments-a-practical-guide-to-responsible-ai-use-educator (404 at fetch)

Brisk / MagicSchool / free generators
- https://www.briskteaching.com/curriculum-intelligence
- https://www.briskteaching.com/post/brisk-announces-curriculum-intelligence-for-back-to-school-2026
- https://www.briskteaching.com/inspect-writing
- https://marketbrief.edweek.org/financing-investment/schoolai-raises-25m-brisk-teaching-secures-15m/2025/04
- https://www.edusageai.com/blogs/brisk-teaching-pricing-for-schools-and-districts-in-2026
- https://www.magicschool.ai/pricing
- https://www.magicschool.ai/blog-posts/make-your-assignments-ai-resistant-this-year
- https://www.magicschool.ai/blog-posts/whats-new-april-2026
- https://blog.tcea.org/magicschool/
- https://valueaddvc.com/pulse/magicschool-ai-63m-series-b-edtech-2026
- https://info.ck12.org/teacher-tools/ai-resistant-assignment-generator

Buyers / procurement / Title II
- https://mrsc.org/stay-informed/mrsc-insight/november-2025/federal-thresholds
- https://www.unionps.org/about/board-of-education/boardpages/business/3010-purchasing-and-procurement
- https://www.nb27.org/board-of-education/board-of-education-policies/section-4/section-460
- https://civiciq.com/blog/how-to-sell-to-school-districts-the-complete-b2g-guide-for-edtech-vendors-2026
- https://ed.cde.state.co.us/fedprograms/tii-index
- https://www.oregon.gov/ode/schools-and-districts/grants/ESEA/Documents/CARRYOVER.pdf
- https://learningforward.org/2026/01/20/final-fy26-appropriations-preserves-title-ii-a-and-title-iv-a-takes-on-controversial-restructuring-proposals/
- https://citizenportal.ai/articles/6402253/Texas/Board-approves-236862-Solution-Tree-professionaldevelopment-purchase-funded-mainly-by-federal-grants

Teacher language
- https://www.chalkbeat.org/2025/11/04/three-theories-on-ai-in-schools-about-cheating-teaching-and-tutoring/
- https://www.the74million.org/article/homework-artificial-intelligence-cheating/
- https://eedi.substack.com/p/is-maths-homework-dead
- https://learningfirst.com/research/aiuseinschools
- https://www.cultofpedagogy.com/ai-integrity/
- https://www.pbs.org/newshour/classroom/classroom-voices/educator-voices/2025/10/generative-ai-has-no-place-in-my-classroom
- https://www.edweek.org/technology/opinion-what-in-the-chatgpt-is-this-how-el-teachers-are-navigating-ai-use/2026/05
- https://www.nea.org/nea-today/all-news-articles/chatgpt-enters-classroom-teachers-weigh-pros-and-cons
- https://joshbrake.substack.com/p/blue-books-and-oral-exams-are-not-the-answer
- https://thecheatsheet.substack.com/p/375-professor-ai-has-made-my-workload
- https://fortune.com/2026/03/25/oral-exams-colleges-anti-ai-teaching-method-gen-z-stare/
- https://www.insidehighered.com/news/faculty/learning-assessment/2025/12/16/you-cant-ai-proof-classroom-experts-say-get-creative
- https://wonderingaboutai.substack.com/p/i-analyzed-415-reddit-posts-about
- https://www.mathedleadership.org/ai-virtual-summit/
- https://www.nctm.org/standards-and-positions/Position-Statements/Artificial-Intelligence-and-Mathematics-Teaching/
- https://hechingerreport.org/student-voice-teachers-assign-us-work-that-relies-on-rote-memorization-then-tell-us-not-to-use-artificial-intelligence/
- https://assets.publishing.service.gov.uk/media/69aac45abde9c3f213c89913/SLT_briefing_pack-_AI_and_coursework_integrity_v2.5.pdf

PD providers
- https://www.solutiontree.com/assessment/pd-services
- https://www.solutiontree.com/solution-tree-master-class-educator-ai.html
- https://www.solutiontree.com/presenters/overview
- https://jaymctighe.com/workshops/
- https://www.performancetask.com/
- https://www.aiforeducation.io/ai-seminars-and-master-classes
- https://www.aiforeducation.io/authentic-assessment-with-ai-webinar
- https://www.utah.gov/pmn/files/1346131.pdf
- https://www.smekenseducation.com/teacher-professional-development/pricing/
- https://ditch.teachable.com/p/ai-bts
- https://www.allamericanspeakers.com/speakers/452337/Matt-Miller
- https://www.frontiersin.org/journals/artificial-intelligence/articles/10.3389/frai.2026.1841682/full
- https://hub.jhu.edu/events/2026/03/26/practical-strategies-for-ai-resilient-assessments-0
- https://tlc.missouri.edu/resource/rethink-and-redesign-assessments-and-assignments-that-have-been-undermined-by-ai
