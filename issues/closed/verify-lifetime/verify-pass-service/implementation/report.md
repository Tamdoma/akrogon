# Report: verify-pass-service

Serial-solo implement (plan holds one unit). Base `c93f4223`, head `e709aac`. No refresh needed: `origin/main` == `AKROGON_BASE` at start and end. `e709aac` is a trailer-only amend of `de163ee8` (wrapped `Test-Change` value re-parsed); the working tree is byte-identical, so every proof below ran on this exact tree.

## Changed files

- `src/verify-pass.ts` (new): pass record schema (`record.yaml`), `verify-passes/<id>` registry helpers, `passLive` liveness (fresh-pending or pid+boot), `pidAlive`/`bootId`.
- `src/verify.ts`: `runOnce` now runs inside the pass service driven by the record's resolved inputs; `passOnce` claims-or-joins under `recordLock`, launches `akrogon-verify-<id>` (`--slice=akrogon.slice`, `CollectMode=inactive-or-failed`, `--working-directory=<repo.root>`, forwarded caller env per plan D6), prints `run <id>`; `waitPass` streams `out`/`err` and returns `status` or 1; `verifyPassCommand` tees streams into the pass dir, sets `AKROGON_SCOPE`, runs the pass and writes `status` (2 on throw); `verify()` resolves inputs once and calls `passOnce` (known-red uses the pass id for `compares`).
- `src/admission.ts`: `callerScope()` returns `AKROGON_SCOPE` when set (pass carrier; `AKROGON_RUN` untouched).
- `src/stop-run.ts`: after check-run lookup misses, a live pass with `run === id && caller_scope === callerScope()` stops via `systemctl --user stop <unit>`; foreign scope or absent keeps the old refusal.
- `src/akrogon.ts`: `verify-pass <dir>` dispatch.
- `src/reconcile.ts`: host step sweeps `verify-passes/*` — keeps live passes and dirs younger than 60 min (waiter drain), drops the rest.
- `docs/reference/commands.md`: verify row (service, `run <pass id>`, join key, exit source), new `verify-pass` row, stop-run row (pass stop + foreign-scope refusal).
- `src/AREA.md`: lines 6, 19, 20, 21, 33 updated for the pass service, carrier, sweep.
- `tests/run-units.test.ts` (`e709aac`): pass receipt lookup corrected to filter by caller leaf slug — planned tests' helper bug, no existing expectation changed.
- `tests/*` (`05532cdc`): planned tests committed at plan.synthesis.

## Proof

| Proof | Command | Head | Result |
|---|---|---|---|
| C1 pass survives caller SIGKILL | `bun test tests/run-units.test.ts` (test.serial "a verify pass survives...") | e709aac | green — receipt gained setup, all exits+logs, end; checkout removed |
| C2 join / new pass per key | same file ("a repeat verify joins...") | e709aac | green — one receipt for the join, second for scope-differ, third for tree-differ; joiner printed per-command lines and 0 |
| C3 exit codes | `tests/verify.test.ts` (green/red/post-receipt) + run-units stop cases | e709aac | green — 0 green, 1 red check, non-zero after-receipt failure, non-zero killed pass |
| C4 pass stop | run-units "stop-run <pass id> stops..." + "...while a full check waits" | e709aac | green — mid-check and admission-wait stops, foreign scope refused, no `end`, never reused |
| C5 scope owner | run-units "a pass keeps the starting caller scope..." | e709aac | green — check record `scope: callerA.scope`; plain `stop-run <check id>` stopped it |
| Full suite | `bun test --timeout=30000` | e709aac | 1217 pass, 0 fail (171 s) |
| `akrogon verify` | `akrogon verify` in the leaf worktree | e709aac | green, receipt `7550f03a` (`setup:0`, 3 commands green, `end` set) — format/typecheck/test all 0 |
| `bun run typecheck` | direct | e709aac | clean |
| `prettier --check` | via verify format check | e709aac | 0 |

Wall time: implementation ~40 min; full suite 171 s; verify 66 s inside the pass.

## Criterion mapping

1. Pass survives caller group SIGKILL mid-`test`: service in `akrogon.slice`, caller only waits — proven by the run-units survival test (was red on base: pass died with the caller).
2. Join key = caller scope + caller target (+ slug/unit/scope/attempt fields), tree, verify scope, exact command set, `compares`; join only while `passLive`; one live pass per key under `recordLock` — proven by the join test.
3. Exit = `status` file (0/1/2) written by the pass; missing status on a dead pass = 1 — green/red/post-receipt/killed cases all proven.
4. `run <pass id>` prints to stderr before any check line; `stop-run <id>` stops the unit mid-check and during `full` admission wait; foreign scope refused; receipt keeps no `end` and `greenRun`/`reuseSource` never reuse it — proven.
5. `AKROGON_SCOPE` carries the caller's scope into the service; check records keep it as owner — proven.
6. `commands.md` verify/stop-run/verify-pass rows and AREA.md lines 6/19/20/21/33 state the service, join rule and pass stop.

## Known limitations

- `run <check id>` lines are inside the pass's `err` stream, replayed by waiters with poll latency; `stop-run` by check id still works.
- Between-checks stop shares the service-stop path (no separate code state), per plan's condition trace.
- A pass whose service never starts leaves a `pending` record; swept after its 30 s TTL / 60 min dir grace.

No unverified criteria. No proof-command corrections were needed.

## check.fix 2026-10-27 — F3 (handed to A)

F3 asked for the different-tree case to launch while the original pass is still live and to show red when `samePass`'s tree comparison is removed.

- Test-only commit `63c20f9` (before `d4494b3`, after B's repairs): the `pass-join` test now commits `t2` and spawns the third `verify` while `sleep 6` keeps pass1 live, asserts a distinct pass id and three receipts.
- Red evidence: with `record.tree === key.tree` temporarily deleted, the test failed at `different tree started no third pass` (the third call joined pass1 — no new receipt). Restored; green rerun on `63c20f9`.
- Proofs on `63c20f9`: `bun test tests/run-units.test.ts tests/verify.test.ts tests/command-reference.test.ts` → 73 pass, 0 fail; `akrogon verify` → green receipt (1219 tests inside the pass, format/test/typecheck all 0, checkout removed).
- Commits: repair range `d4494b3` (B) → `63c20f9` (this pass). Base stays `c93f4223`; no refresh needed (`origin/main` unchanged).
