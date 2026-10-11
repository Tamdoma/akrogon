# Design: check-env

## Binding decisions, verbatim
Chart: framework repo issues/chart/worktree-isolation (registered root /home/ivan/Work/infra/tamdoma/framework).

### Outside inputs (forks/outside-inputs.md)
Applies: 1a except the detectRepoRoot clause (framework root-influence leaf); 3a. 2a (per-leaf .env file) belongs to leaf-env-file.
#### Taken
- 1a: akrogon runs the whole check command (lock, setup and check, also with no setup, plus advisory) inside a constructed env: base names HOME, declared PATH, TMPDIR, AKROGON_BASE, XDG_CACHE_HOME, NODE_DISABLE_COMPILE_CACHE, plus names declared in issues/config.yaml `env:`. The boundary guard also refuses when NODE_PATH, BUN_OPTIONS, BUN_INSTALL_CACHE_DIR, FFMPEG_BIN, CHROME_PATH or CDP_BROWSER_BINARY is set, or a global bunfig exists, catching hand runs. Seats keep the operator's PATH. detectRepoRoot refuses when CLAUDE_PROJECT_DIR differs from cwd's git toplevel. The `env:` list comes from actual check consumers. Operator, 2026-10-10.
- 2a: dispatch writes a real leaf `.env` (mode 0600) with the declared names copied from the root `.env`, replacing the symlink; rewritten at each new dispatch, reused while a tab is live, removed with the worktree. Evidence records names and the dispatch generation, never values or value-derived hashes. Env values that are file paths are declared as named outside inputs. Operator, 2026-10-10.
- 3a: declared tools resolved at dispatch; path and version recorded in each merge attempt record. Tools stay an allowed named input (boundary 1a). Operator, 2026-10-10.
- Foreclosed: 1b, 2b per-run capture, 2c link, 3b version pin.


### Outputs (forks/outputs.md)
Applies: the run root per check run inside the per-leaf scratch, removed at run end, and the scratch root move off tmpfs. The reconciler removal of run roots whose process is gone belongs to worktree-reconciler. The 5 mkdtemp sites, fixed-name writers, path-security guidance and the sensor belong to framework check-scratch. Moving logs and evidence to the leaf folder is the seat's and the writer's job, not this leaf's.
#### Taken 2026-10-10
Operator, verbatim: "We need to make sure that all of the leftovers are always cleaned up unless it's logs or something that we will need in the future. So even this is too big. I don't want any gigabytes to be on the disc for no reason. I want the repo to be clean and up to date."

Read as 1a and 2a, with the strict rule:
- Default is delete. Each check run gets a fresh run root inside the per-leaf scratch, removed at run end. The reconciler removes run roots whose process is gone. The scratch root moves off tmpfs to the home disk.
- Kept set is explicit: logs and named evidence go to `<leaf>/implementation/` before removal. Nothing else survives a run.
- The 5 mkdtemp sites and the fixed-name writers move to the run root. The path-security.ts:98-108 guidance stops pointing outputs at `/.temp/`.
- Sensor (done-criterion): a run that leaves new ignored entries in the checkout fails, naming them, with node_modules and committed fixtures excluded. Writer-route tests sit beside it (B F4).

Moved to new forks: root .temp/proof-34b (recording workspace, 6.5 GiB) and the per-worktree copy of issues/closed (about 0.4 GiB each). See forks/disk-stock.md.


### Exclusions
- Ancestor and own-node_modules guard: worktree-store (`akrogon guard`), composed in the same `withSetup` wrapper, guard first.
- The `env:` list values and the framework `setup` line: operator step S1 on main after this leaf and the framework copyfile-install leaf land.
- boundary, migration, disk-stock, base-rerun: other leaves.

## Standing design

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md

Interpretation: tests run the real printed command through `sh` in a temporary repo and observe env and TMPDIR from inside the child (no stubbed spawn). Refusals are tested per named variable class and for the global bunfig. Run-root removal is proven on success and on a failing check. No live services involved. Values are never logged; refusals name the variable only.

## Leaf architecture
Owned surfaces:
- `src/config.ts` `repoSchema`: new `env: string[]` (default []) and `tools: string[]` if absent (reuse existing declared-tools field when present).
- `src/config.ts` `withSetup` (owned here (B,C)): wraps each command as `akrogon run-check -- sh -c '<lock && setup && cmd>'`; worktree-store later inserts its two guards into this string, giving the final line `akrogon run-check -- sh -c 'akrogon guard ancestors && flock <lock> sh -c <setup> && akrogon guard own-modules && <cmd>'`: run-check performs the caller refusals and builds the constructed env, then the ancestor guard, then lock and setup, then the own-modules guard, then the command (with no `setup`: both guards back to back, then the command). (B,C) Here the new `run-check` verb (`src/run-check.ts`) performs the refusals, creates the run root with mkdtemp under `leafTemp(repo, slug)` (slug from the worktree, falls back to a per-repo scratch for the registered checkout), builds the env, spawns, and copies the command's output log into the leaf folder (`<leaf>/implementation/check-<name>-<id>.log`, or a caller-named holder for the registered checkout) and then removes the run root in finally, also on failure (B). It writes `<run root>/.owner` with pid and boot_id so worktree-reconciler can sweep a killed run.
- `src/config.ts` `leafTemp`: default root `~/.akrogon/scratch/<repo name>`; AKROGON_LEAF_TEMP_ROOT override kept.
- `src/next.ts` seat placement (TMPDIR env, ~:405-416) and scratch emptying (~:395-401): follow the new root.
- `src/attempts.ts` `attemptRecordSchema` and `appendAttempt`: `tools: {name, path, version}[]`, resolved at dispatch.
Interfaces: `akrogon run-check -- <argv>`; run root `.owner` file `{pid, boot_id, started}` (consumed by worktree-reconciler and base-run).
Dependencies: none. worktree-store, leaf-env-file, base-run and worktree-reconciler are blocked by this leaf and consume `run-check`, `withSetup`, the `env:` schema and the run root `.owner` record. (B,C)
