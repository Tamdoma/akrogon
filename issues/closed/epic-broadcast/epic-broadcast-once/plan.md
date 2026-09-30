# Plan: epic-broadcast-once

Direct synthesis by slot A. The leaf has `debate: "no"`, so no positions or rebuttals exist.

## Read first

- `issues/open/epic-broadcast/epic-broadcast-once/brief.md` and `design.md` in the registered checkout `/home/ivan/Work/infra/akrogon`.
- `src/phase.ts` `completeOwner` (lines 138-173), callers at line 126 (`justMerged: true`), line 282 and `src/next.ts:521` (`justMerged: false`), plus `src/state.ts` `withLock`, `findLeaf`, `leavesUnder`.
- `tests/phase.test.ts` completion test (~169-191) and private-sources test (~566-650), `tests/helpers.ts` `fixture`, `cli`, `leaf`, `fakeGh`.
- `docs/reference-index.md`, `src/AREA.md`, `tests/AREA.md`, `skills/AREA.md`, `learnings/LESSONS.md` in the worktree.
- `skills/merge-issue/SKILL.md`, `skills/broadcast-issue/SKILL.md`, `docs/guide/merge.md`, `docs/guide/cheat.md`, `docs/guide/idea.md`, `README.md` for wording hits.

## Decisions

- **D1. Scope:** change only the `completeOwner` print, `tests/phase.test.ts` expectations, and wording in 2 skills plus 4 docs. No change to `closeSources` timing, the `justMerged` parameter, recovery callers, the Discord sender, the `gh` stub, or anything under `issues/`.
- **D2. Print rule:** delete `if (justMerged) console.log(`issue complete ${basename(issue)}`)` before the completion guard. After the remaining-sources closure and before `if (!complete) return;`, print only when `complete && justMerged`: `issue complete <basename(owner)>` when `owner === issue`, else `epic complete <basename(owner)>`. Closure order and the folder move stay as they are.
- **D3. Concurrency:** keep the existing `withLock` serialization in `src/state.ts`. No new lock. Exactly-once holds because two concurrent final merges run in order and only the second sees every owner leaf merged.
- **D4. Tests:** extend the existing completion and private-sources tests in `tests/phase.test.ts` with the `cli(...)` fixture harness. No new harness, no live Discord or GitHub call. Update printed-line asserts, add negative asserts for inner silence, concurrent final print, and recovery silence. `tests/next.test.ts:844,1007` stay unchanged.
- **D5. Merge trigger:** `merge-issue` gathers the completion owner's briefs before the folder may move (every leaf brief under the epic when the leaf has one), runs `akrogon phase <slug> merged --slot B`, and runs `broadcast-issue` in the same session only when that invocation prints `issue complete` or `epic complete`.
- **D6. Wording:** every skill and guide states one broadcast per completed standalone issue or completed epic, never per inner issue or per leaf. The `docs/guide/merge.md` completion example shows both lines and the silent inner case.
- **D7. Verification:** targeted `tests/phase.test.ts` runs first, then `bun run format`, `bun run typecheck`, full `bun test`, and the `grep -rn "issue complete" docs skills README.md` sweep.

## Interfaces

Stdout lines `issue complete <issue>` and `epic complete <epic>`, each alone on its line. Consumed only by the merge-issue skill. No new flags, no state schema change.

## Acceptance criteria

- **C1.** Epic of two issues: merging every leaf of the first prints neither `issue complete` nor `epic complete`; merging the last leaf of the second prints `epic complete <epic>` exactly once.
- **C2.** Two final leaves of one completion owner merged concurrently: exactly one invocation prints the completion line.
- **C3.** Standalone issue still prints `issue complete <issue>` on its last merge; `tests/phase.test.ts` standalone asserts and `tests/next.test.ts:844,1007` pass unchanged in that respect.
- **C4.** Recovery paths (`merged` retried on a merged leaf, `akrogon next` completing a merged leaf) print no completion line; repeated `merged` stays refused with no completion line.
- **C5.** Source-closure asserts pass unchanged (private sources close when their inner issue finishes, remaining sources close at epic completion); only printed-line expectations change to the new rule.
- **C6.** `merge-issue` runs `broadcast-issue` only on `issue complete` or `epic complete` and gathers the completion owner's briefs before `merged`.
- **C7.** `broadcast-issue`, `docs/guide/merge.md`, `docs/guide/cheat.md:125`, `docs/guide/idea.md:89`, `README.md:188` describe one broadcast per completed standalone issue or completed epic; `grep -rn "issue complete" docs skills README.md` shows no line claiming an inner issue triggers a broadcast.
- **C8.** `bun run format`, `bun run typecheck`, `bun test` pass.

