# Signposts: consumer-lesson-fixes

Original, held in this chart (consumer-lesson-fixes). Session: door t126, full autopilot, 2026-11-17. Draft: slots/signposts-draft.md. Angles added by B (slots/signposts-B.md), C (slots/signposts-C.md) and D (slots/signposts-D.md). Proposed answers came from issues/chart/model-judgment/forks/signposts.md where they applied (hard limits on new machinery).

## Question

1. How are the three reports grouped and ordered?
   - 1a (recommended) One chart, three independent issues side by side, each its own completion owner closing its own report. No issue waits on another: #141 and #142 are judged by today's Retire rule, so #143 is not their prerequisite (D M1a). Shared files order nothing.
   - 1b Three charts with a handover between each.
   - 1c #143's wording settles first, then all three build (C M2a).
   - Steers: split, handoff tree, closes, fork order.
2. What kind of fix wins when a code change and a rule line could both fix a report?
   - 2a (recommended) Remove the mechanism where one change does it; otherwise keep git's own definition and refuse at the point of use with the cause named and the fix stated; never a second parser or a lenient reading beside git's (D M2a). Where the refusal already exists, the target is that its message names the real cause (B). A prose line only where no code path reaches the action, and the fork then states plainly whether the lesson can retire (C G1, D).
   - 2b Prose only.
   - 2c Prose plus a guard everywhere.
   - Steers: #141 and #142 fixes, their done-criteria and retirement claims.
3. Must a fix hold in every harness that runs seats and workers?
   - 3a (recommended) Yes: no fix depends on one harness's hooks or tool settings (claude, codex, pi, agy) (D M3a).
   - 3b A harness-specific hook is allowed.
   - Steers: #141 most, rule wording, proofs.
4. Which repo does the work touch, and what does done claim about the framework lessons?
   - 4a (recommended) akrogon only. Each issue's done record names, from a read-only reading of the framework lessons its report cites, which of them the fix lets leave and what stays framework work (Tamdoma/tamdoma-framework#650, the framework's own LESSONS.md edits) (C M3a, C G2).
   - 4b akrogon plus framework LESSONS.md edits.
   - 4c akrogon tests only, no framework reading.
   - Steers: scope, done-criteria, what a completion may claim.
5. What may the #143 change add?
   - 5a (recommended) Rule text only in existing files (learn-issues SKILL.md Sort, the shared lesson-rule.md Transfer and Retire, every identical copy changed together); no new script, registry, record kind or scanner.
   - 5b A new record kind or command that marks a lesson covered.
   - Steers: the #143 fork.
6. What may proofs cost, and how is each report checked first?
   - 6a (recommended) Free only: local and temp git repos and existing tests, no paid model launches. Each report is reproduced at charting in a free local probe or read-only sort before its fix forks settle; a report that does not reproduce is recharted, not fixed (C M1a). Rule-text changes are proven by the review seat reading the text against the cited lessons, not by a run (D).
   - 6b A small paid launch budget.
   - Steers: every proof, grant and readiness record.

## Taken

A's picks under full autopilot (signposts: A), 2026-11-17, not operator words. The operator's words that handed the round to A, verbatim: "Full autopilot mode, even the signposts."

- 1a. Decided by the operator's "consolidate them" and by speed: one map, one consultant set, three issues that close independently. Rejected 1b (three handovers and restarts for no dependency), 1c (D M1 shows the other two do not depend on #143's wording once today's Retire is the bar; C's shared-file point orders nothing under the split rule).
- 2a. Decided by removing over adding and systems thinking. Rejected 2b (the lesson rule keeps prose-fixed lessons active forever, which is the #143 loop), 2c (two mechanisms for one failure).
- 3a. Decided by simplicity and price: a per-harness hook needs a paid launch per harness to prove (D M3).
- 4a. Decided by function over form: a fix that passes its own tests while the cited lessons stay stuck did not deliver the report's outcome (C M3). Reading is free. Rejected 4b (other repo's records), 4c.
- 5a. Carried from model-judgment's hard limits; removing over adding.
- 6a. Decided by price and the evidence: #142 already changed shape on inspection (C M1). Rejected 6b: no report needs a model run.

Ranked priorities: (1) each fix stops its failure where it happens, in every harness; (2) each change stays small and in existing files; (3) each completion says honestly which framework lessons can now leave.

Hard limits: akrogon repo only; no paid launches; no new script, registry, record kind or scanner for #143; never a second parser beside git's.

Account: the session fixes the three failures at their source in akrogon, checks each report reproduces before fixing it, and reports what the framework can now retire. It gives up framework-side edits and any harness-specific guard.

Chart order: consumer-lesson-fixes only (one chart). A dropped nothing.

## Needs

none (B, C and D foresaw none; every proof is free and local; framework reads are read-only and need no grant)
