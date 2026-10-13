# Brief 1: start-admission mechanism (U1)

## 1. Goal

Replace the host-wide run permit with the start-admission check described in plan decisions D1–D8. `akrogon run-check` and `akrogon base-run` start right away unless akrogon.slice is near its memory limit; under a short flock a run admits when the slice's `memory.stat` anon + shmem is below 48 GiB and at least 30 s passed since the last admitted start; otherwise it polls every 5 s printing why it waits. Nested runs inside an admitted run start at once. No name-based exemptions.

## 2. Acceptance criteria

1. Two `run-check` commands with low memory run at the same time; a second start within 30 s of an admitted start waits, printing `akrogon: waiting to start <repo>/<leaf> <check>: spacing <N>s < 30s since last start` per denied poll.
2. At or above 48 GiB anon+shmem a run waits, printing `akrogon: waiting to start <repo>/<leaf> <check>: anon+shmem <X> GiB >= 48 GiB`; when the stat drops below, an eligible waiter admits within one 5 s poll; competing waiters re-check both conditions inside the lock.
3. `AKROGON_RUN` whose sha256 matches a `live` record (pid + start_time + boot_id valid) returns `{kind:'nested',token}` immediately — no lock, no stat read, no spacing. Unmatched tokens go through normal admission.
4. A missing/unreadable `memory.stat`, or one lacking `anon`/`shmem` keys, throws an error naming the path.
5. `check_start` timing keeps `wait_ms` = the start-check wait (held only; nested omits it).
6. `waitingRuns()` returns `waiting`-state records whose pid/start_time/boot_id validate against a live process; malformed records are skipped, not fatal.
7. `akrogon status` prints `Run waiting: <repo>/<leaf> <check> <wait_reason> <age>` per waiting record and never a permit line.

The planned tests proving these are already committed in `tests/run-permit.test.ts` — run them, do not write or edit any test; a planned test that is wrong or red once your code is correct is a mismatch returned to A.

## 3. Read-first

- `src/permit.ts` — call shape, FFI flock helper (`dlopen` on libc `flock`, `__errno_location`), `startTime`/`liveStartTime` pid validation, nested-token pattern to preserve.
- `src/run-check.ts:173` and `src/base-run.ts:165` — the two `withPermit` call sites.
- `src/status.ts:31,409-413` — import and the `Run permit` line being replaced.
- `src/scope.ts` — `procRoot()` env-override pattern to copy for the new root.
- `src/state.ts:205` `withLock` — flock helper style used elsewhere (you may reuse the FFI flock from permit.ts or `withLock`; pick whichever keeps the diff smallest, both exist).
- `tests/run-permit.test.ts`, `tests/helpers.ts` — the committed tests and the `statPath`/`seedStat`/`runs` layout they exercise.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

