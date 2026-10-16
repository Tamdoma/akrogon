# Review A: state-home

Base: dd5c15c217d85c8fafbb02f5f2544efe9b591a89
Reviewed head: e1917e6beeed8cf12f25c575d18d1e7c3d24d8ce
Verdict: fix

## Evidence

- `akrogon verify` green on e1917e6 (implementation logs: check-test-1792108437701, check-typecheck-1792108439742); 907 tests pass.
- Diff inspected in full: src/config.ts, src/state-home.ts, src/akrogon.ts, src/run-check.ts, src/AREA.md, README.md, docs/guide/install.md, tests/state-home.test.ts, tests/hold-retired.test.ts, tests/run-check.test.ts.
- `git ls-files` on the live checkout confirms `config.yaml`, `held.yaml`, `admission.lock`, `runs/`, `reconcile-host.json` are tracked — the copy-not-delete rule holds.
- src/AREA.md names `src/state-home.ts` — exists on head. README/install.md claim `~/.akrogon/config.yaml` — matches `globalHome()`.
- Test-Change trailers present on every test-file-touching commit (3c87194, 02f8518, 9596071, e1917e6); worker commits touch no test files.

## Fixes

### F1 — Criterion 2 has no proving test

Criterion: brief done-criterion 2 — `akrogon init` registers into the state-home `config.yaml` and changes no tracked file of the akrogon checkout.

No test in `tests/state-home.test.ts` (or elsewhere in the diff) runs `akrogon init`. Report's C2 line substitutes a `pause` write assertion plus "init's unchanged globalHome() write path". An `init` that resolved the tool root for its config write would satisfy none of the criterion while every existing test stays green. A scenario the criterion names blocks without needing a realistic source.

Repair: one case on the existing `state-home.test.ts` runner (tool copy + fixture repo + `init --from` or equivalent) asserting the registration lands under `<HOME>/.akrogon/config.yaml` and `git status --porcelain` of the tool-root copy stays empty. Existing helpers carry it.

### F2 — Raw `config.yaml` lands in the state home before the rewritten commit

`src/state-home.ts` `move()` runs `cpSync` over `copiedEntries` which includes `config.yaml`, then `writeYaml` replaces it with the repos-rewritten version via temp+rename. A process kill between the copy and the rename leaves `<stateHome>/config.yaml` present and un-rewritten: cutover counts as done (the file exists), and any relative `repos:` entries resolve against `~/.akrogon` instead of the tool root — permanently wrong registrations, and nothing detects it.

Realistic source: SIGKILL or power loss during the first post-deploy command on a host whose config carries relative `repos:` entries. Consequence: data corruption of every relative registration. Hits criterion 3's rewrite requirement.

Repair: drop `config.yaml` from `copiedEntries` so the only config write is the rewritten `writeYaml` commit.

## Nits

### N1 — Foreign-process gate misses symlink-invoked old code

`/proc/*/cmdline` carries the invoked path: `~/.local/bin/akrogon` (a symlink to `toolRoot/src/akrogon.ts`) puts `~/.local/bin/akrogon` in cmdline, not the tool root, and a seat's cwd is its leaf worktree, also outside the tool root. A pre-deploy `akrogon run-check` still before its admission write passes both gates, then writes its record into the tool-root `runs/` after cutover — a run invisible to `stop-run`, `leftovers`, and `sweepStale` on the state home. Deferred: the locks + no-live-record + retry mechanism is what the locked design authorizes, and the window is sub-second. Promotes if a `runs/*.yaml` record appears under a tool root after cutover on a real host; the stronger check is resolving each cmdline argument's symlink target before comparing.
