# Review B: named-targets

Date: 2026-10-09
Phase: check.review (initial blind review)
Base: 4534a569205c3903bcfd56145e74ec8caa4197d5
Reviewed head: f91a268c2b259e6bc0d804deca8bef8a9474949c
Verdict: fix

## Fixes

### F1: Guide commands fail for the guide's same-name issue and leaf

Source: the operator follows `docs/guide/next.md:11-16` to start the leaf, or `:65-70` to start it after unpark, using the widgets layout documented in `docs/guide/parts.md:23-35`: `issues/open/export-csv/export-csv/state.yaml`.

Trace: both examples run `akrogon next export-csv` from the repository root. Discovery produces the `export-csv` issue candidate and the `export-csv` leaf candidate. The new `resolveName` branch at `src/next.ts:1181-1200` refuses both, correctly implementing the collision contract. An isolated registered CLI fixture using the exact documented folder names returned code 1 and these matches:

```text
Ambiguous target "export-csv":
issue issues/open/export-csv
leaf issues/open/export-csv/export-csv
```

Consequence today: the guide's start and restore/start instructions do not start the documented work. The new path example at `next.md:34` explains the resolution but leaves the executable examples contradictory.

Criterion/gap: A7 / brief done-criterion 7, correct operator guidance for same-name targets. This behavior change breaks previously valid examples in the affected target documentation.

Repair: use the documented folder path in the same-name start examples, or clearly ground a distinct slug example in the larger layout where it is unique. Keep parking commands unchanged. No prose-assertion test is needed. Before/after command evidence is sufficient for this documentation Fix.

## Verification

Read the brief, locked design, plan and implementation report before the diff, plus the check-issue ponytail reference. Debate is disabled and there are no positions-B/rebuttal-B artifacts. Did not read the peer review.

Reviewed all four changed files and the complete commit range. Followed `docs/reference-index.md`, the changed behavior's `docs/guide/next.md` and `docs/guide/parts.md`, discovery, repository resolution, path precedence, missing-name handling and selection-before-lock wiring. No AREA.md file is changed, so no changed-area path listing is required.

Code and tests meet A1-A6: open owners derive from valid discovered leaf ancestors, closed leaf slugs remain eligible, folders retain precedence, owner/leaf collisions refuse before locking or allocation, worktrees retain registered-root resolution, and empty/unreadable inputs retain existing handling. Tests cover all four required collision shapes, state preservation and absent allocation side effects. Existing expectations were not changed or deleted.

Accepted implementation/report.md evidence for the unchanged reviewed head: whole configured test command 550 pass / 0 fail, changed test gate 246 pass / 0 fail, typecheck clean, format completed with unrelated base status.ts drift restored, and docs-links 3 pass / 0 fail. Report records deliberate-break red/green proof for owner equivalence, collision refusal, closed-owner exclusion and index-independent owners. Regression guards appropriately remain green on base. No code change or missing check evidence required a full rerun.

Specific documentation concern independently checked:

- Ran the actual `next export-csv` CLI against an isolated registered repository populated with the exact guide layout. Code 1 and both candidate paths confirmed F1. Fixture and temporary script were removed.
- `bun test tests/next.test.ts -t 'ambiguous name refuses an issue and its same-name leaf' --timeout=30000`: 1 pass, 0 fail, 8 assertions. This verifies that the refusal is intentional and the repair belongs in the guide.
- Worktree remained clean and HEAD stayed f91a268c2b259e6bc0d804deca8bef8a9474949c.

## Test-Change trailers

The `src/test-files.ts` rule matches `tests/next.test.ts`. Both test-touching commits carry trailers:

- 6dd031634c43fb322f023c59479a53db2c75b670: `Test-Change: tests/next.test.ts added T1-T6 named-target cases; no existing expectation changed`. Valid: additions implement brief criteria 1-6 and plan T1-T6, with no old assertion/fixture deletion or change.
- f91a268c2b259e6bc0d804deca8bef8a9474949c: `Test-Change: tests/next.test.ts prettier reflow of added helpers; no expectation changed`. Valid: reflows only newly added helpers, with no semantic or existing-expectation change.

## Nits and operator actions

None.

## 2026-10-09 check.repair

Read both initial reviews at f91a268. A recorded no Fixes. Repaired the only Fix, F1, in commit `d149dc5e3f8550f44d3c662e952059294cd3137c` (`docs: use folder paths for same-name next examples`). Both start examples in `docs/guide/next.md` now use `akrogon next issues/open/export-csv/export-csv`. Parking commands remain unchanged. No plan/design changes, handed-to-A work or operator actions remain.