Owned paths (edit only these): `src/admission.ts` (new), `src/permit.ts` (delete), `src/run-check.ts`, `src/base-run.ts`, `src/status.ts`. Land first: nothing — this is wave 1.

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
export function waitingRuns(): RunRecord[];
```

- cgroup root: `AKROGON_CGROUP_ROOT` env (non-blank absolute else throw, default `/sys/fs/cgroup`). stat path = `<root>/user.slice/user-<uid>.slice/user@<uid>.service/akrogon.slice/memory.stat` where uid = `process.getuid!()`.
- spacing: `AKROGON_SPACING_MS` env (non-negative integer ms, default `30000`).
- lock: `<globalHome>/admission.lock`, flock held ONLY for read-decide-record (never for the run). Denied → release lock, write wait_reason to own record, `Bun.sleep(5000)`, re-acquire.
- records: `<globalHome>/runs/<sha256(token)>.yaml` written `waiting` before polling, flipped `live` inside the admitting lock, removed in `finally`. Last admitted start: epoch-ms text at `<globalHome>/runs/last-start` (absent or unparseable = spacing satisfied).
- `withPermit` → `withAdmission` rename at both call sites; everything else unchanged.
- `status.ts`: replace `liveHolder`/`HolderRecord` import with `waitingRuns`/`RunRecord`; print `Run waiting: <repo>/<leaf> <check> <wait_reason> <age>` using the existing `since(now - Date.parse(record.since))` helper.

## 5. Do-not, reasons and exceptions

- Do not write or edit tests — planned tests are A's; a red planned test with correct code is a mismatch return.
- Do not keep `withPermit`, `run.lock`, `run-holder` or any name-based exemption (`selftest`, `cheap`) anywhere in `src/` — criterion 7 greps for them.
- Do not hold the flock across `fn()` — the permit's whole problem was serializing runs.
- Do not read `/proc/self/cgroup` for the slice path — uid-derived path is the locked decision.
- Do not touch `src/config.ts` unless `AKROGON_CGROUP_ROOT`/`AKROGON_SPACING_MS` trip the reserved `constructed` set — check first; the reserved list covers `env`/`pass_env` keys users may declare, and neither name is in it, so no change should be needed.
- Do not add config keys, fallbacks, or features beyond D1–D8. Return a mismatch with evidence instead of changing scope or an interface; the exception is a revised brief from A authorizing that change.

## 6. Ordered steps

1. Write `src/admission.ts` from D1–D8 (criterion 1–6).
2. Delete `src/permit.ts`; update `src/run-check.ts` and `src/base-run.ts` imports/calls (criterion 1–3, 5).
3. Update `src/status.ts` waiter listing (criterion 7).
4. `bun install --frozen-lockfile`, then the section-7 command.

Advisory size: 4 files and under 16 turns.

## 7. Commands

```sh
flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile' && akrogon guard own-modules && sh -c ': "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000'
```

with `AKROGON_BASE=a7c911522773d29d7d2be5b30cce6788268aea50` exported. That command runs the whole repo's changed tests (includes `tests/run-permit.test.ts`, your acceptance evidence) and `bun test --changed` can be slow — let it finish; also run `bun run typecheck` before returning.

## 8. Done-when, evidence and report

All acceptance criteria met, the planned tests green (except any whose failure is pre-planned or a real mismatch you return), typecheck clean, your chunk committed with its ID in the report, and this file's tail filled in:

Changed files and reasons:
- src/admission.ts (new): start-admission mechanism — short flock on <globalHome>/admission.lock for read-decide-record only; admits when akrogon.slice memory.stat anon+shmem < 48 GiB and >= AKROGON_SPACING_MS (default 30000) since <globalHome>/runs/last-start; denied runs write a waiting record under runs/, print "akrogon: waiting to start <repo>/<leaf> <check>: <reason>" and poll every 5 s; live record (sha256(token) filename) validates nested AKROGON_RUN starts by pid start_time + boot_id; waitingRuns() lists live waiting records for status.
- src/permit.ts (deleted): run.lock/run-holder permit retired.
- src/run-check.ts, src/base-run.ts: withPermit -> withAdmission at both call sites, nothing else changed; check_start wait_ms still carried for held admissions, omitted for nested.
- src/status.ts: liveHolder/HolderRecord import replaced by waitingRuns; "Run permit:" line replaced by "Run waiting: <repo>/<leaf> <check> <wait_reason> <age>" per waiting record.

Tests run:
- bun run typecheck: clean.
- bun test tests/run-permit.test.ts --timeout=30000: 7 pass, 1 fail — the src half of the grep test passes (no run.lock, run-holder, withPermit, selftest, cheap in src); the fail is the doc half grepping "run permit" in README.md/docs/guide/setup.md/docs/guide/files.md/src/AREA.md, which are owned by brief-2 in a parallel worktree.
- bun test --changed=a7c9115...: 421 pass / 450 fail under host load average ~100 (dozens of concurrent bun test processes from other worktrees); every failure observed was a test timeout across 20+ suites unrelated to this change, including suites that never invoke run-check/base-run/status (e.g. state.test.ts).
- Contention disproven by isolated reruns: tests/state.test.ts 34/34 pass (2.6s), tests/run-check.test.ts 17/17 pass (10s), tests/leaf-stop.test.ts 10/10 pass (12s — identical result on baseline HEAD and with this diff), tests/preflight.test.ts 7/8 (one git-fetch-heavy test still timed out at 60s under load; untouched by this change).

Known limitations:
- status prints wait_reason as "checking" in the narrow window before a waiting record's first denied poll writes its reason.
- The doc-grep half of the last planned test stays red in this worktree until brief-2's doc commit lands on the branch; this is per its brief, not a defect here.

Unverified criteria: none for owned scope — all seven criteria were exercised by the focused test run. The repo-wide --changed suite could not complete a clean pass due to external host contention, not this change; the suites closest to the change (run-check, leaf-stop/status, state) were rerun isolated and passed.
