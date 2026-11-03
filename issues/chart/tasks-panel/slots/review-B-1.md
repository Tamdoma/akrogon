# Direct review B, round 1

Verdict: **fix**

Base: `44482211fff2190ac8fed39fa14a49fce40b9ab7`  
Reviewed head: `c0add61266655bef850e24ed6f4dce3b991017db`  
Worktree: `/home/ivan/.akrogon/worktrees/akrogon/tasks-look`

## F1: Quiet repos lose their charts

**Fix.** `herdr-app/tasks/model.js:185–187` reduces every healthy repo without leaves to its name, discarding its charts from the board model. `main.js` renders charts only through `model.repos`; the quiet summary is plain text with no expand action. The base had an expandable folded repo row exposing those charts.

Actual source: a successful live `akrogon status --json`, passed unchanged into the reviewed `board()` implementation. It contains charts for seven repos now represented only in `quiet`, including `akrogon` (with `tasks-panel`), `blepsis` (`hidden-tabs`, `linux-op-failures`) and `lingua-relay`. Only `framework` and `herdr-setup` remain in `model.repos`. Opening Tasks therefore makes those seven repos' charts inaccessible. The before/after side screenshots also show the chart-bearing repo rows disappearing.

This breaks the binding closed `tasks-mod/brief.md` outcome of folded charts per repo and `tasks-mod/design.md` decision 5a, both explicitly retained by `direct/brief-7.md` section 1. The new quiet-line API and default summary can stay, but there must still be a reachable way to expand these repos' charts. Add a regression check for charts belonging to a quiet repo.

Evidence, read back with `akrogon log`:

`check review-B-quiet-source: 0 /home/ivan/Work/infra/akrogon/issues/chart/tasks-panel/direct/check-review-B-quiet-source-1793736384205-236912.log`

## Verification

Reviewed all four changed files, the binding brief/design and look decisions, the Tasks entry in `src/AREA.md`, and the documentation index. No AREA file or documentation changed. HEAD matches the supplied SHA and the worktree is clean:

`check review-B-final-inspect: 0 /home/ivan/Work/infra/akrogon/issues/chart/tasks-panel/direct/check-review-B-final-inspect-1793736591058-251155.log`

The direct holder has no `plan.md` or `report.md`. `direct/brief-7.md` supplies the commands and criteria. Its retained logs and live shots provide sufficient verification to judge this diff, so the missing filenames are not a separate Fix.

Read the retained proof logs with `akrogon log`:

- `bun test tests/tasks-mod.test.ts tests/tasks-mod-host.test.ts`: 19 pass, 0 fail, 65 assertions. `direct/check-u7-tests-1793736156482-222937.log`.
- `bun run typecheck`: passed. `direct/check-u7-typecheck-1793736159125-223191.log`.
- `herdr-app check herdr-app/tasks`: passed. `direct/check-u7-modcheck-1793736159238-223569.log`.

`direct/check-tests-red-before-code-1793735642716-196213.log` shows the three planned cases failing before implementation. The green test run follows the latest test change. The diff adds no skips, filters or runner changes. No proof-command correction was found. Existing green checks were not repeated.

Inspected `direct/live/before-side.png`, `after-side.png`, `after-side-open.png`, `after-full-expanded.png` and `after-full-folds.png`. The changed hierarchy, aligned rows, matching folds, seat letters/logos, red failed row and wrapped expanded failure reason are visible. F1 remains visible in the quiet summary. No live desktop mutation was needed for this review.

## Test-Change trailers

Commit `17252e6970e1336488b0dfa816328672fef9a878` has the only trailer:

> Test-Change: tests/tasks-mod.test.ts the fold test now expects every repo with no open leaves in one quiet line instead of one line each (operator 2026-11-03 on the live board: "It just looks really bad, the entire UI", D5 "yes" to one line for repos with no open tasks); two cases added, no other expectation changed

Accepted against `direct/brief-7.md` criterion 1, which explicitly requires the new quiet API. That API change does not require losing access to charts. The two added cases implement the other stated model outcomes.

No additional Nits or operator actions.
