# Implementation report: known-red-pass

Base: `483c693` (origin/main at implement end; prior base `c55432b`). Committed head: `b9bc11e`.
Refresh: `git fetch` mid-pass found `origin/main` moved `c55432b → 483c693` ("plan-issue: expiring expectations…"); clean rebase replayed the four branch commits, prior head `91c3f14` → rebased head `16ecd33` (later `b9bc11e` after the prettier commit). No conflicts; the landing touched only `skills/plan-issue/SKILL.md`, outside this leaf's paths.

## Changed files and reasons

- `src/verify.ts` — `compares: z.string().optional()` on `verifyRunSchema`; run body extracted to `runOnce(repo, caller, sha, scope, akrogonBase, compares?)`; `--known-red` reuses the newest completed red run for the tree/scope or runs the head first, computes `git merge-base <sha> <trackingRef>`, runs the base fresh with `AKROGON_BASE=baseSha` and `compares=<head run>`, and prints `verify known-red <sha>: pass|fail` exiting 0 only on pass; `requireGreenReceipt` accepts a qualifying linked pair after `greenRun` fails, with the refusal text unchanged.
- `src/flaky.ts` — `failedTests` exported unchanged (D6); `flips` keeps base runs as real observations (D7).
- `src/akrogon.ts` — `'known-red': { type: 'boolean' }` and trailing `knownRed` parameter (D1).
- `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md`, `skills/merge-issue/SKILL.md` — the "every commit on the default branch passed `akrogon verify`" sentences replaced by the known-red step: one retry stays red and no cause in the diff → `akrogon verify --known-red` (`--attempt <id>` at merge) → read head and base logs of each red command for runner completeness and causal fit → record the judgment in the report or review → exit 0 counts as passing only when that judgment agrees (worker commit `8719c85` → `16ecd33`).
- `skills/chart-issues/SKILL.md` — landing step 3 routes a no-cause red through `akrogon verify --holder <chart>/direct --known-red` before direct-guards; only a failing known-red result or disagreeing judgment is a blocking landing-check failure.
- `src/AREA.md` — verify command and receipt lines name `--known-red` and `compares`.
- `tests/helpers.ts` — `seedRun(f, Partial<VerifyRun>)` seeder added; `greenReceipt` delegates to it.
- `tests/verify.test.ts` — new cases: qualifying leaf pair end-to-end (criteria 1+4), head-only failure refusal (2), the pair-refusal matrix through `requireGreenReceipt` (3), plain-verify regression guard (6).
- `tests/receipt-gates.test.ts` — qualifying/non-qualifying merge-scope pair through `merged --check` and `direct-guards.ts` (5).
- `tests/docs-links.test.ts` — doc-contract cases for the seat-skill and chart-issues wording (7, 8).

Wave structure: 1 wave, units u1 (code) and u2 (skills/docs), disjoint paths. Worker commits `9abc490` and `8719c85` cherry-picked to `1f2a765` and `16ecd33`; both worker worktrees removed.

## Commands run and proof results

Planned tests were committed first at `91c3f14` (red, recorded in plan.md). All proofs ran on the committed head after the rebase (`16ecd33`/`b9bc11e` family); sizes were seconds unless noted.

- `akrogon run-check --name proof-verify -- bun test tests/verify.test.ts` → `check proof-verify: 0` `implementation/check-proof-verify-1792228753857-1183284.log` — 20 pass (criteria 1,2,3,4,6).
- `akrogon run-check --name proof-gates -- bun test tests/receipt-gates.test.ts` → `check proof-gates: 0` `implementation/check-proof-gates-1792228748119-1183286.log` — 5 pass (criterion 5).
- `akrogon run-check --name proof-skills -- bun test tests/docs-links.test.ts` → `check proof-skills: 0` `implementation/check-proof-skills-1792228748217-1186388.log` — 7 pass (criteria 7,8).
- `akrogon run-check --name proof-flaky -- bun test tests/flaky.test.ts` → `check proof-flaky: 0` `implementation/check-proof-flaky-1792228748378-1186555.log` — 3 pass (D7 consumer unchanged).
- `akrogon run-check --name proof-keep -- bun test tests/keep-rule.test.ts` → `check proof-keep: 0` `implementation/check-proof-keep-1792228750163-1186729.log` — 3 pass (D8 consumer unchanged).
- `akrogon verify` (first run on `16ecd33`) → red: `format` failed on prettier drift in `tests/helpers.ts`/`tests/verify.test.ts` (cause in the diff — repaired with `prettier --write`, commit `b9bc11e`); `test` 1001 pass, `typecheck` 0.
- `akrogon verify` on `b9bc11e` → `verify leaf b9bc11e…: green`, receipt `verify-runs.jsonl` run `87ae425a`-era second run; logs `implementation/check-test-1792229060335-1636376.log`, `check-typecheck-1792229062414-1636376.log` (format log in the same run record). Wall time: `test` ≈145s, `typecheck` ≈2s, whole `verify` ≈150s.

