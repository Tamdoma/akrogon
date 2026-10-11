# Report: test-proof-rules

Base `354c80e` → head `667712d` on branch `test-proof-rules`. Three delegated workers, one wave, disjoint owned paths, then three A edits and commit `667712d`. Pass artifacts under this folder; code edits only in the worktree.

## Changed files and reasons

- `skills/plan-issue/SKILL.md` — plan.synthesis writes criterion tests red-first, records red output in `plan.md`, commits tests on the leaf branch before product code; proof commands require a runner/script at `AKROGON_BASE` or one direct product invocation; new-machinery criteria end the pass `failed` (criteria 1, 2).
- `skills/chart-issues/assets/standing-design.md` — :8 count rule; :10 machinery definition by function plus exclusions and prerequisite-leaf proof rule; :15 live runs use only existing machinery (criteria 5, 8).
- `skills/chart-issues/assets/shapes.md` — audit refuses product leaf depending on machinery absent at the destination default branch unless a `blocked-by` prerequisite delivers it; missing machinery proposed as that prerequisite (known-good pass + deliberate-break fail) else criterion narrowed at review (criterion 8).
- `skills/chart-issues/SKILL.md` — handoff live-run line names the existing machinery each live criterion uses; new sentence carries the propose-or-narrow rule into the door skill (criteria 8; covers worker 1 limitation L1).
- `skills/implement-issue/SKILL.md` — :36 machinery/environment-unrunnable proof is the required `failed` exit, never repaired by writing machinery; inline follows same rules with A sole seat; :57 replaced: implementation runs planned tests, workers/A/check.fix A write and edit no test, Q2 correction and Q4 reproduction are the only exceptions, count rule stated; :64 trailer paragraph kept, opened with tests-locked; :76 check.fix reproduction red-first with cited trailer, written by A before delegation; standalone/direct get order-only rule (criteria 3, 4, 5, 7, 9).
- `skills/implement-issue/brief-template.md` — section 2 hands workers planned tests and command from `plan.md`, count rule, worker-no-tests/mismatch; :31 drops "tests derived before code"; :45 worker trailer sentence removed (criteria 3, 5).
- `skills/implement-issue/worker-protocol.md` — :15 wrong/red planned test is a mismatch never a worker fix; failure ownership: planned tests are A's, run not written (criterion 3).
- `skills/check-issue/SKILL.md` — :55 missing-test Fix deleted; Nit-without-source gets no test and no new issue; B checks report ran planned commands `plan.md` names and nothing skips/filters/disables planned tests or runner config; :75 missing-machinery finding is the stop cause, live-rerun product defect still handed to A, expectation correction added to Handed-to-A list; :79 narrowed to red-first reproduction with cited trailer; :63 wrong-expectation route moved from "B fixes it" to "B hands it to A" (criteria 6, 7, 9; A fixes worker-3 finding S1).
- `skills/merge-issue/SKILL.md` — :55 "a new test needs no cited source" replaced with the scoped trailer rule for tests added after planning; wrong-test fix and fix-forward kept (criterion 7; A fix of worker-3 overclaim).
- `docs/guide/phases.md` — synthesis-time test authorship, tests locked after planning, planner writes the set and implementation runs it, Nit no test/no issue, review confirms planned commands ran (criterion docs mirror).
- `docs/guide/idea.md` — pass table: Synthesis `plan + tests`, Implement `code` (criterion docs mirror).

## Commands run

- `AKROGON_BASE=354c80e14aca6483c430312c61ae5c1397bb548e bun test --changed="$AKROGON_BASE" --timeout=30000` after each cherry-pick and at end: "11 changed files, but no test files are affected", 0 pass 0 fail — expected, prose-only diff.
- `bun run format` — passed; it rewrote two untouched files (`src/status.ts`, `skills/chart-issues/scripts/peer-wait.ts`), both reverted per the 2026-10-08 drift lesson.
- `bun run typecheck` (`tsc --noEmit`) — clean.
- `bun test --timeout=30000` — 691 pass / 0 fail, 75.65s (wall time: ~1.3 min).
- Criterion-10 sweep: `grep -rn "new test needs no cited source|tests derived before code|writes the tests|write the smallest test set|write.*tests.*before" skills/ docs/ README.md` plus worker/test-authorship variants — only new-rule lines and the deliberately kept `check-issue:53` sentence remain; `skills/watch-issues/scripts/fixtures/*.jsonl` hits are recorded session fixtures, out of scope.

## Criterion-11 classification

Fresh subagent (pi, devin/swe-2-max, high effort, write access but read-only task; transcript `…2026-10-10T21-41-44-596Z_01a127c3…jsonl`), given only the nine changed rule files plus the seven case descriptions, never this leaf's brief or diff. Verdicts all match:

- (a) refused, no worker test — implement-issue:57, brief-template:13
- (b) worker mismatch; only A corrects with cited `Test-Change` trailer — worker-protocol:15, implement-issue:57
- (c) Nit, no test, no issue — check-issue:51, :57
- (d) Fix routed to check.repair — check-issue:51
- (e) refused unless prerequisite rig leaf in `blocked-by` or narrowed — shapes.md:286, standing-design:10, chart-issues:69
- (f) allowed: existing runner plus temp-repo fixture setup is not machinery — plan-issue:63, standing-design:10
- (g) stop, never a workaround — routes through the base-run rule (`implement-issue:38`/`74`), ending `failed` on base-red or incomplete base run; the daemon-never-starting case is exactly the unsuitable-environment stop.

## Known limitations / unverified

- Prose-rule leaf: no executable tests added (wording tests are rejected by the rules themselves); verification is the per-criterion reads, sweep and classification above.
- `check-issue:53` "A new test needs no cited source" kept deliberately: it governs review of diffs, where the planner's added files correctly carry no source citation. Design note carried for review.
- Worker-3 judgment call J1: deleting :55 also removed "Look-alike code alone is not a Fix" and "these triggers add no review rerun" — they lived inside the deleted paragraph and had no independent home; flagged for review.
- `merge-issue:51` retains the case-add trailer sentence ("citing no source") — that line belongs to frozen-test-guard and stays.
- Criterion 6's runner-config check is judgment-level (visible in the diff B already reads), the held disagreement from frozen-test-guard F2 — recorded in plan.md.
