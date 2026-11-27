# Map, slot A: test-temp-leftovers

Written before reading any other slot's map.

## Observations (free, 2026-11-25, bun 1.x in /home/ivan/Work/infra/akrogon at HEAD 64681915)

- O1. Current leftovers: `ls -d /var/tmp/akr-1000/*/*` with mtimes. Empty `<hash4>/<hash8>` dirs arrive in groups of four, each with a different repo hash, created within about 20 s (06:39, 07:34, 08:49, 08:51, ... 12:45 local). Distinct repo hashes mean distinct `repo.root`, i.e. fixture repos (random mkdtemp roots). The three non-empty dirs (e527, b419, 5d20) are live leaf seats' TMPDIRs, product, not leaks.
- O2. Reproduction: snapshot `/var/tmp/akr-1000/*/*`, run the 19 test files that mention run-check (`bun test --timeout=120000 --parallel=4 --max-concurrency=5 --no-isolate <files>`, 404 pass, 45 s), snapshot again: 4 new empty dirs (7d30/3b114503, 9264/2ff23755, 976d/fa809065, e7df/e34f1e87). No new `~/.akrogon/worktrees/*` entry.
- O3. Bisect, one file at a time: run-permit.test.ts 3 new, hc-delivery.test.ts 2, state-home.test.ts 1, timing.test.ts 1, the other 8 candidates 0. Counts are noisy because consultants may run tests at the same time; the left dirs were not removed (not mine to prove ownership of; they are empty and the cleanup belongs to the leaf).
- O4. Worktree store: 0 `~/.akrogon/worktrees/akrogon-??????` dirs now, none created by O2 or O3. Not reproduced.

## Mechanism

- M1 (cause of the /var/tmp leak, inspected). `src/run-check.ts` `constructedEnv` builds the checked command's env from the `copied` list: HOME, PATH, XDG_CACHE_HOME, FAKE_SYSTEMD_RUN_LOG, AKROGON_HOME and display names. It carries AKROGON_HOME "so a nested akrogon call shares the caller's state home", but not AKROGON_LEAF_TEMP_ROOT or AKROGON_RETIRED_TEMP_ROOT. A nested `akrogon run-check` (or verify, or any akrogon call) inside a checked command therefore resolves `leafTempRoot()` (`src/config.ts`) to the default `/var/tmp/akr-<uid>`, `ensureLeafTemp` creates `<hash(repo.root)>/<hash(root+slug)>`, `mkdtempSync(run-)` runs inside it and the run's own cleanup removes `run-…` only, leaving the empty leaf dir. That matches "empty" and "one per fixture repo". The other env builders already forward both names: `src/verify.ts` `passForwarded`, `src/land.ts` `launchLand`. run-check is the odd one out.
- M2 (second /var/tmp path, test side). `tests/hc-fixture.ts` `cleanEnv` builds the real hc core's env from scratch: HOME, PATH, LANG, TERM, XDG_RUNTIME_DIR, DBUS, HC_SESSION plus extras. No AKROGON_LEAF_TEMP_ROOT, AKROGON_RETIRED_TEMP_ROOT or AKROGON_HOME. Every terminal the core starts (stand-in agents, seats via `systemd-run --user --scope`, which keeps the caller env) inherits that, so an akrogon call made from a test seat uses the real default root. hc-delivery.test.ts leaking 2 in O3 fits this path.
- M3. The suite preload `tests/isolation.ts` sets HOME, AKROGON_LEAF_TEMP_ROOT, AKROGON_RETIRED_TEMP_ROOT and TMPDIR to a per-worker suite root (process.env and libc). Isolation holds for in-process code and for children that inherit process.env. It fails only where a child env is built from an allowlist that omits the name (M1, M2). Class: "an env allowlist drops an isolation variable".
- M4. The product's host sweep (`src/reconcile.ts`, leaf temp root pass) deliberately reports and never deletes a repo-hash dir it does not own, because the root may be shared with another home. It is not the place to fix this.
- M5 (worktree store, unexplained). `worktreeStore` (`src/config.ts`) resolves `homedir()/.akrogon/worktrees/<repo.name>`, and the fixture repo name is `basename(mkdtemp('akrogon-'))`, so `akrogon-XXXXXX` under the real home means a process with the real HOME acted on a fixture repo. Candidates not yet proven: a child env built without HOME (os.homedir falls back to passwd), or a `systemd-run --user` service (not scope) whose env comes from the user manager. The only store creator that leaves the store dir empty by design is `src/verify.ts` (`verify-<id>` under the store, removed after). Not reproduced today (O4); it may predate a recent fix.

