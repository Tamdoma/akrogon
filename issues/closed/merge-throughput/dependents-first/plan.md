# Plan: dependents-first

Direct synthesis. `debate: "no"` in `state.yaml`, no positions or rebuttals exist. Source: brief.md, design.md (queue-order fork 1a verbatim), live `src/turn.ts` `mergeQueue`, `src/next.ts` `sweep`/`dispatchLeaf`, `src/status.ts`, `src/phase.ts`, `tests/batch-dispatch.test.ts`, `tests/status.test.ts`, `tests/helpers.ts`.

## Read-first

- `docs/reference-index.md`, `src/AREA.md`, `tests/AREA.md`, `learnings/LESSONS.md`
- `src/turn.ts` (`unmergedDeps`, `eligibility`, `mergeQueue`, `QueueEntry`)
- `src/next.ts` (`sweep` ~771-783, `dispatchLeaf` ~636-721, `mergeTurn` ~958+, `mergePass` ~1224)
- `src/state.ts` (`stateSchema`: `merge_stamp`, `batch`, `blocked-by`; `allLeaves`, `leavesUnder`)
- `src/status.ts` (`mergeQueue` call and `TURN` column rendering, ~83-165)
- `src/phase.ts` (`mergeQueue` holder refusal, ~771)
- `tests/helpers.ts` (`fixture`, `cli`, `fakeHerdr`, `leaf`, `yaml`)
- `tests/fake-herdr.ts` (`prompts` array for dispatch order assertions)
- `tests/status.test.ts` (`cell`, `leafRow`, `mergeRecord`, TURN tests ~776-810)
- `tests/batch-dispatch.test.ts` (`toMerge`, `dispatchFixture`, `saveDatabase`, `expectedPrompt` ~40-90)
- `docs/guide/merge.md` paragraph 2, `docs/guide/next.md` "How order is decided" ~113-140

## Needed interfaces

- `dependentCounts(leaves: Leaf[]): Map<string, number>` — new exported function in `src/turn.ts`, shared by `mergeQueue` and `sweep` (one implementation, no duplicate, per design).
- Existing: `Leaf`, `State.batch`, `merge_stamp`, `blocked-by`, `discover(repo, invocation).leaves`, `allLeaves(repo)`, `readLog`, fake-herdr `db.prompts` (`{ pane, text }` in delivery order).

## Decisions

- D1: `dependentCounts` in `src/turn.ts` counts, per leaf slug, the distinct leaves with `phase !== 'merged'` that wait on it directly or transitively through `blocked-by`. Built by inverting `blocked-by` edges among unmerged leaves only, then traversing dependents outward from each slug with a `seen` set. Merged leaves are neither counted nor traversed through: a merged slug stops blocking propagation because `unmergedDeps` treats it as satisfied. Parked, missing and unreadable slugs are absent from `leaves` and contribute no edges. Cycles are unreachable in the sorts (every cycle member stays blocked, so it never enters `mergeQueue` eligibility and never dispatches); the `seen` set makes traversal terminate anyway.
- D2: `mergeQueue` sort keys, in order: a leaf with `state.batch !== undefined` first (the recorded holder keeps place 1 — brief criterion 2), then dependent count descending, then the existing `time` ordering (`merge_stamp`, else last `to: merge` log record, else last), then slug. `QueueEntry` fields and `eligibility` are unchanged; the holder refusals in `phase.ts` and the TURN column in `status.ts` inherit the new order with no edits.
- D3: `sweep` in `src/next.ts` adds one sort key inside the existing comparator: `Number(b merged) - Number(a merged)` unchanged first (the brief's "merged first at dispatch" tie), then dependent count descending, then implicit stable-sort order (the discovery order the leaf list already carries — that is today's order, kept for ties). Counts come from `dependentCounts(discover(repo, invocation).leaves)` so traversal sees the full repo graph, not only the swept subset.
- D4: One shared `dependentCounts` call per `mergeQueue`/`sweep` invocation, returned as a `Map`; callers read `counts.get(slug) ?? 0`. No caching across calls — leaf state changes between passes and the sets are small.

Brief and design agree. No conflict note. Exclusions held per design: no aging rule, no change to `merge_stamp` writes (`src/phase.ts:152`), no interface change to `QueueEntry`/`mergeQueue` signatures.

## Acceptance

- C1: Repo with `x` in `merge` stamped later, `y` in `merge` stamped earlier, `d1` `blocked-by: [x]`, `d2` `blocked-by: [d1]` (both unmerged, no batch records): `akrogon status` places `x` before `y` (TURN `holder` vs `2`).
- C2: Same graph plus a `batch` record on `y`: queue lists `y` first.
- C3: `x` whose only dependents are `merged` sorts as having none: `y` stays first.
- C4: Two dispatch-ready leaves (no unmerged deps): the one with more waiting dependents is prompted first in a swept `akrogon next` pass; `fake-herdr` `prompts` order proves it.
- C5: `akrogon status` TURN places follow the new order, and `docs/guide/merge.md` and `docs/guide/next.md` describe it.
- C6: All configured `checks` pass.

Open limitation, kept: dependent counts ignore parked leaves and slugs not present as leaf folders (they have no discoverable `blocked-by`, so they cannot wait transitively either); leaves blocked under `issues/closed` without `phase: merged` still count, matching unmerged semantics.

## Units

### Wave 1

#### U1: count function, queue re-sort, dispatch order

