# review-A: test-isolation

Base `0a80ab9`, reviewed head `ef821bb`. Diff: 10 files, +207/−18, all under `tests/` + `bunfig.toml` — inside the owned surface.

## Verified

- **Criterion tests**: `tests/isolation.test.ts` T1 (env redirection incl. `homedir()`, `leafTemp`, `worktreeStore`, child-process env) and T2 (orphan adopt + `sweepSuite` kill) cover both done-criteria at the real boundary; green in `akrogon verify` run `58c64867` on tree of head `3944b17` (`ef821bb` is an empty trailer-only commit on that tree). `852 pass / 0 fail`, 105 s.
- **Frozen-test edits**: three post-freeze changes to `tests/isolation.test.ts` — `2dfdc2d` (`/proc/<pid>/children` → per-thread `task/<tid>/children`; `/proc/<pid>/children` does not exist on this kernel, the test could not have run otherwise), `de531f8` (`?? ''` narrowing; `toBe` still fails when the env value is absent — expectation not weakened), `3944b17` (prettier only). Each is mechanical and carries a `Test-Change:` trailer; `requireFrozenCitations` accepted them at the `check.review` move.
- **C1 mechanism**: preload sets `HOME`, `AKROGON_LEAF_TEMP_ROOT`, `TMPDIR` through `process.env` and libc `setenv`. The libc call is required — Bun's `process.env` writes never reach `getenv`, so `os.homedir()`/`os.tmpdir()` kept resolving to the real HOME without it (the actual store-leak path, per the implementation report's discovery). `mkdtempSync(tmpdir())` runs before the first `setenv`, so the scratch lands under ambient `TMPDIR`; under `run-check` that is the run's own cleaned `runRoot` (`src/run-check.ts:58`, `:163`), under `akrogon verify` the checked-out run's own env — contained either way.
- **C2 mechanism**: `PR_SET_CHILD_SUBREAPER` makes the worker the reaper for every orphan descendant; `killTree` (helpers.ts) fixes the two bare-`proc.kill` sites that produced the 16 live `marks/` orphans; `run-units` `afterAll` stops every `testSlice()` it created plus `akrogon-run-stale0.scope`, the systemd-owned case `killTree` cannot reach. `sweepSuite`'s two-pass kill + `waitpid` reap handles zombies under the subreaper.
- **Docs**: `tests/AREA.md` gained one `Key files` line; every path it names exists (checked all listed paths from repo root — all `OK`). No documented product behavior changed.
- **Test-Change trailers**: every changed file matching the path rule is cited across `fffa4fd`, `bb73b54`, `4bf4cc6`, `0bcc657`, `2dfdc2d`, `de531f8`, `3944b17`, `ef821bb`, `5ab6c34`.
- **Report evidence**: namespaced-run proof (`roots-written.txt` = 0 bytes) and post-exit `ps` sweep are consistent with the code read; pre-existing orphans belong to other leaves and were correctly left alone.

## Findings

### Nits (non-blocking)

- **N1**: `killTree` kills `proc` before enumerating `descendantsOf(proc.pid)`, so a grandchild reparented in that gap is missed by the enumeration. Today it is caught by the subreaper + worker-exit sweep, and the real leak (orphaned `sh` hold loops) is dead either way. Promoted to a Fix only if a process ever outlives worker exit.
- **N2**: `sweepSuite` exported and called inside T2 kills *all* worker descendants mid-file, not only the test's own. Harmless today (serial file, no sibling keeps live procs across `sweepSuite`), but a future file that keeps a deliberate background process across tests in the same worker would lose it if another file calls `sweepSuite` early.
- **N3**: preload hard-dlopens `libc.so.6`; the suite is Linux/glibc-only. Acceptable for this host-bound tool suite.

### Fixes

None.

## Verdict

`ready` — both done-criteria have a real-boundary test and structural proof, verify is green on the reviewed tree, every test-file change is cited, docs match the code.
