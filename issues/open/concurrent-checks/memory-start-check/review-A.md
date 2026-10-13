# Review A: memory-start-check

Base: `a7c9115` · Reviewed head: `53ef70a` (tree clean, branch ahead by 3 commits).

## Scope checked

Full diff `a7c9115...53ef70a`: `src/admission.ts` (new, 220 lines), `src/permit.ts` deleted, call-site renames in `run-check.ts`/`base-run.ts`, `status.ts` waiter listing, `tests/run-permit.test.ts` rewrite, `tests/helpers.ts` fake-env additions, 5 doc files. Compared against plan D1–D12, the brief's done-criteria and the locked design.

## Verification evidence

- `tests/run-permit.test.ts` @ `53ef70a`: 8/8 pass (35 s) — covers criteria 1–7 plus missing-stat and unmatched-token.
- `test_changed` (`bun test --changed=$AKROGON_BASE`): 871/871 pass.
- `typecheck`, `format`: green.
- `test` (full suite): 881–889 pass; the only reds were `next.test.ts`/`batch-dispatch.test.ts` internal timeouts under host load 40–65, retried green in isolation (235/235, 29/29). `inconsistent`, no base run needed — same-code `--changed` run and file reruns are green.
- AREA.md paths: all 31 named paths exist from repo root (`src/admission.ts` present, `src/permit.ts` correctly gone). `src/AREA.md` keeps its 4-section contract.
- Behavior trace in `admission.ts`: blocking flock on `admission.lock` is acquired only around `denied()` + record update (never across `fn()`); `runs/<sha256(token)>.yaml` written `waiting` before the poll loop, flipped `live` inside the admitting lock, removed in `finally`; `nested()` requires `state==='live'` + boot_id + pid start_time match; `waitingRuns()` skips malformed records and filters dead pids; `check_start.wait_ms` preserved for `held` only.
- Docs: `grep -ri "run permit"` over README/setup/files/AREA — clean; `setup.md` describes the start check, `files.md` names `wait_ms` the start-check wait.

## Findings

### Fix

**F1 — blank `AKROGON_SPACING_MS` silently disables the 30 s spacing guard.**
`src/admission.ts:62-67`: `Number('')` and `Number(' ')` are both `0`, so `spacingMs()` accepts a blank or whitespace env value and returns `0` — every subsequent start admits on the spacing condition with no error. Realistic source: an operator or harness exporting `AKROGON_SPACING_MS=` empty (env maps and systemd `Environment=` lines materialize empty strings; a wrapper doing `AKROGON_SPACING_MS="${X:-}"` produces it). Consequence today: the host-protection spacing this leaf exists for is silently off on every run-check/base-run started under that environment — the exact clog mode the design closes. The sibling parser `procRoot()` in `src/scope.ts` already rejects non-blank-invalid input; this one deviates. Hits criterion 3's spacing behavior under reachable input and the design's constants-not-config intent. Repair: reject blank/whitespace in `spacingMs()` (same shape as `cgroupRoot()`'s validation: `override.trim() === ''` → throw), keep `0` accepted only as an explicit `'0'`.

### Nits

- **N1** `status` prints `checking` for a waiting record that has not yet received a `wait_reason` (created pre-poll, or queued on the lock before its first denied check). Self-corrects within one 5 s poll; cosmetic. Promotion: a status consumer parsing the reason field.
- **N2** A `last-start` file holding a parseable future timestamp denies starts until wall time catches it and prints a negative `spacing -Ns` reason. Bounded by the clock-skew magnitude; absent/unparseable is already handled, parseable-future is not. Promotion: an operator reporting stalled starts after a clock correction.
- **N3** `AKROGON_SPACING_MS` is honored from any caller's environment and documented only in `src/AREA.md`, so it doubles as an undocumented escape hatch around the spacing guard. Accepted deliberately as a test seam (same class as `AKROGON_CGROUP_ROOT`/`AKROGON_PROC_ROOT`); the slice remains the hard cap and a caller can always bypass `run-check` entirely, so this adds no new bypass class. Promotion: a misuse seen in the wild or a request to harden the knob.
- **N4** Dead run records under `<globalHome>/runs/` persist when a wrapper is SIGKILLed; they are filtered by pid/start_time/boot_id validation and never shown, but the directory grows by one file per killed run. Bounded, self-limiting. Promotion: observed clutter or a status scan slowdown.

## Verdict

**fix** — F1 has a reachable input, a concrete consequence today and a one-condition repair.