## Forks

- F1. Where the fix lives.
  - F1a. Product: add AKROGON_LEAF_TEMP_ROOT and AKROGON_RETIRED_TEMP_ROOT to run-check's `copied` list (same reason as AKROGON_HOME), and test side: forward the same three names in `tests/hc-fixture.ts` `cleanEnv`. Removes both known paths at the mechanism. Later risk: a new allowlist anywhere re-opens the class unless F2 catches it.
  - F1b. One shared exported list of "state names a nested akrogon call must share" (AKROGON_HOME, AKROGON_LEAF_TEMP_ROOT, AKROGON_RETIRED_TEMP_ROOT) used by run-check, verify and land. Removes the drift between the three lists. Cost: touches three product files, larger diff for the same result today.
  - F1c. Per-test fixes (set the var in each test's repo `pass_env`). Leaves the class open; rejected.
- F2. How a leftover is caught so the class cannot return.
  - F2a. A test that runs a nested akrogon call through run-check and through a test hc seat with a scratch AKROGON_LEAF_TEMP_ROOT and asserts nothing appears under the default root. Proves the two known paths only.
  - F2b. Suite-level detection: the run fails if any dir under the real default leaf temp root or the real worktree store appears whose repo hash or name belongs to a fixture. Hard: workers are separate processes, `bun test` runs no exit handlers (isolation.ts comment), and the default root is shared with live product seats, so "new dir appeared" is not attributable.
  - F2c. Make the default unreachable under test: the preload points the default itself somewhere safe. Not possible by env alone (the default is a literal in `leafTempRoot`), and a product knob just for tests is configurability the signposts reject.
  - My pick: F2a. It is the cheapest test at the real boundary (the CLI), red before the fix and green after; F2b costs machinery and false alarms from live seats.
- F3. Worktree-store leak: chart it now or record it.
  - F3a. Keep it in scope as fog until a cause is reproduced; hand off only the /var/tmp fix.
  - F3b. Include a speculative fix (forward HOME everywhere). No evidence of a current path; rejected.
- F4. Existing leftovers: the leaf does not delete host dirs it cannot attribute; the door already cleaned once. Recorded only.

## Pitfalls

- P1. Forwarding AKROGON_LEAF_TEMP_ROOT changes nested-call behavior in production only when the operator sets it; unset stays unset (the loop skips undefined), so production is unchanged by default.
- P2. `tests/display-env.test.ts` and run-check tests may assert the exact constructed env; extending `copied` may need their expectations updated where they list names (read the source list, never hand-copy, per standing design).
- P3. Proving "no dir under the default root" in a test must not read the real `/var/tmp/akr-<uid>` (shared with live seats). The test can instead point the caller's AKROGON_LEAF_TEMP_ROOT at scratch and assert the nested call's leaf dir landed under that scratch root.
- P4. hc-fixture change is test-only; the hc core is a real external binary, so its proof is an existing real-core test whose seat calls akrogon.

## Recommendation

One leaf: F1a (or F1b if the shared list is no larger) plus F2a, proven red-first. F3 stays fog unless a slot reproduces the worktree-store leak; if nobody does, it goes to Off route with the evidence (0 today, not reproduced) and the door re-observes after the leaf lands.

## Questions the intake does not settle

- Q1. Is the worktree-store leak still live, and from which process?
- Q2. Are there other env allowlists that drop AKROGON_LEAF_TEMP_ROOT (seat.ts env, run units, self-update)?
