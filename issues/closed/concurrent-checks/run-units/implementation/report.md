# run-units — implementation report

Base: `ca023641f2945cb8902ebccbf9b6314c77027df4` (origin/main at refresh). Head: see `git log` on branch `run-units`. Delegated run, one wave, two workers (disjoint paths, no shared resource).

## Workers and commits

- **U1** (Aragorn, worktree `run-units-u1`, removed): mechanism. Commits `66340c0` (initial, cherry-picked as `f7ae65e`) and `60567bb` (slice-chain stat paths + guard record removal, cherry-picked as `3fbd8b6`).
- **U2** (Merry, worktree `run-units-u2`, removed): docs/skills. Commit `2054e37`, cherry-picked as `da42807`.
- **A repair** `dbdb89c` (pre-delegation test-order fix) and `b3e2532` (run line to stderr + three test-assert corrections).

## Changed files and reasons

- `src/scope.ts` — `runUnitBase`, `runSlice` (`AKROGON_RUN_SLICE` seam), `runUnitArgv`, `sessionBusAddress`, `startRunGuard` (tail --pid on the wrapper; drops the record and stops the scope on wrapper death), `stopRunUnits` (per-unit best-effort).
- `src/admission.ts` — record gains `run`/`slice`/`scope`/`unit` and state `ended`; `callerScope()`; `liveRuns()`; stale-record sweep before the own record; `denied()` gains `peers + 16 GiB` reservations with chain-expanded unit stat paths and the `+ runs <r> GiB` reason; `run <id>` printed on **stderr** when held; `release()` flips the record to `ended`.
- `src/run-check.ts`, `src/base-run.ts` — held path: guard registered first, scoped spawn under the run slice, finally release + stop units; nested path unchanged. `FAKE_SYSTEMD_RUN_LOG` joins `copied`.
- `src/stop-run.ts` (new), `src/akrogon.ts` — `stop-run [<run-id>]` before `requireRepo`; stops only records whose `scope` equals `callerScope()`; bare form lists matches and stops iff exactly one.
- `tests/run-permit.test.ts` — three reason strings widened to the `+ runs` shape (authorized, semantics kept).
- `tests/run-units.test.ts`, `tests/check-names.test.ts`, `tests/run-check.test.ts` — `unitDir` chain expansion; run line asserted on stderr; empty-stderr asserts widened to "only the run line" (see commits' `Test-Change:` trailers).
- Docs: `README.md` stop-run row; `skills/*` recorded-PID clause → `akrogon stop-run` (pattern-kill ban kept); `docs/guide/setup.md`, `docs/guide/next.md`; `src/AREA.md`, `tests/AREA.md`.

## Commands run (results pasted)

- `bun test tests/run-units.test.ts tests/command-reference.test.ts` on the pre-implementation head: 4 pass / 11 fail — all intended reds, recorded in plan.md.
- Worker targeted runs: run-units 9/10→10/10 after chain fix (skills test went green when U2 landed); run-permit 9/9; typecheck clean in worker worktree.
- `bun test --changed=ca023641… --timeout=45000` on lane head `b3e2532` (166 s): **888 pass / 0 fail** across 45 files. An earlier run at `da42807` showed 18 fails, all stdout-offset breakage from `run <id>` on stdout — fixed by `b3e2532` (stderr), verified by this green run.
- `bun run typecheck` on lane head: clean.

## Checks (config `checks:`)

`akrogon run-check --name format|test|typecheck` launched in background run dirs `/tmp/akr-1000/5d20/358c1156/run.EePWyz` (format), `run.IA3nuF` (test), `run.NtFIZF` (typecheck). All three are queued under the OLD admission (installed `akrogon` is main's): host `akrogon.slice` anon+shmem has been 55–62 GiB (>48) for ~15 min — real load from other seats' live scopes (codex/chrome), not a defect. Waiting on their exits.

## Done-criteria → evidence

| Criterion | Evidence |
|---|---|
| C1 units+guard, C2 stop-run, C3 death reap, C4 base-run unit, C5 reservations, C6 leaf/holder slices, sweep | `bun test tests/run-units.test.ts` 10/10 green on lane head (real units under `akrogon-test-*.slice` per readiness grant; assertions on /proc/cgroup, systemctl is-active, cgroup.procs, record files) |
| C7 skills/docs | `skills name akrogon stop-run` test green; `tests/command-reference.test.ts` all green |
| C8 all tests green | `--changed` sweep 888/0; full suite pending the queued `test` check |

## Operator amendment (2026-10-14, verbatim "O1 <- drop the memory check now. make it happen.")

Applied in `81196b3`, `ec4ef70`, `a26774a`, `6f82675`, `1c41d05`: `admission.ts` reads no `memory.stat`, has no 48 GiB limit, no `RUN_GIB`/`peerReservations`, no `AKROGON_SPACING_MS`/`last-start`, no admission flock. `withAdmission` sweeps stale records, writes the record `live`, prints `run <id>` on stderr, runs `fn` — `waiting` state and `waitingRuns()` remain only as the record shape `status` can print. Records, run line, sweep, nested identity, `stop-run` kept. Frozen tests rewritten to assert immediate starts (`run-permit` inversion, new run-units criterion-5 test), citing the amendment in `Test-Change:` trailers. Docs (`setup.md`, `src/AREA.md`, `tests/AREA.md`) updated.

## Known limitations / notes for review

- Implementation-notes additions (plan.md): slice-name chain expansion (`a-b-c.slice` → `a.slice/a-b.slice/a-b-c.slice`) required by the grant's `akrogon-test-*` naming; `run <id>` moved to stderr after it broke 18 stdout parsers.
- Old-shape records (pre-`run`/`slice`/`scope`/`unit`) fail the new schema parse and are swept on the next top-level admission — by design, since their writers can't be guarded anyway.
- D9's "and allocate" arm remains consciously unimplemented (noted in plan).
- The reserved 16 GiB is measured at admission time only; later unit growth is not re-reserved (design-accepted).

## Checks (final head `1c41d05`)

- `test`: `akrogon run-check --name test` → exit 0, **902 pass / 0 fail**, 50 files, 206 s (log: /tmp/akr-1000/5d20/358c1156/checks6/test/log). Two earlier check runs exposed real-suite-only issues since fixed: dead-bus `systemctl` calls in product + test helper, unit activation racing teardown asserts, and sibling record counting.
- `typecheck`: exit 0 (checks6/typecheck). `format`: exit 0 (checks6/format).
- Changed-tests sweep at `b3e2532`: 888 pass / 0 fail.
- Earlier failed check runs: checks2/test 899/4 (activating-unit race + dead-bus is-active), checks3/test 898/4, checks5/test 898/4 — all superseded by the checks6 902/0.

## Unverified criteria

None — all criteria proved green on the final head.

## check.fix 2026-10-14 (repairing B/F1–F4 handed from check.repair)

- `b436566` — reproduction test for B/F1 (fake-systemd-run argv assert): red before, green after the fix.
- `c1827c7` — B/F1 fix: `base-run` places scope+guard under `leafSlice(repo, leaf.state.slug)` (was literal `akrogon.slice`, escaping `akrogon stop`).
- `4cd7788` — B/F2 (cleanup assertions count only units whose cgroup sits under the file's test slice — the enclosing run is itself an `akrogon-run` scope), B/F3 (prose-wording assertion removed; executable-command asserts stay), B/F4 (one deadline measured at signal delivery covering scope inactive + procs drained, per TimeoutStopUSec+5 s).

Proof on repair head `4cd7788`:
- `bun test tests/run-units.test.ts` standalone: 11 pass / 0 fail; under the new scoped CLI (`AKROGON_RUN= AKROGON_RUN_SLICE=akrogon-test-checkfix-*.slice akrogon run-check -- bun test tests/run-units.test.ts`): 11 pass / 0 fail — the exact reproduction B used for F2.
- `akrogon run-check` checks on `4cd7788`: test 903 pass / 0 fail (132 s), typecheck exit 0, format exit 0, test_changed 889 pass / 0 fail.
- B's earlier docs repair `6bc5faf` is already on this head.
