# existing-proxies

## Question

1. A leaf's real output is refused by a proxy that already exists (a check, gate, test or driver step not written by this leaf). Who removes it?
   - 1a (recommended) implement-issue gets a fourth exception: A removes it in its own commit whose message cites the refused real output and the standing line, with the existing `Test-Change:` trailer for a test file; keep-list function checks are never removed this way (keep list defined by what a check tests, not why it was added); B judges each removal, and a rejected removal is a Fix restoring it. The restated deliberate-break line in implement-issue is scoped like standing-design's.
   - 1b Route through review: B raises the Fix and removes a product gate in check.repair; A corrects a test expectation in check.fix.

### Carries

Signposts 1a 2a 3a 4a 5a 6a and hard limits (forks/signposts.md). Intake Tamdoma/akrogon#140. Merged notes slots/forks-merged.md; rebuttals slots/forks-rebuttal-B.md, slots/forks-rebuttal-C.md.

## Findings

- 1a (A,B); 1b (C). C: keep raising and deleting in different seats; delete-to-green is signpost 5a's named cost.
- B rebuttal: 1b cannot start in the case that opened this chart: A runs criterion proof before review and a red criterion ends the pass failed, so the leaf never reaches review; the THIN_READ failures happened in implement with fix_rounds 0 and no review (slots/info-framework.md section 4); the existing exception covers only "one wrong expectation in a planned test", not a pre-existing check or a product gate, so 1b also needs new wording.
- Safeguards that already exist: own commit, trailer, check.review "a change or deletion without a real cited source is a defect" (B). Research R7 (codemanship 2026-10-18): agents sometimes delete failing tests; review stays.

## Taken

A's pick under full autopilot, 2026-11-17: **1a**. Reason: B's evidence that 1b never runs where the harm happened; removal over addition. Rejected 1b. Standing dissent: C (delete-to-green risk), met by the keep list, the cited real output and B judging each removal.

Correction 2026-11-17 (A, final-shape check): the report lists every removal with the refused output it cites, so a product-gate removal without a trailer is visible (B12); the keep list is named inline (C P4).
