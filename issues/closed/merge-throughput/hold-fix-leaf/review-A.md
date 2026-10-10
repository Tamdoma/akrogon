# Review A: hold-fix-leaf

Base `3fde73f`, reviewed head `5be5de7`. Diff `3fde73f..5be5de7`: 12 files, +251/-36.

## Verified

- `mergeHolder` (src/hold.ts:77-86) is used at all three holder-decision sites: `mergeTurn` (next.ts:989), `dispatchLeaf` gate (next.ts:702), `phaseCommand` authorization (phase.ts:790). `turn.ts` untouched; no import cycle.
- Lock discipline: `holdFixCommand` validates and writes under `.lock`; `mergeTurn` in-lock re-resolves the holder and re-checks staleness before building. The stale-hold drop precedes the queue-head fallback, so a fix leaf that lost the override never builds (verified in diff next.ts:1041-1056).
- Fix attempt: `fixHeld` skips member collection → `members: []`; `solo`/`applied` still derived from `fresh.state.solo`, so a solo-flagged fix leaf keeps the solo path and a normal fix leaf takes the full build/apply/push gate.
- Deliberate-break evidence (sa-4): removing `fixHeld` turned scenario 1 red and exposed `fix` becoming its own member — the test binds the skip, not just the holder selection.
- Tests: 5 new serial scenarios cover criteria 1-7; refusals assert unchanged `held.yaml` and state files; `merge_stamp` asserted; `unhold`-mid-attempt acceptance asserted. `command-reference.test.ts` contract entry present.
- AREA.md path listing: all named paths exist (checked src/akrogon.ts, preflight.ts, config.ts, init.ts, phase.ts, shell.ts, readiness.ts, hold.ts, next.ts, status.ts, turn.ts, tests/helpers.ts, docs/reference-index.md).
- Docs: README row matches contract; merge.md/next.md/SKILL.md sentences accurate against the code.
- Checks at implement end: 636 pass, typecheck clean, format clean (pre-existing `phaseColor` drift correctly reverted per the 2026-10-08 lesson).

## Findings

None at Fix level. Reviewed for these failure modes and found them handled:

- Hold cleared between `mergeHolder` resolution and the lock → in-lock `mergeHolder` re-check returns (holder not head).
- Fix leaf left `merge` between resolution and lock → `fresh.state.phase !== 'merge'` return.
- `hold-fix` on stale-but-present hold → write succeeds; next `mergeTurn` drops it by staleness. Authorized `phase F merged` then still gates on `finishPush`'s real base checks; matches design (override lives and dies with the record).
- Fix not in queue → `mergeHolder` falls back to head; head stays blocked by the hold guards, and phase authorization falls to head as before the leaf (no regression).
- `phase F merged` on a fix leaf with no batch record takes `transition('merged')` without a push — plan N1, pre-existing path, same exposure the queue head has; recorded, not a new defect.

## Verdict

`ready`.
