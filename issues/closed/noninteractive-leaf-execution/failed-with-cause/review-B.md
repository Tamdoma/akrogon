# Review B: failed-with-cause

Base: `43ef0f7a7cb8908df33a734bbdee406b1563d408`
Reviewed head: `d0582362b8e09a4e3dab997308e3c3bc9dc467a4`

## Verification evidence

- Read the full diff `43ef0f7...d058236` across all 12 files; traced `transition`, `commitMove`, `activeCount`, `dispatchLeaf`, `dispatchSlot`, `note()` against plan D1–D10 and the design's binding decisions.
- Verified `Bun.YAML.stringify({a:1, failure: undefined, b:{}})` → `"{a: 1,b: {}}"`: `failure: undefined` drops the key, so restart removes the record and the schema's optional field parses cleanly. The phase test also asserts `state.yaml` has no `failure:` line after restart.
- Traced every `saveState` caller: all preserve `failure` via spread; only `commitMove` sets/clears it. The `recorded` path in `transition` keeps `failure` while phase stays `failed` (correct for the two-seat restart no-op).
- Confirmed stop-path ordering: routing legality → `--reason` misuse → rebuttal guard (skipped for `failed`) → required/done slot validation → stop path → guards. `--slot` is required exactly on two-seat phases and refused when not required or already done; `merge` infers A.
- Confirmed `requireNoIssueFiles` still runs on `blocked` restarts (only `requireClean` is skipped), matching the brief.
- Confirmed `slot ?? required[0]` and `reason as string` are type-level fallbacks only: the stop path is unreachable from `failed` (routing) and `reason` is validated two lines above. Not defects.
- Confirmed `failed -> check.fix` works through the existing barrier (`required=['B']`, `done` cleared on stop, slot inferred) and `failed -> merged` stays illegal.
- Confirmed `dispatchLeaf` skips `observeBusy` for `failed` before the notification branch, so a blocked pane cannot recreate busy fields; `activeCount` matches the design's literal unreadable-branch formula.
- Full suite evidence from report: 239 pass / 0 fail; typecheck clean. New tests are CLI-level with real git worktrees and fake herdr at the boundary — no mocks of the unit under test, no prose-wording assertions beyond fixed strings (`moved failed`, error fragments).
- AREA.md check: no `AREA.md` files in the diff, so no path-existence pass required. The stale line is recorded as N1 below.

## Findings

### Nits

- N1: `src/AREA.md` still claims "Every phase move rejects a dirty worktree and branch changes under `issues/`". After this change a `failed` stop and a `cause: blocked` restart deliberately skip the clean check. The design's owned list excludes `AREA.md` and the plan flags it as a known limitation, but the line now states a false invariant for the file it documents; a one-line correction belongs in this leaf or a follow-up.

No Fix findings. All seven brief done-criteria have direct test coverage; both `attempts` producers record the typed failure; capacity, observation-skip and status display behave as specified.

## Verdict

nits
