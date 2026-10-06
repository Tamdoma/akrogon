# Review A — merge-turn-order

Base `923c6c9`, reviewed head `b6f5e64` (9 commits). Plan `plan.md` decisions D1–D10; debate: no.

## What was checked

- `src/turn.ts`: `eligibility` mirrors `dispatchLeaf`'s checks without duplicating logic; `mergeQueue` ordering (stamp → last `to: merge` log ts → slug; no-record last) matches design D1/literal holder rule. `Map` last-write-wins equals `findLast` semantics.
- `src/phase.ts`: `merge_stamp` written on every `to === 'merge'` move incl. operator recovery (commitMove is the single funnel); `MoveCommittedError` preserves `log append failed` message for existing tests; guard in `phaseCommand` fires before `transition`'s worktree guards — verified by the missing-worktree test; `failed` untouched by the guard.
- `src/next.ts`: holder gate after eligibility, before allocation — waiting leaves keep tab/panes/slot; `dispatchLeaf` explicit messages preserved; `mergeWake` locked, reports via `skipped`, never throws except non-Error; `nextCommand` restructure keeps all branches and sweeps touched repos' merge leaves at pass end.
- `src/akrogon.ts`: `finally`-based wake covers both clean commits and `MoveCommittedError`; refusals/`recorded`/`--check` never set `committed`, so no spurious wake.
- `src/status.ts`: TURN cell = `holder` | place | ` no merge record` suffix; empty for ineligible/non-merge; width budget adjusted; `status <slug>` path untouched.
- Docs/skill claims verified against the code paths above; SKILL.md gate sentence precedes the rebase/checks paragraph.
- Live check: `bun src/akrogon.ts status` on this repo renders TURN and parses the full closed store — the new `leavesUnder(issues/closed)` scan introduces no regression on real data.
- Suite: `bun test --timeout=30000` — 432 pass, 0 fail (run after all units landed); `bun run typecheck` clean; `bun run format` committed.
- Re-checked `next.test.ts` exit-path cases: all five exit paths plus second-pass no-prompt assertion are present; the read-only `log.jsonl` variant exercises criterion 7's real path (post-commit append failure → `MoveCommittedError` → wake).

## Findings

Nit — `merge_stamp` accepts any string (`z.string().optional()`): a hand-edited empty or non-ISO stamp sorts wrong (empty string beats every timestamp). Only reachable by editing `state.yaml`, which `docs/guide/state.md` already warns against; deferred because no command path produces it. Promote to Fix if a future writer can set arbitrary stamps.

Nit — a corrupt `state.yaml` under `issues/closed` now fails the whole-repo `status` scan (and `phase merged`/`check.fix` guard via `allLeaves`), where previously only the open area was read. Reachable only by a corrupt/malformed closed record; live store parses clean today. Promote to Fix if schema drift in closed records becomes a real event.

Verdict: ready.