Worker-cited checks folded in: `check u1-gates: 0`, `check u1-flaky: 0`, `check u1-keep: 0`, `check u1-typecheck: 0`, `check u2-docs: 0` in this leaf's `implementation/`; u1's `check u1-verify` went 0 after A's test correction (`24dca88`).

## Worker return and A corrections

- u2's `u2-typecheck: 2` was reproduced on the pristine tree (`check u2-typecheck-baseline: 2`) — pre-existing, caused by the new tests referencing `compares` before u1 landed; resolved once both chunks were on the lane (`typecheck: 0` in the final verify).
- M1 (planned-test defect, corrected by A in `24dca88` with `Test-Change:` trailer): the criterion-1 test selected the seeded base receipt by `sha === base` instead of the fresh run; now selects `compares === headRun.run` and asserts `sha === base`.
- u2 limitation noted: implement-issue's `check.fix` line "a red rerun is never handed to `check.review`" concerns the merge-ending reproducing-command rerun, not the known-red gate; left as-is by design.

## Known limitations

- One fresh base run per `--known-red` call while main is red (accepted cost in the locked decision).
- A new break inside an already-red unit can land unseen (accepted cost).
- No operator notice or repair owner for a red main — `main-red-notice`/`expiring-time-rule` scope.
- `src/AREA.md` sits at 44 lines, over the 40-line guide; it was already over before this leaf (net-zero line change here).

## Unverified criteria

None. All eight done-criteria carry the proofs above.

## check.fix round 1 (2026-10-17)

B's check.review found F1–F4; B's check.repair repaired F1, F2 and F4 (`538f404`+`3cacd39`, `1c4341a`+`af71335`, `60b30f3` docs) and handed two test-expectation corrections to A. Base unchanged `483c693`; repair head `60b30f3` → this pass's head `c9f658b`.

A's repairs (commit `c9f658b`):
- B F3: prose-string expectations removed from `tests/docs-links.test.ts` (`'Every commit on the default branch passed'`, `'failing known-red'`, the bare `--known-red` substring check); executable command literals `akrogon verify --known-red`, `akrogon verify --attempt <id> --known-red`, `verify --holder <chart>/direct --known-red` kept — the test-file rule's allowed class.
- B follow-up: `tests/command-reference.test.ts` verify contract updated to `[--sha <rev>] [--attempt <id>] [--holder <dir>] [--known-red]`, matching the README usage B added in `60b30f3`. Its red-before state is B's cited `verify` log `check-test-1792229442063-2111444.log` (1 fail, the `--known-red` contract difference) on `60b30f3`.

Proofs after A's repairs:
- `akrogon run-check --name fix-docs-tests -- bun test tests/docs-links.test.ts tests/command-reference.test.ts` → `check fix-docs-tests: 0` `implementation/check-fix-docs-tests-1792229509895-2560308.log` (13 pass).
- `akrogon verify` on `c9f658b` → `verify leaf c9f658b…: green`; 1003 pass in `implementation/check-test-1792229661545-2560575.log`, `typecheck` in `implementation/check-typecheck-1792229663640-2560575.log`, format log in the same run record. Wall time ≈150s.

B's re-check confirms F1/F2/F4 repairs; A F1 was folded into B's docs commit `60b30f3` (README + setup/phases/merge guides).
