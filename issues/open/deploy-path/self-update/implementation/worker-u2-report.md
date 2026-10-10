# Worker report: sub-brief 2 (plan U2, wave 1) — phase-committed

## Changed files and reasons

- `src/phase.ts` — `phaseCommand` return type changed to `Promise<{ repo: Repo; committed: boolean; to?: Phase }>`. Added `let committedTo: Phase | undefined;` beside `committed`; the existing `onCommitted` closure now sets `committedTo = requested` before `committed = true`; return is `{ repo, committed, to: committedTo }`. `commitMove`, `transition`, and `MoveCommittedError` signatures unchanged. The two bare-commit paths (`--red-on-base` hold ~line 857, batch split ~line 942) set `committed = true` directly and leave `to` undefined. No other files edited.

## Tests run

- `bun install` — 9 packages installed (worktree had no node_modules).
- `AKROGON_BASE=9e2dfbebcfd98e647d34bed995741410ce95c2e4 bun test --changed=9e2dfbebcfd98e647d34bed995741410ce95c2e4 --timeout=30000` — 25 pass, 0 fail, 285 expect() calls (tests/batch-merge.test.ts).
- `bun run typecheck` (`tsc --noEmit`) — clean, no output.
- `bun test tests/phase.test.ts tests/merge-attempts.test.ts tests/batch-merge.test.ts tests/next.test.ts --timeout=30000` — 329 pass, 0 fail, 2925 expect() calls.

## Known limitations

- `to` records `requested`, not the phase `transition` actually committed. `transition` (phase.ts:296-321) can redirect: a `check.review` request commits `merge` or `check.repair` by verdict, and a `check.fix` request from `check.repair`/`merge` commits `failed` when fix rounds are exhausted (this also applies to the `--culprit` path's `check.fix` move and the batch red path). The consumer goal — detecting a committed `merged` move — is unaffected: `requested === 'merged'` never redirects (no verdict redirect, cap only fires on `check.fix` destinations), and member commits inside `batchPush`/`finishPush` are always `to: 'merged'` under `requested === 'merged'`. Exact reporting would require `onCommitted` to receive the committed phase, which the brief forbids (signature stays `() => void`).

## Unverified criteria

- None. All acceptance criteria verified: return type updated, `to` set by `onCommitted`, `MoveCommittedError` unchanged, the four test files pass unedited, typecheck passes, hold/split leave `to` undefined.
