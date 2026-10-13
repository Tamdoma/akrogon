# Review A: run-permit

Base: 99a5ada582267e92d227c005eb1705ce7dc80576
Reviewed head: 6c43d3f3e8b353015e94f19bf56e4a884b0c3139
Verdict: nits

## Evidence
- Diff `99a5ada..6c43d3f`: 14 files, matches plan D1-D11 and units U1-U3. No design exclusion crossed: no wait timeout, no merge priority, no systemd units, no session-bus change, no flock(1), lock held by the run-check/base-run Bun process on an O_CLOEXEC fd.
- Checks on 6c43d3f (report, `implementation/proof-*.txt`): format 0, typecheck 0, test 865 pass 0 fail, test_changed 704 pass 0 fail; `tests/run-permit.test.ts` 7 pass. The head is unchanged since those runs, so no rerun.
- Criteria 1-7 each map to a planned test at the CLI boundary with real processes and real flock. Each was shown red before product code (plan.md, Red evidence).
- Callers: `grep` finds no internal caller of runCheck/baseRun outside the CLI dispatch (`src/akrogon.ts:159,172`), so no global `.lock` is held while a run waits. This supports C5 beyond its test.
- Nested path traced for the real merge flow: base-run sets `AKROGON_RUN` to its token, the printed check inside runs `akrogon run-check`, and its `liveHolder()` token matches, so it runs at once.
- AREA listing: the only names in `src/AREA.md` and `tests/AREA.md` absent from the worktree are runtime records (`issues/*.jsonl`, `run-holder.yaml`, `issues/config.yaml`), not code pointers. `src/AREA.md` is 40 lines. The dropped Non-obvious line duplicated the `src/init.ts` Key-files line.
- Docs: `docs/guide/setup.md:70`, `docs/guide/files.md:85` and the README rows describe the shipped behavior.
- Test-Change trailers: `tests/run-check.test.ts` (allowlist admits AKROGON_RUN, design leaf architecture) and `tests/AREA.md` (one added line). Both match their diffs.

## Nits
- N1 Sidecar temp file `run-holder.yaml.<pid>.tmp` (`src/permit.ts`, write then rename) is not gitignored. With the default AKROGON_HOME (the install checkout), a holder killed between write and rename leaves an untracked file there. Deferred: the window is two syscalls and no run has hit it. Promote if a stray `run-holder.yaml.*.tmp` shows up in the install checkout's `git status`.
- N2 Timing margins in `tests/run-permit.test.ts`: C7 asserts `wait_ms >= 1000` after a 1500 ms hold, and C2 asserts release-to-start under 1000 ms. A waiter that takes over 500 ms to boot, or a slow poll under heavy load, would fail them. Deferred: the permit itself serializes suites, and the full runs passed. Promote on one observed flake log.
- N3 An unparseable `run-holder.yaml` (manual edit only, since writes are atomic) makes every run-check, base-run and board status throw until the file is removed. Deferred: no real source writes a partial file. Promote if a version change alters the sidecar keys while an old holder runs.
