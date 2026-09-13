# Muse audit

Date: 2026-09-13
Repo: `/home/ivan/Work/infra/akrogon`
Scope: `src/*.ts` only. No code changed.
Method: read all of `src/`, ran `bun run typecheck` (clean) and `bun test` (all pass), probed git/flock/shell behavior in `/tmp`.
Rule: every finding below has a fix that keeps current behavior for valid inputs. Fixes only remove failure modes, cut wasted work, or simplify structure.

## Summary

20 findings. 8 bugs, 7 bottlenecks, 5 simplicity issues. Biggest wins are F8 (drop redundant leaf locks), F9 (halve git spawns in repo resolution), and F4 (stop orphaning branches in cleanup).

## Bugs

### F1: model containing `{effort}` corrupts the harness command
Location: `src/next.ts:221` (`launch`)

`replaceAll('{model}', ...)` runs first, then `replaceAll('{effort}', ...)`. If the model value itself contains the text `{effort}`, the second replace rewrites the model. Probed: model `x{effort}y` becomes `x'high'y`.

Fix: one-pass replace so values are never rescanned:
`template.replace(/\{model\}|\{effort\}/g, (m) => m === '{model}' ? quote(model) : quote(effort))`.
Same output for normal models. No new dependency, no behavior change.

### F2: `phase <slug> merged` on an already-merged leaf always exits 1
Location: `src/phase.ts:178` (`phaseCommand`)

When the leaf is already `merged`, it runs `completeOwner` (the repair) and then falls through to `transition`, which throws `Merged is terminal`. A successful repair still exits 1.

Fix: after `completeOwner`, return early when `requested === 'merged'`. Other requests still throw as today. Success path unchanged, repair path now reports success.

### F3: double failure in `commitMove` hides the real error
Location: `src/phase.ts:29` (`commitMove`)

`completeOwner` runs in `try`, `logMove` in `finally`. If both throw, the log error replaces the source-closure error, so the operator sees the wrong cause.

Fix: catch the `completeOwner` error in a variable, run `logMove`, then rethrow the first error (or an `AggregateError` of both). Success path identical, failure path keeps both causes.

### F4: cleanup deletes the worktree then fails on the branch, orphaning it
Location: `src/next.ts:544` (`cleanupMerged`)

It runs `git worktree remove` then `git branch -d`. Tool-created branches have no upstream and local `main` is stale, so `-d` fails with "not fully merged". The worktree is already gone, so the next run skips the whole block (`existsSync` false) and the branch leaks forever. Per-leaf catch in `cleanupRepos` keeps the sweep alive, but each merged leaf still reports an error and leaks a branch.

Fix: use `git branch -D` (safe here because `recoverMerge` already proved the head is an ancestor of the target), and move the branch delete outside the `existsSync(worktree)` guard so a missing worktree still deletes its branch. Success path same, retry path now converges.

### F5: a file named like a slug blocks explicit dispatch
Location: `src/next.ts:575` (`selectLeaves`)

If `akrogon next <slug>` runs in a directory containing a file with the same name, it throws `Invalid target` instead of dispatching the slug.

Fix: before throwing for a file target, check if the input matches a known slug in the inventory and prefer the slug. File paths that are not slugs still throw as today.

### F6: missing worktree gives a raw Bun stack instead of a clear error
Location: `src/phase.ts:152` (`requireClean`), via `src/shell.ts` (`run`)

`Bun.spawn` with a missing `cwd` throws `ENOENT ... posix_spawn 'git'` before `run` can wrap it. Same for any stale `state.worktree`.

Fix: at the top of `requireClean`, `if (!existsSync(worktree)) throw new Error('Missing worktree: ...')`. Optionally also guard `run` the same way to cover all callers. Valid paths behave identically.

### F7: invalid GitHub source is retried forever
Location: `src/pull.ts:186` (`closeSources`)

A malformed `sources` entry throws `SourceError`, which is caught per source and rethrown as `AggregateError`. The folder never moves to closed, so every later dispatch retries the same invalid string and fails again.

Fix: validate all sources with the existing regex before the loop and throw immediately on the first invalid one. Valid sources follow the exact same path.

### F8: empty-string identifiers pass validation then fail downstream
Location: `src/state.ts` (`stateSchema`: `tab`, `worktree`, `pane`, `prompted`)

These are `z.string().optional()` with no minimum length. A hand-written `worktree: ''` passes load, then fails later inside herdr or git with a confusing message.

Fix: add `.min(1)` to those identifier fields. All tool-written states already satisfy this. Only invalid files change, from late obscure failure to early clear failure.

## Bottlenecks

### F9: repo resolution spawns git twice per check
Location: `src/config.ts:84` (`commonDirectory`)

It runs `git rev-parse --is-inside-work-tree` and then `git rev-parse --git-common-dir`. Both print the same `not a git repository` message outside a repo (verified). `currentRepo` and `selectLeaves` call this per repo, so 3 repos cost 8 spawns before any work starts.

Fix: call only `--git-common-dir`. If it fails and stderr includes `not a git repository`, return null, else throw. Same return values, half the spawns.

### F10: repo scan does git before a cheap file check
Location: `src/config.ts:93` (`currentRepo`), `src/next.ts:575` (`selectLeaves`)

Both call `commonDirectory(repo.root)` before checking `existsSync(issues/config.yaml)`. Uninitialized paths pay git spawns for nothing.

Fix: check `existsSync` first, then git. Also cache `commonDirectory` results in a `Map` per command since the same roots are queried repeatedly. Same results, fewer spawns.

