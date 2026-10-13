# Plan: run-permit

Debate: no. Synthesized directly from brief.md and design.md. No brief/design conflict found.

## Read first
- `docs/reference-index.md`, `src/AREA.md`, `tests/AREA.md`
- `learnings/LESSONS.md:23` (`bun run format` rewrites drift in `src/status.ts`; revert unrelated hunks after format)
- `/home/ivan/Work/infra/akrogon/issues/chart/host-test-load/proofs.md` T5 (flock through bun:ffi, SIGKILL release)
- `src/run-check.ts:44-56` constructedEnv, `:139-187` runCheck
- `src/base-run.ts:100-191` baseRun (wait only around spawnLogged at `:164`)
- `src/config.ts:69-78` reserved env names, `:197-199` globalHome
- `src/timing.ts:12-30` checkCore and check_start
- `src/status.ts:287-294` since, `:348-420` statusCommand overview
- `tests/helpers.ts` fixture, cli, fakeAkrogon, fakeHerdr; `tests/run-check.test.ts:311` existing nested run-check case

## Decisions
- D1 New `src/permit.ts` exports `withPermit<T>(holder: PermitHolder, fn: (admission: Admission) => Promise<T>): Promise<T>` and `liveHolder(): HolderRecord | undefined`. `PermitHolder = { repo: string; leaf: string; check: string }`. `Admission = { kind: 'held'; token: string; wait_ms: number } | { kind: 'nested'; token: string }`. fn receives the admission so the caller writes check_start after admission with wait_ms (design said "returns fn's result plus wait_ms"; passing it in is the implementation choice that lets check_start carry it).
- D2 Lock file `<globalHome()>/run.lock`, opened with `O_RDWR|O_CREAT|O_CLOEXEC` (0o2000000), mode 0o600. `flock(fd, LOCK_EX|LOCK_NB)` via `bun:ffi` `dlopen('libc.so.6')`, errno read immediately through `__errno_location` + `read.i32`. Only EWOULDBLOCK (11) is retried, polling every 250 ms. Any other errno throws an Error naming path and errno. No flock(1), no PID file lock.
- D3 Sidecar `<globalHome()>/run-holder.yaml`, written atomically (temp file + rename) right after acquire, zod-parsed on read. Keys: `token` (uuid), `pid` (int), `start_time` (string, `/proc/<pid>/stat` field 22, parsed after the last `)`), `boot_id` (string), `repo`, `leaf`, `check` (strings), `started` (ISO datetime). The holder removes the sidecar before closing the fd, in `finally`.
- D4 `liveHolder()` returns the sidecar only when the file exists, parses, `/proc/<pid>/stat` field 22 equals `start_time` and current boot id equals `boot_id`. Otherwise undefined. Status, the waiter line and nested reuse all use it.
- D5 Nested reuse: `process.env.AKROGON_RUN` non-empty and equal to `liveHolder()?.token` gives `{ kind: 'nested', token }` with no lock. Any mismatch takes the lock path.
- D6 Waiter line: on the first failed poll only, one stderr line `akrogon: waiting for run permit held by <repo>/<leaf> <check> pid <pid>`, or `akrogon: waiting for run permit held by holder unknown` when liveHolder() is undefined.
- D7 run-check: `withPermit({ repo: repo.name, leaf: slug, check: name ?? 'run' }, ...)` wraps check_start through check_end. `env.AKROGON_RUN = admission.token`. check_start carries `wait_ms` on the held path (0 when immediate) and omits it on the nested path.
- D8 `AKROGON_RUN` added to the reserved constructed set in `src/config.ts:69-78`. `src/timing.ts` check_start gains `wait_ms: z.number().int().nonnegative().optional()`.
- D9 base-run: `withPermit({ repo: repo.name, leaf: leaf.state.slug, check: 'base-run' }, ...)` wraps only the spawnLogged call. `env.AKROGON_RUN = admission.token`. Worktree prep, record writes and cleanup stay outside. No timing events.
- D10 status overview (no slug) prints `Run permit: <repo>/<leaf> <check> pid <pid> <since(now - started)>` once, after the Failed/Missing lines and before the repo tables, when liveHolder() is defined. Nothing for waiters, nothing in `status <slug>`.
- D11 `.gitignore` gains `run.lock` and `run-holder.yaml` beside `.lock`/`paused.yaml`.
- D12 Lock path stays akrogon home (design). B's `/run/user/<uid>` dissent is carried, not taken: open limitation is that two different AKROGON_HOMEs on one host do not share a permit.

