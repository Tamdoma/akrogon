# Plan: wave-table

Debate was off. This plan is written directly from `brief.md` and `design.md`. No conflict between them. No credential is named, so no env check applies.

## Decisions

- D1. Wording only. No `src/`, no state field, no clock, no count beyond the existing cap of 3 (design Q1 1a, Q2 2a).
- D2. A wave is a set of up to 3 units that share no owned path, share no test resource (a live fixture, account or test site counts) and depend on no other member of the same wave.
- D3. "No prerequisite" means no unmet prerequisite and no dependency on another member of the same wave. A landed prerequisite never keeps a unit out of a wave. A unit whose prerequisite is in an earlier wave goes in a later wave. Units needing the same landed prerequisite can share that later wave.
- D4. plan.synthesis writes the checklist grouped into waves. Each unit lists its owned paths, its shared test resource and the units that must land first.
- D5. In delegated mode A runs each plan wave whole, up to 3 workers at once, once its prerequisites have landed, and waits on all of them together. Only three reasons keep a unit out of a wave: an unmet prerequisite (later wave), a shared owned path, a shared test resource. No other reason splits a wave.
- D6. "one at a time when unsure" is deleted everywhere under `skills/` and `docs/`.
- D7. A plan with no wave grouping is grouped by A from the sub-brief records. Sub-brief records carry the plan's wave values; A groups from the records only when the plan has none. Record fields stay unchanged.
- D8. Inline mode follows wave order, then listed order inside a wave.
- D9. check.fix repair sub-briefs are grouped by the same rule: findings with disjoint paths and no shared resource repair in one wave.
- D10. `proof-order` edits other sentences of `worker-protocol.md:11` and `implement-issue/SKILL.md`. No ordering between the leaves. Edit only the sentences named below so a later rebase stays clean.

## Read first

- `skills/plan-issue/SKILL.md` line 55
- `skills/implement-issue/worker-protocol.md` line 11
- `skills/implement-issue/SKILL.md` lines 3, 44, 66
- `skills/implement-issue/brief-template.md` line 21
- `skills/AREA.md` line 21
- `docs/guide/phases.md` lines 77, 87
- `docs/reference-index.md`, `learnings/LESSONS.md` (2026-10-01 line: no wording tests; 2026-09-11 line: grep `docs/` for a changed rule)

## Interfaces

None in code. The only shared vocabulary is the existing sub-brief records at `brief-template.md:21`: chunks that must land first, owned paths, shared test resource.

## Checklist

All units touch different files, share no test resource and have no prerequisite. They are listed as one wave of 3 by the same rule, but the whole leaf is prose and small enough to implement as one pass of three workers or inline. Ordering matters only for consistency review at the end (U4).

### Wave 1

- U1. Plan side. Owns `skills/plan-issue/SKILL.md`. Shared resource: none. Lands first: none.
  - Rewrite the "ordered file/criterion checklist" clause of line 55 to a checklist grouped into waves. Each unit lists owned paths, shared test resource and units that must land first. State D2, D3 and the cap of 3. Keep the rest of the line, including the sentence on affected docs, unchanged. (Criterion 1)
- U2. Implement side. Owns `skills/implement-issue/worker-protocol.md`, `skills/implement-issue/SKILL.md`, `skills/implement-issue/brief-template.md`. Shared resource: none. Lands first: none.
  - `worker-protocol.md:11`: replace only the opening wave sentence with D5, D7 and the three reasons. Delete ", one at a time when unsure". Leave the rest of the line as is. (Criterion 2)
  - `implement-issue/SKILL.md:44`: delegation clause says A runs each plan wave whole, up to 3 workers at once, waits on all together. Delete "one at a time when unsure". Inline clause says wave order, then listed order inside a wave (D8). (Criterion 2)
  - `implement-issue/SKILL.md:66`: check.fix paragraph states D9. (Criterion 3)
  - `brief-template.md:21`: closing sentence says the records carry the plan's wave values and A groups from them only when the plan has no wave grouping (D7). (Criterion 2)
  - Line 3 description needs no change (still true).
- U3. Docs side. Owns `skills/AREA.md`, `docs/guide/phases.md`. Shared resource: none. Lands first: none.
  - `skills/AREA.md:21`: describe plan-grouped waves of up to 3 independent units run whole. (Criterion 4)
  - `docs/guide/phases.md:77`: "ordered checklist" becomes a checklist grouped into waves with owned paths, shared test resources and prerequisites. (Criterion 4)
  - `docs/guide/phases.md:87`: planned waves of up to 3 independent workers run whole. (Criterion 4)

### Wave 2

- U4. Verification. Owns no files. Lands first: U1, U2, U3.
  - Read the changed sentences against criteria 1 to 4. Grep for the deleted phrase and for stale wave wording. Run checks. Fix any disagreement in the file that owns it.

## Agent and human docs affected

- Agent docs: `skills/plan-issue/SKILL.md`, `skills/implement-issue/SKILL.md`, `skills/implement-issue/worker-protocol.md`, `skills/implement-issue/brief-template.md`, `skills/AREA.md`.
- Human docs: `docs/guide/phases.md`.
- `docs/reference-index.md` needs no change (no new file or area).

## Verification

| Criterion | Proof command | Failure caught | Size | Rerun trigger |
|---|---|---|---|---|
| 1 | Read `skills/plan-issue/SKILL.md:55`; `grep -nE "wave" skills/plan-issue/SKILL.md` shows the wave clause with owned paths, shared test resource, prerequisites, shared-wave condition, later-wave placement, cap 3 | A missing element of the wave rule | seconds | Any edit to that file |
| 2 | `grep -rn "one at a time when unsure" skills docs` prints nothing (exit 1); read the three implement-issue files against What items 2-3 | Deleted phrase left behind, missing reasons, fallback grouping or inline order | seconds | Any edit under `skills/implement-issue/` or `docs/` |
| 3 | Read the check.fix paragraph of `skills/implement-issue/SKILL.md` | Repair briefs not grouped by the wave rule | seconds | Any edit to that paragraph |
| 4 | Read `skills/AREA.md:21`, `docs/guide/phases.md:77,87` against criteria 1-2; `grep -rniE "ordered checklist" docs skills` has no stale hit | Docs contradict the skills | seconds | Any edit to those files or to U1-U2 text |
| 5 | `bun run format`, `bun run typecheck`, `bun test`, and `AKROGON_BASE=2b796e98a2da6f914332e736974b93a0bc645715 bun test --changed="$AKROGON_BASE"` | Format drift, broken docs links (`tests/docs-links.test.ts`), any regression | minutes | After the last edit |

No wording test is added (design; LESSONS 2026-10-01). Not a slow-run leaf, so no restart boundaries.

## Known limitation

A leaf with a long real dependency chain can still run over 2h (design Q1 1a). Success is measured afterwards as worker wait width per phase, outside this leaf.