### F11: capacity check rescans every repo for every leaf
Location: `src/next.ts:267` (`activeCount`), called from `allocate`

Each tab-less leaf triggers a full walk and YAML parse of all repos. 10 new leaves means 10 full scans plus 10 herdr calls.

Fix: memoize per-repo inventories for the duration of one command, keep fetching `panes()` fresh, and add a counter for tabs created during this run to the cached count. Capacity enforcement stays identical without re-parsing YAML each time.

### F12: each leaf fetches herdr state 10+ times
Location: `src/next.ts` (`dispatchLeaf`, `allocate`, `dispatchSlot`)

`dispatchLeaf` fetches `panes()`, `allocate` fetches `panes()` plus `tabs()` plus `workspaces()` plus `panes()` again, and each slot fetches the pane 2-3 more times. A 2-slot leaf costs about 12 herdr spawns.

Fix: fetch one snapshot in `dispatchLeaf`, pass it into `allocate` and `dispatchSlot`, and refresh only after mutations this process made (tab create, pane split, agent start, prompt). External changes within the same milliseconds were already racy, so behavior is unchanged in practice.

### F13: hook path scans all repos twice
Location: `src/next.ts:625` (`paneOwners`), `src/next.ts:638` (`nextCommand`)

`nextCommand` calls `paneOwners` once to compute `hooked` and again in the hook branch. Each call reads all repo configs and walks all leaves.

Fix: keep the first result and reuse it. Same data, one scan.

### F14: status history lookup is O(leaves times log lines)
Location: `src/status.ts:103` (`cells`)

Each leaf runs `log.findLast` over the whole `log.jsonl`. Large logs with many leaves do redundant scans.

Fix: build one `Map` from `slug+phase` to latest record before rendering, then look up per leaf. Output identical.

### F15: park dependency check is O(issues squared)
Location: `src/park.ts:29` (`stranded`), `src/park.ts:74` (`settle`)

`settle` calls `stranded` in a loop, and `stranded` walks every issue each time. Each walk re-reads all YAML.

Fix: walk once, build a slug-to-issue map, then compute dangling deps from the map in memory. Same verdicts, one scan.

## Simplicity

### F16: leaf locks are redundant under the global lock
Location: `src/state.ts:138` (`withLeafLocks`), used in `src/next.ts:489`, `src/phase.ts:191`

`next` and `phase` always hold the global lock plus the repo lock around `withLeafLocks`. The global lock already serializes everything except `pull` (repo lock only), and `pull` touches only seeds, which leaf locks do not cover. So the 2-3 extra `flock` spawns per leaf buy no exclusion and keep the only nesting depth that ever deadlocked.

Fix: remove `withLeafLocks` from `next` and `phase`, keep global plus repo. Mutual exclusion is unchanged because the outer locks already exclude. This also deletes the `withLeafLocks` helper and its depth logic from the locking path.

### F17: dead helper `dependenciesReady`
Location: `src/state.ts:148`

No caller in `src/`. `next` resolves deps from its own inventory. It also rescans all files per dep, so reviving it as-is would be slow.

Fix: delete it. If a caller ever needs it, resolve from an already-loaded inventory instead.

### F18: `within` has a dead condition and a dead import
Location: `src/config.ts:79`

`relative()` never returns an absolute path (verified), so `!isAbsolute(diff)` is always true. The `isAbsolute` import exists only for that check.

Fix: drop the `isAbsolute` clause and import. Keep `diff === '' || (!diff.startsWith('../') && diff !== '..')`. Same results for all inputs.

### F19: `expandPath` nested ternary is hard to scan
Location: `src/config.ts:62`

Three branches are packed into one expression.

Fix: early returns for `~` and `~/`, then one `resolve`. Same mapping, plain control flow.

### F20: `sync` is one 130-line function doing six checks
Location: `src/sync.ts:6` (`syncCommand`)

Branch check, staged-path check, lock checks, ignore-collision check, commit, rebase plus push are inline. Fine to run, hard to review.

Fix: extract six small helpers with the same code moved verbatim (`assertBranch`, `assertStaged`, `assertLocks`, `assertIgnored`, `commitStaged`, `rebasePush`). No logic change, each check readable alone.

## Smaller notes (no change proposed)

- `src/next.ts` `launch` argv check (`argv[0] !== harness`) rejects templates with env prefixes late at dispatch. Moving that check to config load would fail faster but would change when the error surfaces, so it is left out per the no-functionality-change rule.
- `src/status.ts:44` `scanRepo` defines `open` after the `walk` closure that captures it. It works because `walk` is first called later, but moving the `const` above `walk` is a safe readability edit.
- `src/state.ts:66` `leavesUnder` returns filesystem order. Sorting entries would make sweep order deterministic, but output order would change on some machines, so it is left out.
- `src/init.ts:11` `initialize` writes global config without the global lock. Two concurrent inits could lose one registration. Wrapping it in `withLock` is safe for single runs, but concurrent init is outside normal use, so it stays a note.

## Verified clean

- Duplicate-slug handling in `next` (`discover`) and per-leaf error isolation: one bad file no longer stops the sweep.
- Session-less pane dedup: now requires a defined `prompted[slot]`, so it no longer stalls silently.
- Source closure ordering: `closeSources` runs before the folder rename, and failures block the move so they retry.
- `install` links all four skill roots and prunes dead owned links.
- `typecheck` clean, full `bun test` green at audit time.

## Most important

Do F16, F9, and F4 first. They remove the most code and failure modes for the least risk. The rest are small and independent.
