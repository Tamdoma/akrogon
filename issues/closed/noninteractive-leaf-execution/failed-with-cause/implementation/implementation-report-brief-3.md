# Implementation report: Brief 3 status note for failed leaves

All 3 criteria verified by the new test passing under the changed-tests command. Scenarios use `fixture` temporary repositories; no herdr calls.

## Changed files and reasons

- src/status.ts: `note()` prepends `failed` or `failed <cause> <reason>` for phase `failed`, and builds `busy` only when phase is not `failed`/`merged`. Implements D8 NOTE text and terminal busy suppression.
- tests/status.test.ts: added `failed leaves show cause and reason in NOTE and terminal phases suppress busy` covering criteria 1-3 via `leaf` + `cli status` + `cell`/`leafRow` NOTE assertions.

## Tests run

Command (from worktree root):
: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" with AKROGON_BASE=43ef0f7a7cb8908df33a734bbdee406b1563d408

Result: 168 pass, 0 fail, 2319 expect() calls, Ran 168 tests across 5 files.

```
tests/status.test.ts:
(pass) overview reads multiple repos outside git, retains hierarchy and recorded fields without writes [46.44ms]
(pass) age is unavailable for missing, empty, unrelated and future history and uses file order [211.39ms]
(pass) overview reports no open leaves for a missing open directory without writes [35.26ms]
(pass) overview reports no open leaves for a empty open directory without writes [33.20ms]
(pass) incomplete repositories report exact paths before readable trees and exit nonzero [416.01ms]
(pass) repo mismatch identifies both keys in overview and detail while healthy repos remain visible [75.54ms]
(pass) overview rejects repo mismatches and duplicate slugs within an open repo [73.27ms]
(pass) detail resolves authoritative closed state from a worktree, limits history, and never reads prose or writes [130.53ms]
(pass) busy durations appear in NOTE for every recorded seat without writes or herdr calls [39.27ms]
(pass) status reports invalid open/ while showing another repo without writes [103.74ms]
(pass) status reports invalid open/invalid while showing another repo without writes [97.20ms]
(pass) status reports invalid open/epic/issue/extra/invalid while showing another repo without writes [108.54ms]
(pass) status identifies dormant issue/resting and prefers open or closed leaves [182.58ms]
(pass) status identifies dormant epic/issue/resting and prefers open or closed leaves [183.30ms]
(pass) --charts lists every chart with taken counts, fog items, stage and age [85.47ms]
(pass) --charts derives stage from last terminal marker line [65.28ms]
(pass) failed leaves show cause and reason in NOTE and terminal phases suppress busy [37.96ms]

 168 pass
 0 fail
 2319 expect() calls
Ran 168 tests across 5 files. [48.84s]
```

Red-green (filtered run `bun test tests/status.test.ts -t "failed leaves show cause"`):
- Red before `note()` edit: `Expected to contain: "failed blocked needs api key" / Received: "busy A 1h02m"`, 0 pass 1 fail.
- Green after edit: `(pass) failed leaves show cause and reason in NOTE and terminal phases suppress busy`, 1 pass 0 fail.

Typecheck: `bunx tsc --noEmit` exits 0.

## Known limitations

None known.

## Unverified criteria

None.