## Ordered execution checklist

1. **A1 — `src/phase.ts` `completeOwner`:** apply D2, keep closure order and move. Satisfies C1-C4.
2. **A2 — `tests/phase.test.ts`:** update completion test (~169-191) and private-sources test (~566-650) to D4; add inner-silent, concurrent-final, and recovery-silence asserts. Satisfies C1-C5. Leave `tests/next.test.ts` unedited for C3.
3. **A3 — `skills/merge-issue/SKILL.md`:** trigger broadcast-issue only on `issue complete` or `epic complete`; gather completion owner's briefs before the move. Satisfies C6.
4. **A4 — `skills/broadcast-issue/SKILL.md`:** one factual message per completed standalone issue or completed epic, after either completion line. Satisfies C7.
5. **A5 — `docs/guide/merge.md`:** show both completion lines, silent inner issue, and one broadcast per standalone issue or epic. Satisfies C7.
6. **A6 — `docs/guide/cheat.md`:** broadcast-issue row reads as a completed-issue-or-epic update. Satisfies C7.
7. **A7 — `docs/guide/idea.md`:** broadcast step reads as reporting the completed issue or epic. Satisfies C7.
8. **A8 — `README.md`:** broadcast-issue row reads as a completed-issue-or-epic update. Satisfies C7.
9. **A9 — Handoff:** run concrete verification, review the scoped diff, remove iteration helpers, commit before review. Satisfies C8.

## Concrete verification

From the leaf worktree:

```sh
bun test tests/phase.test.ts
bun test tests/next.test.ts
grep -rn "issue complete" docs skills README.md
bun run format
bun run typecheck
bun test
```

Concrete scenario: fixture with `epic/first` holding leaves `one`, `two` and `epic/second` holding `three`. Merge `one` and `two` concurrently, assert neither prints a completion line and `issues/open/epic` stays. Merge `three`, assert stdout contains `epic complete epic` once and `issues/closed/epic` exists. Merge a standalone leaf, assert `issue complete standalone`.

## Done-criterion proof map

| Criterion | Proof command | Failure it catches | Size | Rerun trigger |
| --- | --- | --- | --- | --- |
| 1. Epic two-issue scenario | `bun test tests/phase.test.ts` | inner issue prints, or epic line missing/duplicated | minutes | `src/phase.ts` or `tests/phase.test.ts` changes |
| 2. Concurrent final merges | `bun test tests/phase.test.ts` | zero or two completion lines under race | minutes | `src/phase.ts` or `tests/phase.test.ts` changes |
| 3. Standalone unchanged | `bun test tests/phase.test.ts tests/next.test.ts` | standalone line lost or renamed | minutes | `src/phase.ts` changes |
| 4. Recovery silence | `bun test tests/phase.test.ts` plus `bun test tests/next.test.ts` | retry or `next` prints, or repeated `merged` accepted | minutes | `src/phase.ts` or `src/next.ts` changes |
| 5. Source closure unchanged | `bun test tests/phase.test.ts` | private/remaining close timing changed | minutes | `src/phase.ts` or `tests/phase.test.ts` changes |
| 6. Merge skill trigger | `grep -n "issue complete\\|epic complete\\|briefs" skills/merge-issue/SKILL.md` plus read | stale single-line trigger or per-issue briefs | seconds | `skills/merge-issue/SKILL.md` changes |
| 7. Broadcast wording | `grep -rn "issue complete" docs skills README.md` plus read of the 5 files | inner issue still claimed to broadcast | seconds | any skill, doc, or `README.md` change |
| 8. Checks pass | `bun run format`, `bun run typecheck`, `bun test` | format, type, or suite regression | minutes | before handoff |

## Open limitations

- **L1. Silent recovery:** when the first `merged` throws during source closure, no line prints, and the later `akrogon next` retry uses `justMerged: false`, so the owner completes with no broadcast. The closed folder is the only signal. A recovery completion signal is outside the locked scope.

## Dependencies

None. No ordering beyond the checklist order. No credentials; the design names no variable, so no env presence check applies.

## Implementation notes

2026-09-30 check.fix round 1 (review-B F1): completion asserts must not require unrelated progress wording. Assert successful exit codes plus the completion contract alone: absence via `not.toContain` on each completion line, exact value and count via isolating `complete` lines and `toEqual`. This refines D4; locked decisions, criteria strength on the completion contract, and all other checklist items are unchanged. No production change.