Open limitations (accepted residuals, design): leftovers of a killed run overlap the next run; a SIGKILLed holder leaves check_start without check_end; a harness tool timeout leaves the waiter running in its pane; servers kept alive across separate run-check calls lose the permit between calls.

## Waves
Not serial-solo: wave 2 holds two units.

### Wave 1
- U1 permit core. Owns `src/permit.ts` (new), `src/run-check.ts`, `src/config.ts`, `src/timing.ts`, `.gitignore`, `README.md`, `docs/guide/setup.md`, `docs/guide/files.md`, `src/AREA.md`. Shared test resource: none. Prerequisite: none. Implements D1-D8, D11.

### Wave 2
- U2 base-run permit. Owns `src/base-run.ts`. Shared test resource: none. Prerequisite: U1. Implements D9.
- U3 status holder line. Owns `src/status.ts`. Shared test resource: none. Prerequisite: U1. Implements D10. Revert unrelated format drift (LESSONS:23).

## Docs checklist
- `README.md:147-148` run-check and base-run rows: hold one host-wide permit while the command runs (U1).
- `docs/guide/setup.md:70`: one sentence on the host-wide permit, the waiter line, nested runs not waiting (U1).
- `docs/guide/files.md:85`: check_start carries optional `wait_ms` (U1).
- `src/AREA.md`: one line for `src/permit.ts` (U1).
- `tests/AREA.md`: one line for `tests/run-permit.test.ts` (added with the tests).
- Agent docs (skills): none affected. The waiter's stderr line explains the wait.

## Credentials
The design names no credential variable. `akrogon status run-permit` prints no `Missing:` lines.

## Criteria, tests and proof
Proof command for every row: `bun test --timeout=30000 tests/run-permit.test.ts` (or the `test` check). Size: seconds (about 15 s for the file). Rerun trigger: any change to `src/permit.ts`, `src/run-check.ts`, `src/base-run.ts`, `src/status.ts`, `src/timing.ts`, `src/config.ts`.

| # | Test (tests/run-permit.test.ts) | Failure it catches |
|---|---|---|
| 1 | `a second run-check waits for the holder to exit, names the holder once and records its wait`; `a base-run waits for a live run-check holder before its command` | no permit, permit not taken by base-run, missing or repeated holder line |
| 2 | `a SIGKILLed holder frees the permit within a second while its setsid child lives` | lock held by generated shell or inherited fd, release tied to descendants, slow poll |
| 3 | `a run-check started inside an admitted run runs at once` (also `tests/run-check.test.ts:311`) | nested deadlock, AKROGON_RUN not passed |
| 4 | `a run token that does not match a live holder waits` (unknown token, dead PID, same PID with other start time) | token trusted without PID/start-time verification |
| 5 | `status and next complete while a run waits` | status/next touching the permit, waiting under the global lock |
| 6 | `status names the live holder and drops it once the holder is gone or dead` | missing holder line, stale sidecar shown |
| 7 | covered by test 1 (`wait_ms` on the waiter's check_start) | wait not recorded |

`tests/run-check.test.ts:50` allowlist gains `AKROGON_RUN` (D7), committed with a Test-Change trailer.

## Red evidence at plan.synthesis
Run on the leaf branch at 99a5ada before product code: `bun test --timeout=30000 tests/run-permit.test.ts`. Full `test` check under run-check: 858 pass, 7 fail, all seven the planned reds below. `typecheck` passes, `format` makes no change.

- C1 run-check: `run-permit.test.ts:118 expect(existsSync(second)).toBe(false)` Received: true (second command ran while the holder held).
- C1 base-run: `:158 expect(existsSync(base)).toBe(false)` Received: true.
- C2: `:191 expect(existsSync(second)).toBe(false)` Received: true (no permit to free, waiter never waited).
- C3: `:234 expect(result.code).toBe(0)` Received: 1 (inner command's `test -s run-holder.yaml` fails, no sidecar exists).
- C4: `:253 readSidecar` ENOENT `run-holder.yaml` (no holder record to mismatch).
- C5: `:302 expect(existsSync(second)).toBe(false)` Received: true (status and next completed but no run was waiting). Note: `next` with no leaves exits 1 with "No leaves match"; the test asserts completion, not success.
- C6: `:322 readSidecar` ENOENT `run-holder.yaml` (no holder line source).
- C7: same test as C1 run-check, its `wait_ms` assertion sits after the C1 red.
