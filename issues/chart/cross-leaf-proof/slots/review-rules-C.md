This round covers two kinds of bugs that neither the spine nor the proof-leaf rules fully stop. The first is a rule written in two places that drifts apart. The second is a check that real output can never pass. Both cost live-replay several multi-hour runs (#11, #12, #14, #16). Much of this is already covered by the three taken forks, so each question below first says what is already settled and asks only about the rest.

### 1 · When one piece of code writes something and another checks it, must both use one shared definition of the rule?

What happened in live-replay:
- #11: a fix for #10 taught prep which place names are allowed, but verify builds its own list of allowed names separately, so prep and verify disagreed "by construction" (`report.md` "Blocker #11": `prepare-briefs.ts:715` vs `verify-network.ts:326`).
- #12: the audit looked for a heading `ranked-list` while the writer wrote "The ranked list" (`report.md` "Blocker #12").
- #14: the check demanded that menu labels be unique across sites, but the model's writing instructions never said so (`report.md` "Blocker #14").

Already covered: the taken spine rule runs real checks on real (or recorded-from-real) writer output, so #11 and #12 would fail in the spine *if* both stages sit in a chain and the fixture has a page that hits the rule. Not covered: two copies inside one leaf or outside a chain, and a model writer whose instructions do not say what the check wants (#14). akrogon today has no rule on this. `skills/check-issue/SKILL.md:43` counts a "concrete maintainability defect" as a Fix, but names no duplicate-rule case.

Example: under the rule, prep and verify would both call one `allowedNames(page)` function. The #10 fix would change it once, and #11 could not happen. For #14, the writer's instructions would quote the check's rule ("labels of 4+ words must differ between sites"), so the model knows it.

Research: practitioner · Andy Hunt and Dave Thomas, *The Pragmatic Programmer*, DRY: "Every piece of knowledge must have a single, unambiguous, authoritative representation within a system" (https://en.wikipedia.org/wiki/Don%27t_repeat_yourself, read 2026-09-29) · DRY is about one fact living in one place, not about similar-looking code · this made the rule about the *rule*, so model instructions count too. Carried pitfall R5: shared code can share one bug, so a shared rule still needs its own example tests (question 2).

- **1a (recommended)** One standing-design line: "When one part writes something and another part checks it, the rule lives in one place both use. A model writer's instructions quote or are generated from the checker's rule. If a design keeps two copies, it says why, and a test checks they agree." Review marks a Fix when a diff adds a second copy of a rule without that reason and test. This wins because it closes the three cases above with one line and one review check, and it covers what the spine misses.
- **1b** Review only, with no standing-design line. Cost: writer and checker are often in different leaves (prep vs verify). Only the chart sees both, so review of one leaf can miss the other copy.
- **1c** No new rule. Rely on the spine. Cost: #14 is a model-instruction gap, which the spine only shows after a real writing session. The case inside one leaf is not covered at all.

Pitfalls: some copies are fine, for example a validator that must run in a place that cannot import the shared code. That is why 1a allows two copies with a reason and an agreement test. Do not turn this into "no similar code anywhere". It is about one rule, not look-alike lines.

### 2 · Must a new check come with proof that real output can pass it, and a size test when it compares things across a group?

What happened: #16. The review check wanted every pair of sites to look different, but the renderer had only 2 hero designs for 4 sites. With 2 heroes and 4 sites, some pair must share one, so the check could never pass (`report.md` "Blocker #16", "pigeonhole"). No test ever fed the check real output at 4 sites.

Already covered:
- A failing example: `skills/chart-issues/assets/standing-design.md:8` already requires "Mandatory negative and edge-case tests".
- A passing example on real output, when the check sits in a chain: the taken spine rule runs own checks real on recorded-from-real inputs.
- A check that wrongly rejects good output is "a failure the leaf's own code can cause", so the taken proof-selection rule already makes an untested one a review Fix.

Not covered: a check that compares items across a group (sites, pages, labels) and needs enough variety to pass. Nothing asks the leaf to state how much variety it needs or to test at the real group size. The fixture's four sites were the right size, but its review step supplied passing judgments, so the check never met real renderer output (carried finding B, spine-growth Findings).

Example: the leaf adding the "sites must differ" check writes "needs at least N distinct (hero, columns) pairs for N sites". It adds one test with the real module pool and 4 sites that must pass, plus one with a pool too small that must fail at plan time with a clear error.

Research: practitioner · John Hughes, "Experiences with QuickCheck: Testing the Hard Stuff and Staying Sane" (https://www.cs.tufts.edu/~nr/cs257/archive/john-hughes/quviq-testing.pdf, read 2026-09-29) · when a condition is met by few inputs, most generated inputs are thrown away and the property is seldom tested, so generators must be built to hit the condition · the nearest practitioner point I found: a check is only useful if real inputs can meet it. A search for a practitioner source on proving a validation check is satisfiable at target scale found nothing more direct (2026-09-29). The operator already chose this fix for #16 in live-replay: "if the pool cannot cover the site count, fail at plan with a clear error" (`report.md`, operator-delegated decisions).

- **2a (recommended)** Add only the missing part. A check that compares items across a group states the smallest pool it needs for the target count. The leaf tests it at the real target count with the real pool (must pass) and with a too-small pool (must fail early with a clear message). Review marks a Fix when such a check has no stated need or no target-size test. Passing and failing examples otherwise stay under the existing rules listed above. Review reruns only as `check-issue/SKILL.md:49` already allows (carried B3). This wins because it adds one rule for the one gap and does not repeat rules already taken.
- **2b** A full new line: every new check ships a real passing and failing example plus a size test. Cost: it repeats `standing-design.md:8` and the spine rule, and two copies of a rule is exactly what question 1 forbids.
- **2c** Nothing new. Cost: #16 happens again. Nothing covered the group-size gap.

Pitfalls: "group" must stay concrete, meaning a check whose result depends on how many items exist or how many choices a pool offers. Otherwise every check gets a pointless size test. The stated need must count what actually renders (#16 had a third hero value, `hero-lede`, with no render case, `report.md` "Blocker #16"), not just what a config lists.

Reply `1a 2a`, or a numbered free-text answer.

Challenge check
- A practitioner could say DRY across a writer and a checker couples them too tightly, since a checker is meant to be independent. 1a keeps the independence where it matters: the shared rule gets its own example tests (question 2), and a reasoned second copy is allowed with an agreement test.
- Someone could argue question 2 belongs in the spine fork. The spine uses a small fixed input chosen for fit, not for scale, and its review step faked judgments. The group-size test is a leaf-level unit test, which is the cheapest sufficient test under the taken proof-selection rule.
- Overlap is stated openly: failing examples (`standing-design.md:8`), real passing examples in chains (spine 3a) and untested false rejections (proof-selection) are already settled. This round adds only the two gaps.