Before/after evidence: ran both commands through the actual CLI on an isolated registered fixture with the guide's `issues/open/export-csv/export-csv` layout and fake Herdr. The old bare input exited 1 and listed the issue and leaf as ambiguous. The corrected folder path exited 0 with empty stderr and delivered `plan-issue export-csv slot=A phase=plan.synthesis leaf=<fixture>/issues/open/export-csv/export-csv`. Removed the temporary script and fixture after the proof. The repair touches no test file, so no Test-Change trailer applies.

Required checks after the repair:

- `bun run format`: exit 0. Only the already documented, pre-existing src/status.ts drift was rewritten. Restored that formatter-created unrelated change after inspecting its diff. No owned source or test change.
- `bun run typecheck`: exit 0.
- `bun test --timeout=30000`: exit 0, 550 pass / 0 fail, 5854 assertions, 26 files, 42.67s.
- `AKROGON_BASE=4534a569205c3903bcfd56145e74ec8caa4197d5; : "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000`: exit 0, 197 pass / 0 fail, 1804 assertions, 1 file, 24.17s. Current Bun selected tests/next.test.ts for the four changed files.

Done-criterion proof: the passing full and changed-file runs include owner name/path equivalence from root/subfolder/worktree (A1), open/closed leaf slugs (A2), folder shadowing (A3), all four ambiguity shapes and no allocation effects (A4), closed owner exclusion and path selection (A5), index-independent owners plus empty/unknown/parked/unreadable handling (A6). A7 confirmed by reading both guide pages, listing the epic/issue name, collision, and same-name path lines with rg, the actual corrected-command proof above, and all 3 docs-links tests passing in the full suite.

All Fixes are repaired. No additional reusable Nit is held by B. No merge_checks were run. Final repair diff is exactly two command replacements in docs/guide/next.md. Worktree clean at d149dc5 before phase handoff.

## 2026-10-09 solo merge

Attempt: da0e0332-5592-4cc6-bc5d-c3c07be3d30e.
Prior reviewed/repaired head: d149dc5e3f8550f44d3c662e952059294cd3137c.
Old base: 4534a569205c3903bcfd56145e74ec8caa4197d5.
Fetched origin and rebased onto origin/main at 5608188a9093b3dbbf00a151596c1d5d3d2ab407.
Resolved head: b168ca73f42252a8bfd20000ddeecdbd105e2bf2.

Conflict: tests/next.test.ts had append-at-end additions from both blocked-report on main and named-targets. Retained both complete blocks, removed only conflict markers, and continued the rebase. No existing assertion or fixture was changed or deleted. Remaining commits applied without conflict. The range-diff shows identical code/docs commits and only append-site context changes in the test commits, with all Test-Change trailers retained. Full output: implementation/merge-range-diff.txt, produced by `git range-diff 4534a569205c3903bcfd56145e74ec8caa4197d5..d149dc5e3f8550f44d3c662e952059294cd3137c 5608188a9093b3dbbf00a151596c1d5d3d2ab407..b168ca73f42252a8bfd20000ddeecdbd105e2bf2`.

Refreshed AKROGON_BASE through akrogon config after rebase: 5608188a9093b3dbbf00a151596c1d5d3d2ab407. merge_covers is empty and merge_checks is empty. Running all four configured checks on the rebased head. Format exited 0 and again touched only the known unrelated status.ts formatting drift, restored after inspecting the change. Typecheck exited 0. Test logs: implementation/merge-test.log and implementation/merge-changed.log.

Merge checks complete on b168ca73f42252a8bfd20000ddeecdbd105e2bf2: full `bun test --timeout=30000` exited 0, 595 pass / 0 fail, 6224 assertions, 29 files, 77.23s. Changed-file check with refreshed AKROGON_BASE exited 0, 210 pass / 0 fail, 1890 assertions, one file, 44.58s. Both runs reached terminal results. Format and typecheck also exited 0 as recorded above. No advisory or merge_checks commands configured. Worktree clean. Gathered next-named-targets/ISSUE.md and both named-targets/brief.md and blocked-report/brief.md; blocked-report is already merged, so this landing can complete the standalone issue.

`merged --check --attempt da0e0332-5592-4cc6-bc5d-c3c07be3d30e` returned `ok`. The completion call under the same attempt exited 0 and printed `moved merged` and `issue complete next-named-targets`. Remote read-back (`git ls-remote origin refs/heads/main`) confirms b168ca73f42252a8bfd20000ddeecdbd105e2bf2 on main. The command moved the completed issue to issues/closed/next-named-targets. Ran broadcast-issue once for that completion using the configured two targets. Sender exited 0 and reported delivery to DISCORD_WEBHOOK_URL and DISCORD_WEBHOOK_URL_2.
