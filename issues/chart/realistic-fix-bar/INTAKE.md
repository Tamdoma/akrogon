# Intake: realistic-fix-bar

## Scope
Destination akrogon, one issue: review Fix/Nit rules stop blocking on defects that need input no real build, user, integration or attacker would produce, and repair skips deferred findings.

## Provenance
- GitHub: Tamdoma/akrogon#43
- Operator: 2026-09-30 message during chart epic-broadcast-once

## Source: Tamdoma/akrogon#43
# check-issue treats contrived reproductions as blocking Fixes, so review rounds never converge

Source: Tamdoma/akrogon#43
URL: https://github.com/Tamdoma/akrogon/issues/43

Unverified intake.

## Observation
Leaf `offer-join-deploy` in `Tamdoma/framework` has gone through 7 check.fix rounds since 2026-09-30 06:41Z, including one failure on "fix rounds exhausted" and a resume. Each B re-check found one more JavaScript syntax case that fools the unchanged-output gate's script masker: string literals, comments, template literals (F12), loader call arguments (F16), and now regex literals (F17).

The inputs are crafted, for example a page whose heading is `` `Hello ${/import "Alice"/.source}` `` alongside `fetch("Alice")`. Each is a reproducible false pass, so under `skills/check-issue/SKILL.md:43` and `:47` ("A Fix is wrong behavior ... reproducible defect", "a failure the leaf's code can cause left untested") it is a Fix and opens another repair round. The rule has no bar for whether a real build would ever produce the input, so a thorough reviewer (GPT-6.1-Sol xhigh here) can always construct the next case. Each round costs about 1 to 1.5 hours of test suites, a real deploy and a full re-check, and two downstream leaves wait on it.

Operator's wanted rule: a defect that needs input no real build or real user would plausibly produce is a Nit, recorded as a deferred follow-up, not a Fix that opens repair.

## Location
akrogon: `skills/check-issue/SKILL.md` (Fix/Nit definitions, lines 43 to 47). Seen in `Tamdoma/framework` at `issues/open/landing-multi-offer/offer-join-deploy/review-B.md` (sections "Repair round 4 re-check" and "Repair round 5 re-check").

## Reproduction
1. Have a leaf whose code parses or normalizes open-ended input (HTML, JavaScript, URLs).
2. Let B re-check after each repair.
3. B constructs a new adversarial input the latest repair does not cover, records it as a Fix, and the leaf loops until fix rounds run out.

Seen on every B re-check of `offer-join-deploy` on 2026-09-30.

## Expected behavior
Fix requires a defect reachable by realistic input (a real build, real user content or a real integration). Reproducible defects that need contrived input are Nits, listed as deferred follow-ups, and do not block merge.

## Urgency
High for throughput: one leaf has consumed most of a day in review and blocks `offer-analytics-join` and `emdash-offer-join`. Workaround: operator tells B to downgrade contrived cases by hand.

## Source: operator 2026-09-30
After that, let's do the new pulled issue. We need to chart it, because it's killing me how detailed the new slot b check-issue model is. It's good, but it finds details that will almost never be used in production, and we need to compromise on that a bit so the leafs move faster.

## Source: operator 2026-09-30 (tests)
This also got me thinking. How do we enforce basic test only, or only the tests that are really important, but really, really important.

Attached screenshot, CJ Hess (@seejayhess): "Opus 5.5 and Astra have me rethinking the baseline again. A few thoughts that I feel like went from an idea to concrete in my mind over the past few months: 1/ Delete tests - the models love to slop up tests and check that "abc" == "abc" all over the place. A lot of tests restate the code instead of test the code. This coupled with the fact that the models just write correct code these days has me feeling like unit tests are now just a waste of tokens."

I feel like a bunch of time is going on tests that aren't really that useful, so the lifecycle takes longer time than it needs to.

you can discuss with slot b

## Source: operator 2026-09-30 (live example)
See? This is the BS I'm talking about.

Attached screenshot: slot B on `epic-broadcast-once`: "Verdict: fix. New tests match incidental status wording. Check only completion lines and command success. All 37 phase tests pass."

## Agent findings
- `skills/check-issue/SKILL.md:41,43,47` make any reproducible defect or untested reachable failure a Fix, with no bar on whether real input reaches it. (A,B)
- Lines 35, 37 and 47 hold separate automatic-Fix triggers that a narrower line 43 alone would not govern. (B)
- `:53` limits re-check blockers to confirmed old findings and repair-introduced defects. The framework case stayed inside it: F12 was a partly repaired old finding, F17 was proven repair-introduced against the prior head. So `:53` does not stop the loop. (A,B)
- Real case `Tamdoma/framework issues/open/landing-multi-offer/offer-join-deploy/review-B.md:452-622`: crafted HTML (nested template, PROPFIND, regex literal in `${}`) proven with real Chromium, no named producer of that input. (A,B)
- `nits` already allows merge and `fix` repairs up to the cap (`src/phase.ts:107-112,227-235`, `src/config.ts:32`). (B)
- `skills/implement-issue/SKILL.md:56` repairs recorded findings without separating Fixes from Nits, so A may repair deferred findings anyway. (B)
- Practitioners, read 2026-09-30: Google eng-practices review standard (approve once code health definitely improves, no perfect code, balance forward progress, polish is "Nit:"), Google "what to look for" (still examine edge cases), GitLab code review guidelines (non-mandatory suggestions are non-blocking). None gives a probability threshold. (A,B)
- Live example `issues/open/epic-broadcast/epic-broadcast-once/review-B.md:10-16`: one Fix, all 37 phase tests pass, the defect is that a future rename of the `moved merged` line would break whole-stdout assertions. It rests on `skills/check-issue/SKILL.md:45` (no wording tests) and the "concrete maintainability defect" clause at `:43`, with no current failure. It costs a full repair and re-check round. (A)
- Test demands live in `skills/chart-issues/assets/standing-design.md:8-11` (no vanity tests, mandatory negative and edge tests, end-to-end flow artifact, cheapest sufficient test per criterion), `skills/implement-issue/SKILL.md:42` (tests from criteria, fail-first per bug), `skills/check-issue/SKILL.md:45,47` (no mocks or wording tests, any untested failure the code can cause is a Fix). `:47` is the rule that turns every imaginable failure into a required test. (A)
