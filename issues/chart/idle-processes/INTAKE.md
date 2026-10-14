# Intake: idle-processes

## Operator notes (verbatim)
2026-10-13: "don't put any caps, it must not be the solution. The solution is killing idle processes, and figuring out how to make the tests better."
2026-10-13, replying "yes" to A's proposal to chart I1-I3:
- I1. `akrogon status` shows only the cwd's repo (operator could not find 9 framework leaves).
- I2. No signal when processes leak: 57 browsers (~19 GB, ~6 cores) sat in akrogon.slice unnoticed.
- I3. A leaf's leftovers outlive the work that started them (crawl-run-binding had 61 idle shells up to ~4.4 h old, plus zombies).
2026-10-14: "Figure out what is blocking the memory and why everything failed overnight and hasnt moved like it should have. Everything worked 2 days ago before we started blocking, adding buses etc. The only thing we shouldve focused on is getting the tests not to waste so much CPU and optimizing them. Thisis a huge regression, setting up so many limitations, serial testing, etc."
2026-10-14, relayed from watch-akrogon with the operator's choice: "Operator choice: remove the memory check in its own leaf after run-units merges (run-units also edits src/admission.ts). Please chart that, plus a fix for C1. C2 belongs to the framework repo."
- C1. Leaf temp `/tmp/akr-<uid>/<repo>/<leaf>` is the seat's TMPDIR on tmpfs. run-check removes only its `run-*` root (`src/run-check.ts:200`); other test files stay until the leaf is merged or failed (`src/reconcile.ts:431`).
- C2 (framework, not this chart). `/tmp/swi/w-*` from `.claude/hooks/tests/scratch-writer-isolation.test.ts:75`; `/tmp/page-measure-*` from `page-measure.mjs:368`, removed only on a clean browser close.
- C3. `src/admission.ts:42` hardcodes LIMIT_GIB=48 with no override, counting all slice anon plus tmpfs.

## Agent findings (2026-10-14, A/B/C overnight analysis: slots/overnight-B.md, slots/overnight-C.md)
- `src/next.ts:466` empties a leaf's temp on dispatch when no live tab matches, without checking for in-progress `run-*` roots (reconcile does check, `src/reconcile.ts:415-433`). Likely cause of pass-two-review-notes merge retry fb0ccbd0 vanishing at 05:28Z with its output deleted. Low confidence: the folder is gone.
