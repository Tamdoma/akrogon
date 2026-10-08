# Plan: hand-built-removal

Debate: no. This plan is synthesized directly from brief.md and design.md against the live worktree at `f57bb35`.

## Read first

- `docs/reference-index.md`, `src/AREA.md`, `tests/AREA.md`, `skills/AREA.md`
- `learnings/LESSONS.md`. Relevant lines: sweep prose for the old term, not only the code path (2026-09-14). Prefer refusal and side-effect assertions over wording (2026-10-01).
- `src/state.ts:60-87` (strict `stateSchema`, field at :69)
- `src/turn.ts:6-23` (`Block` union, `eligibility`, which `mergeQueue` uses)
- `src/next.ts:600-650` (dispatch branch at :611, `failed` returns `waiting` at :626, a missing `blocked-by` slug throws at :636)
- `src/status.ts:359` (unreadable diagnostic line `{unreadable, path, error}`)
- `tests/status.test.ts:279-300` (pattern for asserting the unreadable diagnostic)
- `docs/guide/next.md:42-50` (`akrogon park <issue>` wording)

## Decisions

- D1. Delete `hand_built` from `stateSchema`. The schema is already `strictObject`, so a stored `hand_built` key fails like any unknown key. Do not add it to any lazy-migration or legacy-key list, because that would make it readable again (criterion 1).
- D2. Delete the `{ kind: 'hand-built' }` variant from `Block` and its branch in `eligibility` (`src/turn.ts:6,9`). Delete the `state.hand_built` branch in dispatch (`src/next.ts:611-614`). No other code reads the field or the `'hand-built'` kind (checked by grep).
- D3. Tests that asserted hand-built behavior are deleted with the reason "field removed". Tests that guard other behavior keep running with the field replaced:
  - `tests/next.test.ts:530`: drop the `manual` leaf and its refusal assertion, rename the test to drop "hand-built". Dependency, capacity and unknown-pane coverage stays.
  - `tests/next.test.ts:4088`: drop the `hand_built` arm. The loop collapses to one `blocked-by` test with the same assertions.
  - `tests/next.test.ts:2013, 2035, 2179, 3629, 3680`: the `waiting` sibling exists only to keep the epic unfinished and undispatched. Replace `{ hand_built: true }` with `{ 'blocked-by': ['hold'] }` and add `leaf(f, 'hold', 'failed', {}, 'other')`. A failed leaf is never dispatched (`src/next.ts:626`), and the dependency must exist because a missing slug throws under `--all` (`src/next.ts:636`).
  - `tests/batch-dispatch.test.ts:421`: `zz` only holds `m1` back. Change it to `leaf(f, 'zz', 'failed', {}, 'other')`, the same pattern as `tests/next.test.ts:4096`.
  - `tests/status.test.ts:791`: `manual` is an ineligible merge leaf. Replace `{ hand_built: true }` with `{ 'blocked-by': ['hold'] }` plus a `hold` leaf in phase `failed`, so TURN stays empty for a real ineligible case.
  - `tests/state.test.ts:59`: remove `hand_built: true` from the `supported` state. The lazy-migration test keeps its purpose.
- D4. Criterion 1 proof is one CLI-boundary test in `tests/status.test.ts`. Remove `hand_built: true` from the `broken` fixture at :99 and the `not.toContain('hand_built')` line at :145, because making `broken` unreadable would void every other assertion in that test. Add a new test: a leaf with `hand_built: true` makes `akrogon status` exit non-zero and print the `{unreadable, path, error}` diagnostic naming that leaf's `state.yaml`, with `error` mentioning `hand_built`. A readable sibling leaf stays visible. Note for review: design.md says the :99/:145 fixture "becomes" this case. The plan keeps that intent with a separate test instead of converting the shared fixture.
- D5. Prose edits, removing the term and not just the code path:
  - `skills/chart-issues/SKILL.md:59`: delete the clause "; the distinct operator choice `hand_built` cannot replace completing known prerequisites". The sentence ends after "before opening a leaf."
  - `skills/chart-issues/assets/shapes.md:167`: delete ", separately from any `hand_built` choice".
  - `skills/chart-issues/assets/shapes.md:259`: delete the sentence "Emit `hand_built: true` only for that explicit operator choice, otherwise omit the field."
  - `docs/guide/state.md:32,47-58`: remove the bullet, the second example and its trailing line. Replace them with one line saying that to keep work away from agents, park its issue with `akrogon park <issue>`, which removes the whole issue from the open queue (see next.md). Park acts on issues, not single leaves, so the guide must not imply per-leaf parking.
  - `docs/guide/problems.md:12`: "Confirm the leaf's issue is not parked."
