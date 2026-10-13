# Brief 1: permit core (U1)

## 1. Goal
One host-wide permit held by the `akrogon run-check` process while its command runs, with nested reuse and a check_start wait field. Plan decisions D1-D8, D11 in `/home/ivan/Work/infra/akrogon/issues/open/host-test-load/run-permit/plan.md`.

## 2. Acceptance criteria
Planned tests (already committed, you write or edit no test): `tests/run-permit.test.ts`.
After this unit, these must pass:
1. `a second run-check waits for the holder to exit, names the holder once and records its wait` (C1 run-check, C7)
2. `a SIGKILLed holder frees the permit within a second while its setsid child lives` (C2)
3. `a run-check started inside an admitted run runs at once` (C3)
4. `a run token that does not match a live holder waits` (C4)
5. `status and next complete while a run waits` (C5)
Still red after this unit (other units own them): `a base-run waits ...` (U2), `status names the live holder ...` (U3).
Also `tests/run-check.test.ts`, `tests/config.test.ts`, `tests/timing.test.ts` stay green.

## 3. Read first
- `src/run-check.ts` (constructedEnv :44-56, runCheck :139-187)
- `src/config.ts:69-78` reserved names, `:197-199` globalHome
- `src/timing.ts:12-30`
- `tests/run-permit.test.ts` (what the tests observe: sidecar path and keys, stderr line, wait_ms)
- `/home/ivan/.claude/skills/implement-issue/ponytail.md`

## 4. Changes and interfaces
Owned paths: `src/permit.ts` (new), `src/run-check.ts`, `src/config.ts`, `src/timing.ts`, `.gitignore`, `README.md`, `docs/guide/setup.md`, `docs/guide/files.md`, `src/AREA.md`. Prerequisites: none. Shared test resource: none.

`src/permit.ts` exports:
```ts
export interface PermitHolder { repo: string; leaf: string; check: string }
export type Admission = { kind: 'held'; token: string; wait_ms: number } | { kind: 'nested'; token: string };
export type HolderRecord = z.infer<typeof holderSchema>;
export async function withPermit<T>(holder: PermitHolder, fn: (admission: Admission) => Promise<T>): Promise<T>;
export function liveHolder(): HolderRecord | undefined;
```
- Lock file `resolve(globalHome(), 'run.lock')`, opened with `openSync(path, constants.O_RDWR | constants.O_CREAT | 0o2000000 /* O_CLOEXEC */, 0o600)`.
- `dlopen('libc.so.6', { flock: { args: ['i32', 'i32'], returns: 'i32' }, __errno_location: { args: [], returns: 'ptr' } })`. LOCK_EX=2, LOCK_NB=4, EWOULDBLOCK=11. After a -1 return read errno at once with `read.i32(lib.symbols.__errno_location()!, 0)`. Retry only 11, every 250 ms (`Bun.sleep`). Any other errno: close the fd and throw `Error` naming path and errno.
- On the first failed poll only, write one stderr line: `akrogon: waiting for run permit held by <repo>/<leaf> <check> pid <pid>` from `liveHolder()`, or `akrogon: waiting for run permit held by holder unknown`.
- After acquire write sidecar `resolve(globalHome(), 'run-holder.yaml')` atomically (write `<file>.<pid>.tmp`, `renameSync`), YAML via `Bun.YAML.stringify`, keys: `token` (randomUUID), `pid` (process.pid), `start_time` (string: `/proc/<pid>/stat` field 22, parse the text after the last `)`, split on space, index 19), `boot_id` (`/proc/sys/kernel/random/boot_id` trimmed), `repo`, `leaf`, `check`, `started` (ISO). `holderSchema` is a zod object of these keys (`z.iso.datetime()` for started, int for pid).
- `liveHolder()`: undefined when the sidecar is absent; otherwise parse with holderSchema; return it only when `/proc/<pid>/stat` start time equals `start_time` and the boot id equals `boot_id`. A pid with no `/proc/<pid>` is dead (handle the ENOENT of a process dying between check and read by catching only `code === 'ENOENT'`, rethrow anything else).
- Nested: `process.env.AKROGON_RUN` non-empty and equal to `liveHolder()?.token` → call `fn({ kind: 'nested', token })` with no lock.
- Held: `fn({ kind: 'held', token, wait_ms })`, then in `finally` remove the sidecar (`rmSync(..., { force: true })`) and only then `closeSync(fd)`.
- The wait happens outside any `withLock`.

`src/run-check.ts`: wrap from `appendTiming(check_start)` through `appendTiming(check_end)` (and the log copy/return) in `withPermit({ repo: repo.name, leaf: slug, check: name ?? 'run' }, async (admission) => ...)`. Set `env.AKROGON_RUN = admission.token` (after the constructedEnv call, which already ran the env/pass_env loop). check_start gets `wait_ms: admission.wait_ms` only when `admission.kind === 'held'`.
`src/config.ts`: add `'AKROGON_RUN'` to the `constructed` set.
`src/timing.ts`: check_start gains `wait_ms: z.number().int().nonnegative().optional()` (check_start only, not check_end).
`.gitignore`: add `run.lock` and `run-holder.yaml` after `paused.yaml`.
Docs, one line or sentence each: `README.md:147-148` rows (holds one host-wide permit while the command runs), `docs/guide/setup.md:70` (permit, waiter stderr line, nested runs do not wait), `docs/guide/files.md:85` (check_start carries optional `wait_ms`), `src/AREA.md` (one Key files line for `src/permit.ts`; keep the file at most 40 lines and its four sections).

## 5. Do-not
- No edits to `src/base-run.ts` or `src/status.ts`: other units own them.
- No test edits: a planned test that is wrong is a mismatch returned to A with evidence.
- No flock(1), no PID file as the lock, no wait timeout, no merge priority, no per-run systemd units (locked design).
- No session-bus change in constructedEnv (another leaf owns it).
- Do not leave `bun run format` drift in untouched files (revert unrelated hunks, LESSONS:23).
Reasons restated: other units own those files, tests are locked after planning, the design forecloses those mechanisms. Exception: a revised brief from A.

## 6. Steps
1. `src/permit.ts`, then `src/config.ts`, `src/timing.ts`, `src/run-check.ts`: criteria 1-5 green.
2. `.gitignore` and the four docs.
3. `bun run typecheck`, `bun run format` (revert unrelated hunks), then section 7.
Advisory size: about 9 files, under 30 turns.

## 7. Commands
From the worktree: `bun install --frozen-lockfile` once, then
`AKROGON_BASE=99a5ada582267e92d227c005eb1705ce7dc80576 bun test --changed=99a5ada582267e92d227c005eb1705ce7dc80576 --timeout=30000`
Expected red only: the base-run and status-holder tests in `tests/run-permit.test.ts`.

## 8. Done-when
Criteria 1-5 green, typecheck clean, one commit on your detached HEAD (message `feat: hold a host-wide run permit in run-check`, no co-author line). Return the commit ID and:

Changed files and reasons:
Tests run:
Known limitations:
Unverified criteria:
