# Plan: memory-start-check

Debate off (`debate: "no"`); synthesized directly from brief and design.

## Decisions

- **D1** `src/permit.ts` is replaced by `src/admission.ts`. It exports `withAdmission(holder, fn)` keeping the `withPermit` call shape, plus `waitingRuns()` for status. Callers in `src/run-check.ts:173` and `src/base-run.ts:165` change only the import/name.
- **D2** Admission rule, constants in code: under a short flock on `<globalHome>/admission.lock`, a run starts when `akrogon.slice`'s `memory.stat` shows `anon + shmem < 48 GiB` and `>= 30 s` since the last admitted start (last-start file absent or unparseable = satisfied; a corrupt stamp must not gate the host). Denied runs release the lock, sleep 5 s, re-acquire and re-check both conditions, so competing waiters re-check under the lock.
- **D3** `AKROGON_CGROUP_ROOT` overrides the cgroup root (non-blank absolute, same validation shape as `procRoot()`), default `/sys/fs/cgroup`. The akrogon.slice path is uid-derived — `<root>/user.slice/user-<uid>.slice/user@<uid>.service/akrogon.slice/memory.stat` — not read from `/proc/self/cgroup`, so `run-check` works from a plain terminal outside the slice. A missing/unreadable `memory.stat` or absent `anon`/`shmem` keys throws naming the path.
- **D4** `AKROGON_SPACING_MS` overrides the 30 s spacing (non-negative integer ms, default 30000), same seam category as `AKROGON_CGROUP_ROOT`/`AKROGON_PROC_ROOT`. Needed because the suite spawns ~100 `run-check`/`base-run` invocations across fixtures — including `spawnCaptured` call sites `cli()` cannot pre-touch — and a real 30 s spacing per spawn would add ~50 min. This is an env seam, not repo config; the shipped default is exactly the locked 30 s. Poll (5 s) and threshold (48 GiB) stay constants.
- **D5** One record per run at `<globalHome>/runs/<token-hash>.yaml` (hash = sha256 of token): `{token_hash, pid, start_time, boot_id, repo, leaf, check, state: 'waiting'|'live', wait_reason?, since}`. Created `waiting` before polling; flipped to `live` inside the admitting lock; removed in `finally`. Last admitted start as epoch-ms text at `<globalHome>/runs/last-start`. Malformed records are skipped by readers, not fatal — `akrogon status` must not crash on a corrupt record.
- **D6** Nested runs: `AKROGON_RUN` whose sha256 matches a `live` record (pid + start_time + boot_id validated against real `/proc`) returns `{kind:'nested',token}` immediately — no lock, no memory read, no spacing, no record written. Unmatched tokens go through normal admission.
- **D7** Each denied poll prints one stderr line: `akrogon: waiting to start <repo>/<leaf> <check>: anon+shmem <X> GiB >= 48 GiB` and/or `... spacing <N>s < 30s since last start`. The record's `wait_reason` stores the same text.
- **D8** `akrogon status` drops the `Run permit:` line and prints `Run waiting: <repo>/<leaf> <check> <wait_reason> <age>` per `waiting` record whose pid/start_time/boot_id validate. `live` runs are not listed; dead records linger on disk but are never shown and never validate a nested run — accepted limitation.
- **D9** `check_start.wait_ms` keeps field and meaning (start-check wait); `src/timing.ts` unchanged. `docs/guide/files.md` wording updates.
- **D10** `AKROGON_CGROUP_ROOT` and `AKROGON_SPACING_MS` stay out of the reserved `constructed` set in `src/config.ts` so fixtures can pass them through `pass_env` into nested runs.
- **D11** Tests keep the filename `tests/run-permit.test.ts` (rewritten) to avoid frozen-record churn on a delete+add. `tests/helpers.ts` gains `cgroupRoot()`, `statPath()`, `seedStat()`; `fixture()` seeds a low `memory.stat`; `cli()` and `fakeAkrogon()` inject `AKROGON_CGROUP_ROOT=<fake>` and `AKROGON_SPACING_MS='0'` (caller env wins), so the rest of the suite is unaffected. The rewritten file's own `start()` injects only the cgroup root — spacing tests exercise the real 30 s default.
- **D12** Stale `run.lock`/`run-holder.yaml` files in existing homes are left alone — the code stops reading them; no cleanup step.

## Read-first

- `src/permit.ts` — call shape, FFI flock, pid/start_time/boot_id validation, nested-token pattern to preserve.
- `src/run-check.ts`, `src/base-run.ts` — the two `withPermit` call sites and `AKROGON_RUN` env construction.
- `src/status.ts:409-413` — the `Run permit` line being replaced.
- `src/scope.ts` — `procRoot()` env-override pattern to copy.
- `src/config.ts:68-78` — reserved `constructed` env names.
- `tests/run-permit.test.ts`, `tests/helpers.ts` — spawn/marks/timings helpers.
- `systemd/akrogon.slice` — the ceiling the check guards (MemoryHigh 64G, MemorySwapMax=0).
- `docs/guide/setup.md:70`, `docs/guide/files.md:85`, `README.md:149-150`, `src/AREA.md:18`, `tests/AREA.md:16` — doc surfaces.

## Interfaces

```ts
// src/admission.ts
export interface AdmissionHolder { repo: string; leaf: string; check: string }
export type Admission =
  | { kind: 'held'; token: string; wait_ms: number }
  | { kind: 'nested'; token: string };
export async function withAdmission<T>(
  holder: AdmissionHolder,
  fn: (admission: Admission) => Promise<T>,
): Promise<T>;
export interface RunRecord {
  token_hash: string; pid: number; start_time: string; boot_id: string;
  repo: string; leaf: string; check: string;
  state: 'waiting' | 'live'; wait_reason?: string; since: string;
}
export function waitingRuns(): RunRecord[]; // 'waiting' + live pid/start_time/boot_id, malformed skipped
```

## Checklist (waves)

Tests (`tests/run-permit.test.ts` rewrite, `tests/helpers.ts` additions) are committed on the leaf branch by this pass; units implement code and docs only.

- **Wave 1**
  - **U1** src mechanism: owns `src/admission.ts` (new), `src/permit.ts` (delete), `src/run-check.ts`, `src/base-run.ts`, `src/status.ts`, `src/config.ts` (constructed-set check only if needed — D10 expects no change). Covers every done-criterion except the doc half of C7.
  - **U2** docs: owns `docs/guide/setup.md`, `docs/guide/files.md`, `README.md`, `src/AREA.md`, `tests/AREA.md`. No code dependency — wording fixed by D1–D8 (start check: anon+shmem < 48 GiB, 30 s spacing, 5 s poll, nested immediate, no name exemptions; env seams documented in `src/AREA.md`).
- **Wave 2** — none; U1 and U2 have disjoint owned paths, no shared test resource, no ordering.

## Done-criteria → proof

All proofs exist at AKROGON_BASE (`bun test`, `bun run typecheck`); the fake `memory.stat` is a test input file consumed through `AKROGON_CGROUP_ROOT`. No new proof machinery.

| Criterion | Proof | Catches | Size | Rerun trigger |
|---|---|---|---|---|
| 1, 3, 6 | `bun test tests/run-permit.test.ts` — "two run-checks in two leaves interleave" (B absent at 1.5 s, appears ~30 s in while A still runs; `wait_ms >= 25 s` on B, small on A) | serialized runs, missing spacing, missing wait_ms | ~40 s | src/admission.ts, src/run-check.ts, src/timing.ts |
| 2 | same file — "threshold waits naming reading and reason" (both waiters print `anon+shmem <X> GiB >= 48 GiB`; after drop, first admits within ~5 s, second re-checks spacing under the lock, `wait_ms` gap >= 25 s) + "a base-run waits at the threshold" | missing memory gate, missing print, lockless check | ~60 s | src/admission.ts, src/base-run.ts |
| 4 | same file — "run-check and base-run inside an admitted run start at once over the threshold" (outer admits, script raises the stat over 48 GiB, inner run-check + base-run run immediately; inner `check_start` has no `wait_ms`) | nested runs waiting on spacing/threshold | ~20 s | src/admission.ts, src/base-run.ts |
| 5 | same file — "status lists runs waiting to start" (one line with leaf/check/reason, no `permit`, dead record filtered, live run not listed) | stale permit line, missing waiter visibility | ~15 s | src/status.ts, src/admission.ts |
| 7 | same file — "no run.lock lanes, run-holder files or name exemptions" (src/ grep: no `run.lock`, `run-holder`, `withPermit`, `selftest`, `cheap`; docs grep: no `run permit` in README + 3 named docs) | old lanes, sidecars, stale docs | < 5 s | any src/doc change |
| design contract | same file — "missing memory.stat fails naming the path"; "AKROGON_RUN matching no live record goes through admission" (fresh token, dead-pid live record) | silent start, token reuse | ~15 s | src/admission.ts |
| 8 | `bun run typecheck` and `bun test --timeout=30000` (the repo `checks` commands) | type and suite regressions | minutes | any owned file |

## Intended red

First run of the rewritten file against the unimplemented code (old `permit.ts` still in place):

- 7 of 8 tests fail, all on the missing new behavior: `b` never waited for spacing (`waiting for run permit held by repo/leaf-one a` then timed out), both waiters printed only the old permit line (`Timed out waiting for stderr /anon\+shmem ... GiB >= 48 GiB/: akrogon: waiting for run permit held by repo/hot w2 pid ...`), base-run held the permit not the stat, `status` printed no waiter line, and `AKROGON_RUN` without a live record was silently honored by the old single-holder check — the unmatched-token test's waiter saw empty stderr because the old code does not consult records.
- 1 pass: "a run-check or base-run inside an admitted run starts at once over the threshold" — nested admission already exists in the old code (`AKROGON_RUN` matching the live holder token); the test carries over as regression coverage for C4 and stays green through the rewrite.
- `typecheck` check (`bun run typecheck` via `akrogon run-check`): clean. `format` check: clean (prettier rewrote the new file once; amended into the commit). Neighbor files under old code + new helpers: `run-check.test.ts` 17 pass, `base-run.test.ts` + `timing.test.ts` + `check-names.test.ts` 21 pass, 0 fail.
- `test` check (`bun test --timeout=30000`, full suite, same commit): 883 pass, 7 fail — all 7 are the planned reds above; `next.test.ts` and every other file pass. Known limitation: `test_changed` (`bun test --changed=$AKROGON_BASE`) runs markedly slower than the bunfig-parallel full run — it exceeded 500 s both times and `tests/next.test.ts` cases timed out on their internal 15–60 s waits (8 failures on the first run, the file is 235/235 green in the full run at the same commit). The flake has no cause in this diff — helpers.ts only adds env vars the old code ignores — but implement should re-run `test_changed` on a quiet host and investigate only if it still fails.

Commit `25c2fd4` on the leaf branch carries the tests before any product code.

## Docs touched

- `docs/guide/setup.md` — start-check paragraph replaces the permit paragraph.
- `docs/guide/files.md` — `wait_ms` = start-check wait.
- `README.md` — run-check/base-run rows describe the start check.
- `src/AREA.md` — `admission.ts` key-file line replaces the `permit.ts` line, naming both env seams.
- `tests/AREA.md` — rewritten test file's one-liner.

## Implementation notes (2026-10-13 check.fix)

- Threshold inputs must include nonzero `shmem` reaching the sum (review-B F1): `anon 40 GiB + shmem 9 GiB` in the competing-waiter test, refining D3's `anon + shmem` contract, not changing it.
- `run()` supplies no `AKROGON_SPACING_MS` (review-B F2): spacing tests exercise the shipped 30000 default; the helper deletes an ambient value only when the caller does not pass one, refining D4/D11's seam semantics, not changing them.
