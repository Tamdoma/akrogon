# Repair brief: U3 self-update deviations (records-sync)

Worktree: `/home/ivan/.akrogon/worktrees/akrogon/records-sync-u3` (detached HEAD at `6b39826`, contains your U3 commits). Your tests are all green; this repair fixes five deviations from the locked design. Work in that worktree only. Commit one commit on the detached HEAD.

## Repairs, in order

### R1 — remove the double fetch (design: one fetch per pass per repo)

`src/self-update.ts` `gitStage` currently runs `git fetch` itself AND `integrate` fetches again under `.lock`. Delete the outer fetch and its `fetched.code !== 0` early return. Fetch failures now surface as `CommandError` thrown by `integrate`'s `command(['git','fetch',...])`; in `selfUpdate` (in `body` or the outer catch), catch `error instanceof CommandError && error.argv[1] === 'fetch'` and produce the existing line `fetch failed: ${errorLine(error.result)}; ${await lag()}; retried at the next trigger`. `CommandError` exposes `readonly argv` and `readonly result` (see `src/shell.ts:8-15`).

### R2 — move the checkout inside the global `.lock`

Today `merge --ff-only` ran under `.lock`; the new `moveCheckout` runs after `integrate` released it. Restore the guarantee: add `after?: (pushed: string | null, incoming: string) => Promise<void>` to `integrate`'s `opts` in `src/sync.ts`, invoked inside the lock right before each non-throw return — after a successful push AND on the `{ tip: null }` no-push path (both places `return { pushed: ..., incoming, skip: null }` is produced; NOT on the `skip` return from `pre`, NOT on conflict/hazard throws). `selfUpdate` passes an `after` that calls `moveCheckout` and stores the result in a captured variable; `syncCommand` passes no `after`. `moveCheckout` keeps its `Move` type; the caller reads the captured variable after `integrate` resolves.

### R3 — delete `dropLocal` (design: pending keeps local history)

`moveCheckout`'s `dropLocal` branch (`git reset --keep` back to merge-base) rewrites local history the design says to keep. Remove the parameter and the branch. Re-push dedup is already handled: the next trigger's scratch `git rebase` drops patches already upstream, yielding `{ tip: null }`.

### R4 — delete the `ignoredAt` probe and slim `moveCheckout`

Remove `ignoredAt` entirely (the ignored-collision hazard check inside `integrate` already covers this; the incoming-tree `.gitignore` edge case it probed has no criterion). `moveCheckout` then becomes:

```ts
async function moveCheckout(repo: Repo, moveTo: string): Promise<Move> {
  const root: string = repo.root;
  const behind: string = await command(['git', 'rev-list', '--count', `HEAD..${moveTo}`], root);
  if (behind === '0') return { state: 'none' };
  const head: string = await command(['git', 'rev-parse', 'HEAD'], root);
  const refused: Result = await run(['git', 'reset', '--keep', moveTo], root);
  if (refused.code === 0) return { state: 'moved', old: head };
  // keep refuses when a colliding path is dirty even if it already carries the
  // target bytes; adopt the index tree when every collider is content-equal.
  const changed: Set<string> = new Set(paths(await command(['git', 'diff', '--name-only', '-z', head, moveTo], root)));
  const dirty: Set<string> = new Set([
    ...paths(await command(['git', 'diff', '--name-only', '-z'], root)),
    ...paths(await command(['git', 'ls-files', '--others', '--exclude-standard', '-z'], root)),
  ]);
  const colliding: string[] = [...changed].filter((path: string) => dirty.has(path));
  const staged: string = await command(['git', 'diff', '--cached', '--name-only'], root);
  let equal: boolean = staged === '';
  for (const path of colliding) {
    if (!equal) break;
    const have: Result = await run(['git', 'hash-object', '--', path], root);
    const want: Result = await run(['git', 'rev-parse', `${moveTo}:${path}`], root);
    if (have.code !== 0 || want.code !== 0 || have.stdout !== want.stdout) equal = false;
  }
  if (equal && colliding.length > 0) {
    await command(['git', 'reset', '--mixed', moveTo], root);
    return { state: 'moved', old: head };
  }
  return { state: 'pending', detail: errorLine(refused) };
}
```

Rationale for each line: `reset --mixed` sets index to moveTo and leaves the worktree untouched, which is correct only when every colliding worktree file already equals the target blob (hash compare) and nothing is staged (mixed unstages). A staged or genuinely-different collider is the real pending case. `colliding.length === 0` can't happen (a clean keep never refuses), but the `equal && colliding.length > 0` guard is harmless — keep it or drop it, your choice, state which.

Update the caller for the removed `dropLocal` param.

### R5 — rejected push reports and retries (design decision: "a rejected push is reported and retried at the next trigger")

In `selfUpdate`, catch `error instanceof CommandError && error.argv[1] === 'push'` around the `gitStage`/`integrate` call and produce `push failed: ${errorLine(error.result)}; ${await lag()}; retried at the next trigger`. Any other `CommandError` or `Error` propagates to the existing outer catch (`self-update failed: ...`) unchanged.

### Also (small): record-conflict line

The move's conflict throw surfaces as `self-update failed: record conflict: ...`. Catch `Error` whose message starts with `record conflict:` and print the message alone (still one line, still contains the paths and `akrogon sync`). All other errors keep the `self-update failed:` prefix.

## Constraints

- Do not change the `own || git.pushed !== null` move gate: behind-only moves stay own-repo-only. This is deliberate; `hold.test.ts`/`batch-merge.test.ts` fixtures push record shapes the checkout must not absorb mid-command. It is recorded as a plan limitation, not your call to revisit.
- Do not touch tests. All currently-green tests stay green, and `tests/self-update.test.ts` must stay 8/8 green.
- `src/sync.ts` edits: only the `after` hook. `syncCommand` behavior identical (it passes no `after` and its return shape is unchanged).
- Keep `paths()`, `errorLine`, `describeError`, `GitResult`, `installStage` as they are apart from the repairs.

## Commands

```sh
bun install --frozen-lockfile
bun run typecheck
bunx prettier --write src/self-update.ts src/sync.ts
bun test tests/self-update.test.ts tests/install.test.ts tests/sync.test.ts --timeout=30000   # all green
bun test --changed=c53f6196533289555518577f08907ec9c713721c --timeout=30000                    # all green
bun test tests/hold.test.ts --timeout=30000                                                  # all green
```

Report: commit sha, per-repair confirmation (R1-R5 + conflict line), pasted test results, any deviation you could not satisfy and why.