- Owns: `src/turn.ts`, `src/next.ts`
- Shared test resource: none
- Needs first: none
- Does: add exported `dependentCounts` per D1; extend the `mergeQueue` comparator per D2; add the count key to `sweep`'s comparator per D3 using a full-repo `discover` set. No other logic, no schema changes.
- Done when: `bun run typecheck` passes and the comparators read exactly as D2/D3 on review.

#### U2: docs

- Owns: `docs/guide/merge.md`, `docs/guide/next.md`, `docs/guide/state.md`
- Shared test resource: none
- Needs first: none (wording is fixed by the brief; independent of the code diff)
- Does: `merge.md` paragraph 2 — the merge turn is held by a leaf with a batch record, otherwise by the eligible leaf with the most unmerged direct-or-transitive dependents through `blocked-by`, ties by merge stamp then last `to: merge` record then slug; `next.md` "How order is decided" — a swept pass attempts ready leaves with more waiting dependents first, ties in scan order, merged first unchanged; `state.md` line ~50 — `merge_stamp` now tie-breaks the dependent-count ordering rather than ordering alone. `docs/guide/limits.md` reviewed: "no priority field" stays true (this ordering is automatic, not a field) — no edit.
- Done when: both named guide pages describe count-then-existing-tie order; `bun test tests/docs-links.test.ts` stays green.

U1 and U2 share Wave 1: disjoint owned paths, no shared test resource, no dependency.

### Wave 2

#### U3: tests

- Owns: `tests/dependents-first.test.ts` (new file, matching the feature-named test-file pattern)
- Shared test resource: none (own temp fixture per test)
- Needs first: U1
- Does, one test per criterion using `fixture`/`leaf`/`fakeHerdr`/`saveState`/`cli`:
  - C1: `x` merge stamp `'2026-09-12T00:00:00Z'`, `y` stamp `'2026-09-11T00:00:00Z'`, `d1` and `d2` as above; `akrogon status` output row cells assert `x` = `holder`, `y` = `2` (reuse the `cell`/`leafRow` pattern from `status.test.ts`).
  - C2: same graph, `y` carries a minimal valid `batch` record (`attempt`, `built_on`, `holder {base, head}`, `members: []`, `applied: true`, seeded via `saveState` — the `stateSchema` fields in `src/state.ts`); `y` = `holder`, `x` = `2`.
  - C3: `x`'s dependents all `phase: merged`; `y` = `holder`.
  - C4: `few` (no dependents) and `many` (`d1` `blocked-by: [many]`, `d2` `blocked-by: [d1]`, both blocked and unallocated) at a dispatchable phase, run `akrogon next --all` through the fake herdr; assert `db.prompts` index of the `plan-issue many` prompt is lower than the `plan-issue few` prompt. Slug names make the unmodified discovery order visit `few` first, so the test is red without the change.
- Done when: each new test fails on the pre-change code (deliberate break: remove the count or batch comparator key) and passes after; `bun test --timeout=30000` stays green.

## Implementation notes

2026-10-10, found during implementation:

- U1 mismatch F1: two existing fixtures blocked their dependent only on the intended batch member (`tests/batch-dispatch.test.ts` `['m2']`, `tests/pause-next.test.ts` `['member']`), so under the locked ordering the member rightly takes the hold and the tests read `holder.batch` undefined. Repaired by A by blocking the dependent on member and holder: counts tie, the earlier stamp keeps the hold, member-dependency coverage preserved. Refines D2's tie rule; no locked decision changed.
- `dependentCounts` never counts a leaf for itself: the `reached` set is seeded with the candidate slug before traversal, so a cycle member contributes 0 to itself. Clarifies D1's cycle clause.

## Docs

- `docs/guide/merge.md`: merge-turn ordering paragraph rewritten per U2.
- `docs/guide/next.md`: "How order is decided" gains the dependents-first sweep sentence.
- `docs/guide/state.md`: `merge_stamp` wording corrected to tie-break role.
- `docs/guide/limits.md`: reviewed, no change (automatic ordering is not a priority field).
- `skills/merge-issue/SKILL.md`: reviewed, no change — it names the holder/refusal mechanics, not the sort.
- README, `src/AREA.md`, `tests/AREA.md`, `docs/guide/phases.md`, `docs/guide/status`-adjacent pages: no ordering description to update.

## Credentials

Design names no variable by name; `readiness.yaml` `inputs`/`produces`/`grants` are empty and `akrogon status dependents-first` shows no `Missing:` lines. No human-only blocker.

## Verification

Not a slow-run leaf; no restart boundaries.

- C1/C2/C3 proofs: `bun test tests/dependents-first.test.ts --timeout=30000 -t "<queue case>"` catches a wrong primary sort key, a missing batch-record override, or merged dependents counted. Size: seconds each. Rerun when `mergeQueue` or `dependentCounts` changes.
- C4 proof: `bun test tests/dependents-first.test.ts --timeout=30000 -t "<dispatch order case>"` catches a missing or reversed count key in `sweep`, or counting only the swept subset. Size: seconds. Rerun when `sweep` or `discover` changes.
- C5 proof: same status tests plus diff review of the three doc files; `bun test tests/docs-links.test.ts --timeout=30000` catches broken anchors/links. Size: seconds. Rerun when the docs text or headings change.
- C6 proof: `bun run typecheck`, `bun run format`, `bun test --timeout=30000`, and `: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000`. Size: seconds for typecheck/format, minutes for the full suite. Rerun before handoff.

No `merge_checks` and no extra whole-suite requirement beyond the brief's `checks`.
