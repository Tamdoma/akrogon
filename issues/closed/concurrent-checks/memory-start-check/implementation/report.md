# Implementation report: memory-start-check

Base: `a7c9115` (unchanged through the pass — `git rebase origin/main` reported up to date). Committed head: `53ef70a`.

## Changed files and reasons

- `25c2fd4` tests-first (plan.synthesis): `tests/run-permit.test.ts` rewritten to the start-check cases, `tests/helpers.ts` gains `cgroupRoot`/`statPath`/`seedStat` and injects `AKROGON_CGROUP_ROOT` + `AKROGON_SPACING_MS=0` into `cli()`/`fakeAkrogon()`/`fakeHerdr()` envs.
- `5627ded` U1 (worker commit `36a9bf2`, cherry-picked clean):
  - `src/admission.ts` (new): `withAdmission(holder, fn)`; blocking `flock` on `<globalHome>/admission.lock` held only for the read-decide-record step; admits when `<cgroupRoot>/user.slice/user-<uid>.slice/user@<uid>.service/akrogon.slice/memory.stat` `anon+shmem < 48 GiB` and `AKROGON_SPACING_MS` (default 30000) elapsed since `runs/last-start`; denied runs write their `wait_reason`, print `akrogon: waiting to start <repo>/<leaf> <check>: <reason>` and poll every 5 s; records at `runs/<sha256(token)>.yaml` (`waiting`→`live` inside the lock, removed in `finally`); `AKROGON_RUN` sha256 matching a `live` record (pid+start_time+boot_id) returns `nested` at once; `waitingRuns()` filters dead/malformed records.
  - `src/permit.ts` deleted; `src/run-check.ts`, `src/base-run.ts` rename `withPermit` → `withAdmission` only.
  - `src/status.ts`: `Run permit:` line replaced by `Run waiting: <repo>/<leaf> <check> <reason> <age>` per waiting record.
- `53ef70a` U2 (worker commit `07ab59c`, cherry-picked clean): `README.md`, `docs/guide/setup.md`, `docs/guide/files.md`, `src/AREA.md`, `tests/AREA.md` describe the start check; no `run permit` wording remains.

## Commands run and results

- `bun test tests/run-permit.test.ts` @ `53ef70a`: **8 pass, 0 fail** (35 s) — the criterion proofs for done-criteria 1–7 plus the missing-stat and unmatched-token contracts.
- `format` check @ `53ef70a`: green (~10 s).
- `typecheck` check @ `53ef70a`: green (~10 s).
- `test_changed` (`bun test --changed=$AKROGON_BASE --timeout=30000`) @ `53ef70a`: **871 pass, 0 fail**, 205 s wall.
- `test` (`bun test --timeout=30000`, full suite) @ `53ef70a`: two runs — 881 pass / 9 fail (all `tests/next.test.ts` 15–60 s internal timeouts, host load 40–65 with four other leaves' checks running), then 889 pass / 1 fail (`batch-dispatch` 20 s timeout). Retried files green in isolation: `next.test.ts` 235/235, `batch-dispatch.test.ts` 29/29. Retry marked `inconsistent`; the failures' cause is host scheduling load, not the diff — the same command's green `--changed` run and isolated file reruns cover the same code.
- Worker U1: `bun test tests/run-permit.test.ts` 7/8 in its worktree (the doc-grep was U2's fileset); typecheck clean. Worker U2: doc-grep clean; its `--changed` run showed only U1-dependent fails as expected.

## Proof → criterion

- C1/C3/C6: `two run-checks in two leaves` — second start waited ~30 s spacing while the first held, interleave observed, `wait_ms` recorded.
- C2 (+base-run): threshold waiting printed reading+reason; competing waiter re-checked spacing under the lock; `a base-run waits at the threshold` green.
- C4: nested `run-check`/`base-run` at once over threshold, inner `check_start` without `wait_ms`.
- C5: `Run waiting` line with leaf/check/reason; dead record filtered; live run not listed; no permit line.
- C7: grep tests + the 5 doc edits.
- C8: `test` and `typecheck` results above.

## Known limitations

- A waiting record between creation and its first denied poll lists reason `checking` in status.
- Dead run records linger under `<globalHome>/runs/` until the process that owns them removes its file; they are never shown and never validate nested runs (accepted in plan D8).
- `test_changed` runs the whole suite's changed set serially enough that it exceeded 500 s under load during planning; green at 205 s on the quieter host.
- The installed akrogon's own 4-lane stopgap still gates `akrogon run-check` wrappers host-wide; the leaf's new code takes effect after it lands and installs.

## Unverified criteria

None.

## 2026-10-13 check.fix

Reviewed head at handoff: `a02f2b3` on base `a7c9115`. Handed to A: review-B F1 (C2 threshold proof never feeds nonzero shmem) and review-B F2 (C3 spacing proof overrides the shipped 30 s default instead of exercising it). Repaired both in commit `3429266` (after rebase): the competing-waiter threshold test seeds `anon 40 GiB + shmem 9 GiB` so shared memory participates in the sum, and the `run()` launcher no longer passes `AKROGON_SPACING_MS` — spacing cases exercise the shipped 30000 default (an ambient value is deleted only when the caller passes none). Review-A F1 was repaired by B in `31920f2`/`a02f2b3` before handoff.

Deliberate breaks recorded before the fix commit:
- shmem dropped from the admission sum (`usage() → anon`): threshold test went red in 12 s — waiters saw only `spacing Ns < 30s` denials at anon 40 GiB.
- shipped default `30000 → 0`: spacing test went red in 1.6 s — the second run started immediately (`existsSync(b)` true at 1.5 s).

Branch refresh: rebased `a7c9115 → d9ab236` cleanly (six commits replayed; `worker-test-duty` landed on main). Rebased head `3429266`; plan notes appended for both review-driven corrections.

Proof on `3429266` (base `d9ab236`):
- `bun test tests/run-permit.test.ts`: 9 pass / 0 fail (35 s).
- `format` check: green (~10 s). `typecheck` check: green (~10 s).
- `test_changed`: 868 pass / 4 fail — all four `batch-dispatch.test.ts` timeouts under host load 21–56; file retried green 29/29 (`inconsistent`).
- `test` (full suite): **891 pass / 0 fail, 164 s**.
