# Brief: merge-turn-order unit U2 — phase.ts holder guard, merge stamp write, committed-move signal

Worktree: /home/ivan/Work/infra/akrogon/issues/worktrees/merge-turn-order-u2

## 1. Goal

Implement plan decisions D2 (write side), D5 and D6 in `src/phase.ts`: `commitMove` stamps `merge_stamp` on every move into `merge`, post-commit failures are distinguishable via `MoveCommittedError`, `phaseCommand` refuses `merged`/`check.fix` for non-holder leaves in `merge`, and reports whether a move committed.

Depends on U1 (already landed on the lane): `src/turn.ts` exports `eligibility`/`mergeQueue`, `src/log.ts` exports `readLog`, `src/state.ts` has `merge_stamp`.

## 2. Acceptance criteria

- AC1 Every move into `merge` through `commitMove` (seat `merge`, operator recovery `failed` → `merge`, any path) sets `after.merge_stamp` to the current ISO timestamp; moves to other phases leave it as-is.
- AC2 For a leaf in `merge` that is not the queue's first entry, `phaseCommand` throws naming the holder's slug for `merged` (with and without `--check`) and `check.fix`, before `transition` and therefore before `requireClean`/trailer guards. `failed` is never refused by this rule. When the queue is empty (no eligible leaf), the error says no leaf is eligible instead of naming a holder.
- AC3 A failure after `saveState` inside `commitMove` (announce, rename, `completeOwner`, or log append) propagates as `MoveCommittedError` carrying `repo` and `to`; the existing message text `Move to ${to} is committed, but log append failed:` is preserved verbatim inside that error.
- AC4 `phaseCommand` returns `{ repo, committed: true }` when a move committed, `{ repo, committed: false }` for `recorded`/refusal/`--check` outcomes; `MoveCommittedError` propagates (the caller wakes the queue).
- AC5 `bun run typecheck` passes; `AKROGON_BASE=923c6c98fac3f051a54ac27168ea024215652602 bun test --changed="$AKROGON_BASE" --timeout=30000` passes.

## 3. Read-first

- `src/phase.ts` whole file (`commitMove` ~97–144, `transition` ~165–270, `phaseCommand` ~316–335), `src/turn.ts`, `src/log.ts`, `src/state.ts`, `src/routing.ts`, `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and interfaces

`src/phase.ts`:

1. `stateSchema` already has `merge_stamp` (U1). In `commitMove`, add to the `after` object: `merge_stamp: to === 'merge' ? new Date().toISOString() : recorded.merge_stamp`.
2. New export:

```ts
export class MoveCommittedError extends Error {
  constructor(
    public readonly repo: Repo,
    public readonly to: Phase,
    message: string,
    options?: { cause?: unknown },
  ) {
    super(message, options);
  }
}
```

3. In `commitMove`, wrap everything after `saveState`+`console.log` so thrown errors become `MoveCommittedError`: the existing `try/finally` body stays; the log-append catch throws `new MoveCommittedError(repo, to, \`Move to ${to} is committed, but log append failed: ${error.message}\`, { cause: error })`; any other post-commit failure (announce, rename, `completeOwner`) is caught and rethrown as `MoveCommittedError` with message `Move to ${to} is committed, but follow-up work failed: ${message}` and the original as `cause`. `MoveCommittedError` passes through unwrapped. Add optional `onCommitted?: () => void` parameter called synchronously right after `saveState(leaf.path, after)` and `console.log(\`moved ${to}\`)`.
4. `transition` gains a trailing optional `onCommitted?: () => void` passed to both `commitMove` call sites.
5. `phaseCommand`: read `const global: GlobalConfig = readGlobal()` once (replace the inline call); inside the existing `withLock`, after `findLeaf` and before `transition`, insert the holder guard:

```ts
if (leaf.state.phase === 'merge' && (requested === 'merged' || requested === 'check.fix')) {
  const holder: QueueEntry | undefined = mergeQueue(global, allLeaves(repo), readLog(repo.root))[0];
  if (holder === undefined || holder.leaf.state.slug !== leaf.state.slug)
    throw new Error(
      holder === undefined
        ? `Merge turn refused: ${slug} is not eligible and no merge leaf in ${repo.name} is`
        : `Merge turn refused for ${slug}: holder is ${holder.leaf.state.slug}`,
    );
}
```

(adjust the message text only to match file style; it must name the holder slug when one exists.)

6. `phaseCommand` returns `Promise<{ repo: Repo; committed: boolean }>`: set `committed = true` via the `onCommitted` callback passed through `transition`; return `{ repo, committed }` after the lock block.
7. Imports: add `allLeaves` to the `./state` import, `readLog` to the `./log` import, `mergeQueue` and `type QueueEntry` from `./turn`, `type GlobalConfig` from `./config`.

## 5. Do-not

- Do not change the refusal message contract of existing guards (`Uncommitted work`, `Missing worktree`, trailer errors): other tests assert them.
- Do not apply the guard to `failed` moves or to leaves not in `merge`.
- Do not call `mergeWake` or touch `src/next.ts`/`src/akrogon.ts` here (U4).
- Do not swallow `MoveCommittedError` inside `phaseCommand`; exception is a revised brief.
- `commitMove` callers in `src/next.ts` keep compiling via the optional parameter; do not change them.

Reasons restated: the command entry (akrogon.ts) owns the wake per the locked design, and keeping the guard ahead of `transition` is what stops a hand-prompted waiting seat before any check runs.

## 6. Ordered steps

1. `bun install`; confirm base commit matches the lane head the seat reports in the brief dispatch (run `git log --oneline -1`).
2. Make the `commitMove`/`MoveCommittedError`/`onCommitted` changes (AC1, AC3).
3. Make the `transition`/`phaseCommand` changes (AC2, AC4).
4. `bun run typecheck`.
5. Run the changed-tests command.
6. Commit as one commit, e.g. `merge turn: holder guard, merge stamp, committed-move error`.

Advisory size: 1 file, under 15 turns.

## 7. Commands

- `bun run typecheck`
- `AKROGON_BASE=923c6c98fac3f051a54ac27168ea024215652602 bun test --changed="$AKROGON_BASE" --timeout=30000`

## 8. Done-when, evidence and report

Done when AC1–AC5 hold and the commit exists. Report the commit id.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
