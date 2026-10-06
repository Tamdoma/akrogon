# Plan: merge-turn-order

Debate is off (`debate: "no"` in state.yaml). Synthesized directly from brief and design. No credentials are named by the design; `akrogon status merge-turn-order` printed no `Missing:` lines, so no operator blocker.

## Decisions

- D1 `src/turn.ts` (new) owns the merge turn. It exports `eligibility(global, leaf, leaves): Block | null` (hand-built, unmerged or missing dependencies, or readiness gaps — the same checks `dispatchLeaf` applies at `src/next.ts:594-632`, not duplicated) and `mergeQueue(global, leaves, log): QueueEntry[]` (`{ leaf, place, noRecord }`, eligible `merge`-phase leaves ordered by `merge_stamp`, missing stamp falling back to the leaf's last `to: merge` record in the log, then slug; a leaf with neither sorts last by slug with `noRecord: true`). It imports `state.ts`, `readiness.ts`, `log.ts` only, so `next.ts`, `phase.ts` and `status.ts` can all import it without a cycle.
- D2 `merge_stamp` is an optional string field on `stateSchema` in `src/state.ts`, written inside `commitMove` (`src/phase.ts:97-125`) when `to === 'merge'`, on every entry path (seat, repair, operator recovery). ISO strings sort lexicographically; it persists on exit and is overwritten on re-entry, which matches the spec.
- D3 `logSchema`/`LogRecord`/`readLog` move from `src/status.ts` into `src/log.ts` (which already owns the log format). `status.ts` and `turn.ts` both import them; nothing reads the log format twice.
- D4 Holder gate in `dispatchLeaf` (`src/next.ts:585-638`): after the existing eligibility checks and before `seats()`/`allocate`, a `merge`-phase leaf whose slug is not `mergeQueue(...)[0]` returns `waiting`. It keeps its tab, panes and `max_active` slot because dispatch never touches them. A holder proceeds through the unchanged `dispatchSlot` path, so only B is prompted.
- D5 Guard in `phaseCommand` (`src/phase.ts:316-335`), under the lock after `findLeaf`: for a leaf in `merge` that is not the holder, refuse `merged` (with and without `--check`) and `check.fix`, naming the holder, or stating that no leaf is eligible when the queue is empty. `failed` is never refused. The refusal precedes `transition`, so it precedes the worktree guards (`requireClean`, trailers): a hand-prompted waiting seat is stopped before any check runs (done-criterion 5).
- D6 Committed-move signal: `commitMove` wraps any post-`saveState` failure (announce, rename, `completeOwner`, log append) in a new `MoveCommittedError` carrying `repo`, `to` and the cause. `phaseCommand` returns `{ repo, committed: true }` on a completed move, `{ repo, committed: false }` on recorded or refused outcomes, and lets `MoveCommittedError` propagate. `src/akrogon.ts` phase case then calls `mergeWake(repo)` in a `finally` whenever a move committed — on success and on `MoveCommittedError` — outside the lock (done-criterion 7). `next.ts` already imports `phase.ts` (`src/next.ts:55`), so `phase.ts` never imports `next.ts`.
- D7 `mergeWake(global, repo)` (exported from `next.ts`) runs `sweep` over that repo's `merge` leaves under the global lock, reports per-leaf errors to stderr through the existing `report`/`invocation.skipped` path, and never throws or changes the triggering command's exit code. Every `nextCommand` pass (`src/next.ts:761-862`) also ends with the same sweep over each repo the pass touched, inside the pass lock, covering hook passes and the capped-prompt-failure path (`commitMove` inside `dispatchSlot`, `src/next.ts:483-530`) that `akrogon.ts` never sees.
- D8 `akrogon status` gains a `TURN` column naming `holder` on the holder row and the queue place (`2`, `3`, …) on waiting rows, suffixed `no merge record` when `QueueEntry.noRecord`. Ineligible `merge` leaves and non-merge leaves get an empty cell. `cells`/`rows`/`widths`/`stacked`/`render` are extended for the extra column.
- D9 `skills/merge-issue/SKILL.md` makes `akrogon phase <slug> merged --slot B --check` the first act of a merge pass; the existing pre-push `--check` stays. Guide updates in `docs/guide/{merge,next,phases,limits,state}.md` only.
- D10 Existing multi-leaf `merge` tests in `tests/phase.test.ts` (completion/race cases at lines ~238, ~288, ~385) violate the one-holder rule once the guard lands; they are reworked to sequence holders (the order stamp/slug gives) while preserving their coverage of completion, sources and races.

## Read-first

- `brief.md`, `design.md`, `readiness.yaml`, `state.yaml` (leaf folder)
- `src/next.ts` (`dispatchLeaf` `585-638`, `sweep`/`sweepAll` `676-682`, `dispatchSlot` `483-530`, `nextCommand` `761-862`)
- `src/phase.ts` (`commitMove` `97-144`, `transition` `165-270`, `phaseCommand` `316-335`)
- `src/state.ts`, `src/readiness.ts`, `src/routing.ts`, `src/log.ts`
- `src/status.ts` (`readLog` `54-59`, `cells`/`header` `115-141`, `render`/`widths`/`stacked` `180-240`)
- `src/akrogon.ts` (phase case `50-54`)
- `tests/helpers.ts`, `tests/fake-herdr.ts` (recorded `prompts[]`, `waitScript`), `tests/next.test.ts`, `tests/phase.test.ts`, `tests/status.test.ts`
- `skills/merge-issue/SKILL.md`, `docs/guide/merge.md`, `docs/guide/next.md`, `docs/guide/phases.md`, `docs/guide/limits.md`, `docs/guide/state.md`
- `issues/chart/merge-turn/slots/merge-order-1d-merged.md` (step 1 and the "Applies here" line), `learnings/LESSONS.md` (prose-assertion lesson 2026-10-01: assert refusals/behavior, not wording)

## Interfaces

```ts
// src/state.ts
merge_stamp: z.string().optional()          // on stateSchema

// src/log.ts (moved, unchanged semantics)
export const logSchema; export type LogRecord; export function readLog(root: string): LogRecord[];

// src/turn.ts
export type Block = { kind: 'hand-built' } | { kind: 'deps' } | { kind: 'inputs'; missing: Gap[] };
export function eligibility(global: GlobalConfig, leaf: Leaf, leaves: Leaf[]): Block | null;
export type QueueEntry = { leaf: Leaf; place: number; noRecord: boolean };
export function mergeQueue(global: GlobalConfig, leaves: Leaf[], log: LogRecord[]): QueueEntry[];

// src/phase.ts
export class MoveCommittedError extends Error { repo: Repo; to: Phase }
phaseCommand(...): Promise<{ repo: Repo; committed: boolean }>   // throws MoveCommittedError
commitMove(..., onCommitted?: () => void)                         // optional hook at the commit point

// src/next.ts
export async function mergeWake(global: GlobalConfig, repo: Repo): Promise<void>;
```

`dispatchLeaf` keeps its explicit-mode error texts, reconstructed from `Block`.

## Checklist

### Wave 1

- U1 — `src/turn.ts`, `src/state.ts`, `src/log.ts`. Stamp field, committed `eligibility` + `mergeQueue`, `readLog` relocated. Owns: those three paths. No shared test resource. Lands first for U2, U3, U4.
- U8 — `skills/merge-issue/SKILL.md`, `docs/guide/merge.md`, `docs/guide/next.md`, `docs/guide/phases.md`, `docs/guide/limits.md`, `docs/guide/state.md`. First-step `--check` rule, holder/turn docs, stale "only manual next" sentence in limits. Owns: those paths. No shared test resource. Independent.

### Wave 2

- U2 — `src/phase.ts`. Stamp write in `commitMove`, `MoveCommittedError`, holder guard in `phaseCommand`, `{ committed }` result. Owns: `src/phase.ts`. Needs U1.
- U3 — `src/status.ts`. `readLog` import switch, TURN column end to end. Owns: `src/status.ts`. Needs U1.
- U4 — `src/next.ts`, `src/akrogon.ts`. Holder gate, `mergeWake`, end-of-pass merge sweep on every `nextCommand` path, `finally` wake in the `phase` case. Owns: those paths. Needs U1 and U2 (consumes `MoveCommittedError`).

### Wave 3

- U5 — `tests/phase.test.ts`. Stamp written on each move into `merge`; refusal of `merged`, `merged --check`, `check.fix` naming the holder; `failed` never refused; refusal precedes `requireClean` (assert refusal names the holder on a leaf whose recorded worktree is dirty); rework the multi-holder completion/race cases per D10. Owns: `tests/phase.test.ts`. Needs U2.
- U6 — `tests/next.test.ts`. Only the earlier-stamped leaf's B is prompted while the other keeps tab/panes; all five holder-exit paths (seat `merged`, `check.fix`, `failed`, capped prompt failure, operator `akrogon phase`) prompt the next B without a manual `next`, and a second pass prompts nobody; log-append failure after a committed move still prompts the next leaf (point `log.jsonl` at a directory); a returning leaf queues third. Owns: `tests/next.test.ts`. Needs U4, and `tests/helpers.ts`/`tests/fake-herdr.ts` edits if a helper is needed (assign this file pair to U6 only).
- U7 — `tests/status.test.ts`. TURN column: holder named, places listed, unstamped leaves ordered by log time, `no merge record` last. Owns: `tests/status.test.ts`. Needs U3.

Docs affected, one line each: `skills/merge-issue/SKILL.md` (first-step check); `docs/guide/merge.md` (turn, refusal); `docs/guide/next.md` (merge-phase dispatch order, end-of-pass sweep); `docs/guide/phases.md` (merge row: one holder); `docs/guide/limits.md` (line 11: completion now also wakes the next holder); `docs/guide/state.md` (`merge_stamp` field). README and other skills unaffected.

## Verification

| Criterion | Proof | Failure it catches | Size | Rerun trigger |
|---|---|---|---|---|
| 1 | `bun test tests/next.test.ts` — two-leaf scenario asserts only the earlier-stamped B got `agent prompt`, the waiter's panes untouched | gate missing or ordering wrong | minutes | `src/next.ts`, `src/turn.ts`, or the test changes |
| 2 | `bun test tests/status.test.ts` — table names holder and each place | TURN column absent/wrong | seconds | `src/status.ts` or the test changes |
| 3 | `bun test tests/next.test.ts` — hand-built, unmerged-dep and missing-input leaves never holder | eligibility leak | seconds | `src/turn.ts` or the test changes |
| 4 | `bun test tests/phase.test.ts` — refused `merged`/`--check`/`check.fix` name the holder; `failed` allowed | guard missing or over-broad | seconds | `src/phase.ts` or the test changes |
| 5 | `bun test tests/phase.test.ts` — refusal lands before worktree guards; `bun test tests/docs-links.test.ts` plus file diff shows the `--check` first step in `skills/merge-issue/SKILL.md` | late refusal, stale skill text | seconds | `src/phase.ts`, skill file, or tests change |
| 6 | `bun test tests/next.test.ts` — the five exit-path cases plus a redundant second pass | a wake path missing | minutes | `src/next.ts`, `src/akrogon.ts`, or the test changes |
| 7 | `bun test tests/next.test.ts` — `log.jsonl` append failure still wakes the next holder | wake skipped on post-commit error | seconds | `src/phase.ts`, `src/akrogon.ts`, or the test changes |
| 8 | `bun test tests/next.test.ts` + `tests/status.test.ts` — re-entering leaf is third | stamp not rewritten or order wrong | seconds | `src/phase.ts`, `src/turn.ts`, or tests change |
| 9 | `bun test tests/status.test.ts` + `tests/next.test.ts` — log-time ordering and `no merge record` row | fallback ordering wrong | seconds | `src/turn.ts`, `src/status.ts`, or tests change |
| Regression | `bun run typecheck`, `bun run format`, `AKROGON_BASE=<base> bun test --changed="$AKROGON_BASE" --timeout=30000`, then `bun test --timeout=30000` | broken neighbors, format, full-suite regressions | minutes | any code change |

Each `bun test tests/<file>.test.ts` run is an independent restart boundary; the fixture creates and removes its own repos, so a rerun needs no cleanup.
