# The five invitations — drafted 2026-09-13, NOT sent

**Not sent, and they must not be sent yet.** `/esa/review/` is not live: the pilot exists only on
`feat/esa-pilot`, which is four commits ahead of its own remote and not on `master`. `master` has
one ESA file, the public homepage. There is no `/esa/admin/` in production to mint invite tokens
either. An invitation sent today lands on a page that does not exist.

**Send them after the deploy sequence at the bottom, not before.**

---

## What the email has to do, and what it must not

The pilot's best outcome is "I would leave this alone." Falsification condition 3 says a teacher
who gets that result and never returns means the result screen failed. But if the *invitation*
promises improvement, condition 3 fires by construction — the teacher was told to expect changes
and got none. So the email has to sell the question, not the fix.

It must also work **cold**, because at least two of the five owe nothing. Nothing below leans on
a favour, a shared history, or an obligation.

Three things it deliberately does not say: it does not call this AI, it does not promise time
saved, and it does not ask whether they like it.

---

## The email

> **Subject:** A second opinion on one of your assessments
>
> Hi [name],
>
> I taught high-school maths for twenty years, and I'm testing something with a small number of
> middle-school teachers. I'd like you to be one of them if you have the appetite.
>
> Here's the question it answers. You give an assessment, you get a set of results, and you draw a
> conclusion from them — these students have got this, those haven't. What I'm testing is whether
> that conclusion is actually supported by the evidence the assessment produced, or whether some of
> it is inference you're making on the assessment's behalf.
>
> You paste in an assessment you already use and tell it what you're trying to find out and how
> students take it — in class, at home, calculators allowed, that sort of thing. It reads the
> assessment against what you said you wanted to know, and tells you which of your conclusions the
> evidence supports, which it doesn't reach, and why.
>
> Often the answer is that it's fine and I'd change nothing. That's a real result and the one I'm
> most interested in — a lot of assessments are already doing their job and get rewritten anyway.
> When something genuinely isn't covered, it proposes one short question, five or ten minutes, and
> tells you what it costs you to mark. If there's no cheap way to check, it says that instead of
> inventing one.
>
> Three of these, free, no card, no account. Assignments only — never student work, never a
> student's name.
>
> What I need back is not whether you liked it. It's whether you'd put a second assessment through
> it, and if not, where it lost you.
>
> If you're in, reply and I'll send you a link.
>
> Dalia
> The Sovereign Academy

### Varying it

- **For the two who owe nothing:** send exactly as written. Do not add a warm-up paragraph; the
  cold version is the one being tested.
- **For someone you know:** replace the first paragraph with how you know them. Change nothing
  else — particularly not the "often the answer is nothing" paragraph.
- **Never** add "it only takes a minute", a deadline, or a second ask.

> Voice note: everything above is written from what is already recorded — twenty years teaching
> maths, the product definition, the pilot mechanics. No anecdote, admission or biographical
> detail has been invented. If you want a specific classroom story in here, it has to come from you.

---

## Running the gate

Reply-gated on purpose: the email asks for a reply before the link, so a token is only minted for
someone who said yes. That also makes the reported number the real one.

**Report the number who replied, not the number sent.** Then, separately, how many submitted #1,
#2 and #3. Never a single combined figure. A warm reply with no second submission is a
non-return — see `PILOT-PRE-REGISTRATION.md`.

---

## Deploy sequence — everything that must happen before the first email goes

None of this can be done from the Claude session: there is no GitHub push credential in the
tooling VM (SSH has no known_hosts, HTTPS has no helper, no `gh`). Every step below is Dalia's.

1. **Push the pilot branch.** `cd ~/projects/sovereign-academy-hub && git push origin feat/esa-pilot`
   — four commits: the A4 hierarchy pin, the `/esa/review/` relocation, the falsification
   pre-registration, and the earlier error-handling fix.
2. **Apply the SQL before deploying.** `sql/2026-09-09-stale-generation.sql` from
   `fix/as-stale-generation` must be applied to Supabase `rdqwoqdvqpedlsbaghtr` *before* the
   function that depends on it goes out. This is the one ordering mistake that is expensive.
3. **Reconcile the branches.** `feat/esa-pilot` no longer has `esa/index.html` — it moved to
   `esa/review/`. The public homepage comes from `master`. Merge so that both exist: `/esa/`
   homepage and `/esa/review/` pilot.
4. **Redeploy `esa-review`. VERIFIED, not assumed.** The deployed function is v1 from
   2026-09-11 and predates today's pin. Its source was read from Supabase on 2026-09-13 and it
   still contains `TIER 1 — MODIFY` (×1), `modify_item` (×2), `modify_one_item` (×1),
   `why_not_tier_1` (×3) and `longer_observation` (×1), and contains `YOU MAY NOT REWRITE` zero
   times. **The tier that failed H1 is live on the backend right now.** It is unreachable only
   because no front end in production points at it. Deploy the branch without redeploying the
   function and it becomes reachable by a teacher. **This is the step most likely to be forgotten
   and the most expensive to forget.**
5. **Check `/esa/review/` in a browser** and mint one invite from `/esa/admin.html` for yourself.
   Run one real assessment end to end.
6. **Only then send the five emails.**

A useful ordering property: step 5 is also the first real test of the pinned hierarchy on a live
model path, which has never been measured (the Anthropic key exists only as an edge-function
secret).
