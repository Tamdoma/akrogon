# Review B: readiness-contract

Date: 2026-10-02
Phase: check.review (initial, blind)
Base: `b2c15ec5d2fe889e158934b084dd93cfeafc9f72`
Reviewed head: `fb10e25cbef34924462ba7b16d76971177b8605d`
Verdict: **fix**

## Fixes

### F1: Detail status suppresses required gaps for merged leaves

- Location: `src/status.ts:53`, reached by `statusCommand`'s detail branch; `tests/status.test.ts:679-681` asserts the incorrect behavior.
- Source and trace: an operator runs `akrogon status <slug>` for a merged leaf whose retained `readiness.yaml` declares an absent input. `findLeaf` resolves open or closed records, the detail branch calls `leafGaps`, and its merged-phase condition returns an empty list without computing gaps.
- Consequence today: detail status omits the missing input and its operator steps. Overview suppression is correct, but detail suppression violates plan D8 and the explicit limitation that merged/closed detail still prints gaps. The report also claims that required behavior is implemented.
- Evidence: a command reproduction using the existing registered-repository fixture, a merged `closed-needs-file` leaf and a contract declaring absent `required.pem` returned exit 0. Its output contained `phase: merged`, then `History:`, with no `Missing:` line. Required output is `Missing: repo/closed-needs-file file required.pem in repo: restore required.pem` before `History:`. This is the scenario explicitly named by the plan, so it blocks independently of the fixture's handcrafted input.
- Repair: restrict merged-leaf suppression to overview scanning. Detail must compute gaps regardless of phase. Replace the detail test's absence assertion with a presence assertion, preserve overview suppression, and correct the report if needed.

## Verification

- Read the plan, locked design, implementation report, skill and ponytail guidance before inspecting the whole seven-file diff. Debate is disabled, so no B positions or rebuttal exist.
- Inspected schema fields against the literal design, holder resolution against `readRepo`, dispatch gate placement and side effects, status error reporting, and tests against the done-criteria. No additional concrete defect found.
- Reran `bun test tests/status.test.ts --timeout=30000` for the merged-detail concern: **22 pass, 0 fail**, 284 assertions. The suite is green because it explicitly expects the defect identified by F1.
- Ran the merged-detail command reproduction described above. Fixture cleanup completed, and the worktree remained clean.
- Accepted existing report evidence for unchanged reviewed head: full suite **380 pass, 0 fail**, typecheck clean, format applied and committed, changed tests passing. No unrelated reruns were needed.
- Opened `docs/reference-index.md`, `docs/guide/next.md`, `docs/guide/state.md`, and the README command references. No existing documented behavior changed: dispatch still considers eligible work and status still shows the board or leaf history.
- Live `src/AREA.md` path listing from the repository root: `src/akrogon.ts`, `src/preflight.ts`, `src/config.ts`, `src/init.ts`, `src/phase.ts`, `src/shell.ts`, `src/readiness.ts`, `issues/`, `docs/reference-index.md`, and `tests/helpers.ts` all exist. Its command references also resolve to existing files.

## Nits and operator actions

None.

## 2026-10-02 check.repair

Repaired F1. Read both initial reviews for `fb10e25`; A recorded no Fixes or operator actions. No items are handed to A.

- Test commit: `820ed82d2042735b0dcf8b5a484be776228edd93` (`test: require merged leaf gaps in status detail`). The test declares absent `required.pem`, verifies overview suppression, requires the gap before `History:` in merged detail, and then archives the record and requires the same gap in closed detail.
- Before fix: `bun test tests/status.test.ts --test-name-pattern='merged leaves' --timeout=30000` exited 1, **0 pass, 1 fail**. Failure: expected `Missing: repo/done-ready file required.pem in repo: restore required.pem`; received merged state followed by `History:` without that line.
- Fix commit: `6403e0ca376262f93efbe1fc961c2c80b344091a` (`fix: show merged leaf readiness gaps in status detail`). `leafGaps` computes gaps independent of phase. Overview applies the merged exclusion when printing gap lines, preserving contract validation during scanning.
- After fix: the identical targeted command exited 0, **1 pass, 0 fail**, 8 assertions. Both open and closed merged-detail checks passed.

Required checks on repaired head:

| Command | Result |
|---|---|
| `bun test --timeout=30000` | 380 pass, 0 fail, 17 files, 4276 assertions |
| `bun run typecheck` | exit 0 |
| `bun run format` | exit 0, every file unchanged |
| `AKROGON_BASE=b2c15ec5d2fe889e158934b084dd93cfeafc9f72 bun test --changed=b2c15ec5d2fe889e158934b084dd93cfeafc9f72 --timeout=30000` | 190 pass, 0 fail, 3 files, 1751 assertions |

Done-criteria proof: both suites ran `tests/readiness.test.ts` (criteria 1–2: schema and holder resolution), `tests/next.test.ts` (criteria 3–4 and 6: missing-input gate, absolute holder, invalid contract), and `tests/status.test.ts` (criterion 5: gap content, placement, and no secret values). The repaired merged-detail scenario also passed. No merge checks were run.

Final repair diff contains only `src/status.ts` and `tests/status.test.ts`. Worktree is clean. The implementation report's merged/closed-detail limitation now matches behavior.

Repair outcome: **ready**. No open Fixes, operator actions, or handoffs remain.

## 2026-10-02 merge verification

- Prior reviewed/repaired head: `6403e0ca376262f93efbe1fc961c2c80b344091a`.
- Fetched `origin` and rebased onto `origin/main` at `39cb4c0b020af3dc784c7473d08937f9007c2b3f` without conflicts.
- Refreshed `AKROGON_BASE` through `akrogon config`: `39cb4c0b020af3dc784c7473d08937f9007c2b3f`.
- Rebased head: `7c1567dbed492608e8cc104999c401b85d6db408`.
- Range comparison `git range-diff b2c15ec5d2fe889e158934b084dd93cfeafc9f72..6403e0ca376262f93efbe1fc961c2c80b344091a 39cb4c0b020af3dc784c7473d08937f9007c2b3f..7c1567dbed492608e8cc104999c401b85d6db408`: all six commits are equivalent (`=`), including F1's test and fix.
- `bun run format`: exit 0, all files unchanged.
- `bun test --timeout=30000`: exit 0, **383 pass, 0 fail**, 17 files, 4294 assertions.
- `bun run typecheck`: exit 0.
- Configured changed-tests command with refreshed `AKROGON_BASE`: exit 0, **190 pass, 0 fail**, 3 files, 1753 assertions.
- No merge checks or advisory commands are configured. No outstanding changes, Fixes, operator actions, or B-held reusable Nits remain.
- Gathered the completion owner's `ISSUE.md` and all five leaf briefs before the completion command could move the folder.
- `git push origin HEAD:main`: exit 0, confirmed fast-forward `39cb4c0..7c1567d` to remote `main`.
- `akrogon phase readiness-contract merged --slot B`: printed `moved merged`. No issue/epic completion marker was printed, so no broadcast was sent.