- D6. Criterion 4 is checked read-only with grep, no `akrogon status` and no fetch. Pre-check at plan time over every `repos` root's `issues/{open,parked,closed}` returned no hits. A hit at implement time is an operator migration on main, not a leaf write.
- D7. `origin/main` is one commit ahead (`27adeef`, touches `src/state.ts` and `tests/batch-dispatch.test.ts` but not `hand_built`). Line numbers here are from `f57bb35`. The merge rebase handles it. No action in this leaf.

## Checklist

### Wave 1 (two parallel units)

- U1. Code and tests.
  - Owns: `src/state.ts`, `src/turn.ts`, `src/next.ts`, `tests/state.test.ts`, `tests/status.test.ts`, `tests/next.test.ts`, `tests/batch-dispatch.test.ts`.
  - Shared test resource: none (temp fixtures only).
  - Depends on: nothing.
  - Covers D1-D4, criteria 1 and 2.
- U2. Skill and guide prose.
  - Owns: `skills/chart-issues/SKILL.md`, `skills/chart-issues/assets/shapes.md`, `docs/guide/state.md`, `docs/guide/problems.md`.
  - Shared test resource: none.
  - Depends on: nothing.
  - Covers D5, criterion 3.

After both: run D6 grep and record its output in the implementation report (criterion 4).

### Docs affected

- `skills/chart-issues/SKILL.md`: drop the hand_built clause.
- `skills/chart-issues/assets/shapes.md`: drop two hand_built mentions.
- `docs/guide/state.md`: replace hand_built with `akrogon park <issue>`.
- `docs/guide/problems.md`: drop "or marked hand_built".
- No other agent or human doc mentions the field (grep over `src`, `tests`, `skills`, `docs`, `plugin`, `README.md`).

## Verification

| Criterion | Proof command | Failure it catches | Size | Rerun when |
|---|---|---|---|---|
| 1 | `bun test tests/status.test.ts --timeout=30000` (new D4 test) | schema still accepts `hand_built`, or it was added to a lazy-migration list | seconds | `src/state.ts` or status scan changes |
| 2 | `grep -rn "hand_built\|hand-built" src tests` returns nothing, plus `bun test tests/next.test.ts tests/batch-dispatch.test.ts tests/state.test.ts --timeout=30000` | a leftover branch or `Block` kind, or a replaced fixture that now dispatches the held leaf | minutes | `src/next.ts`, `src/turn.ts` or those tests change |
| 3 | `grep -n "hand_built" skills/chart-issues/SKILL.md skills/chart-issues/assets/shapes.md docs/guide/state.md docs/guide/problems.md` returns nothing, and `grep -n "akrogon park" docs/guide/state.md` returns a line | stale prose, or the guide no longer names park | seconds | any of the four files changes |
| 4 | `for r in <roots from akrogon config repos>; do for s in open parked closed; do [ -d $r/issues/$s ] && grep -rl hand_built --include=state.yaml $r/issues/$s; done; done` returns nothing | an existing record that the stricter schema would make unreadable | seconds | before merge |
| all | `bun run typecheck`, `bun run format`, `AKROGON_BASE=f57bb35 bun test --changed="$AKROGON_BASE" --timeout=30000` | type errors from a removed field or union variant, format drift | minutes | any source change |

No restart boundaries are needed. Every check is fast and repeatable.

## Open limitations

- A leaf someone marks `hand_built` after this lands becomes unreadable until the key is removed. This is the intended behavior per the design.
