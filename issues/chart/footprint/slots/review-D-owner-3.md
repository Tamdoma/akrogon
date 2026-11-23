# Slot D review, owner roots, round 3

## owner-workers

Verdict fix

- Previous head `fb74665a0a321d8636009b83758c5930df99a4a4`
- Head `71de2c61f3a372c3aa5a446f900f37521c0dfcff`

1. **F6 fixed.** A closed `workers-u1` record with a stale primary path no longer exempts a new detached worker at that path. The previous head let `workers` move to `check.review`, and this head refused and named the worker. An open peer with its recorded primary path still passes under a regular store.
2. **F7. A symlinked default worktree store breaks the primary checkout exemption.** The default store path is kept as written (`src/config.ts:361–363`) and recorded in state (`src/next.ts:273–274`, `:297–300`). The guard compares that string to the real path Git reports (`src/phase.ts:428–440`). With `~/.akrogon/worktrees` symlinked to another directory, I registered a legitimate primary checkout for `workers-u1`. The previous head let `workers` advance. This head refused and told the operator to remove the peer's real checkout. Compare both paths in the same canonical form.

All 69 tests in `tests/phase.test.ts` passed.

## owner-skills

Verdict fix

- Previous head `6aea7fa41125a46d9ce67881552aa1023b40aa39`
- Head `07d48d0c4ac7c155a31d7215550570b4701513a1`, including consult fix `06598677`

3. **F3. The symlink cases are fixed. A hard-linked status file can still overwrite a backup.** The original linked-case and linked-status probes now refuse before removing a worktree. A same-filesystem snapshot made with hard links can share the case's regular `status` file. The preflight accepts that file and the final write updates the shared inode (`skills/watch-issues/scripts/consults.ts:259–263`, `:276–278`). In a disposable fixture, `close` removed the worktree successfully and changed the backup's status from `open` to `closed`. Replace the live status entry atomically so the snapshot retains its content.

All nine tests in `consults.test.ts` passed. Both test runs used `--timeout=120000 --max-concurrency=5`. Both fix diffs passed `git diff --check`.

The round 2 owner-locks verdict remains ready for staged rollout.
