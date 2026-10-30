# Sub-brief 1: capture fd lock + abandonedCaptures in src/run-check.ts

Worktree: `/home/ivan/.akrogon/worktrees/akrogon/abandoned-capture-stop-u1`

## 1. Goal

Implement plan decisions D1–D3 for leaf abandoned-capture-stop: capture-out is created on an fd
whose open description is locked with `flock -s` for the run's life, the child writes stdout to that
fd, and `abandonedCaptures(folder)` lists capture pairs that are cleared neither by a non-blank
`cleared-<run>.md` nor by a live lock.

## 2. Numbered acceptance criteria

1. `checkedRun` creates `captureOut` via `openSync(captureOut, 'w')`, locks that description by
   `Bun.spawnSync(['flock', '-s', <capFd-as-string>])` before the `capture <name>:` stderr line and
   the `check_start` timing write, and keeps `capFd` open until after both `unlinkSync` calls on the
   success path — and closed in a `finally` covering the refusal (`refusePublish`) and throw paths.
   `flock` receives the existing fd by number (the spawned helper inherits parent fds). If the
   `flock` helper exits non-zero, `checkedRun` throws before running the command.
2. `spawnLogged(argv, cwd, env, capture: { out: string; outFd: number; err: string })` spawns with
   `stdout: capture.outFd` instead of `Bun.file(capture.out)`; `outRead`/`errRead` stay path-opened
   (`openSync(capture.out, 'r')` still works) and `stderr` stays `Bun.file(capture.err)`. Both call
   sites (nested `flock -s <lockPath>` and the `runUnitArgv` `systemd-run --scope` form) pass the
   same fd. Exported signature change is fine; grep for other `spawnLogged` callers first — if any
   exist outside `checkedRun`, update them the same way.
3. New exported `abandonedCaptures(folder: string): { out: string; err: string; cleared: string }[]`
   in `src/run-check.ts`: scans `folder` recursively for names matching
   `/^capture-.+-([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})-out\.log$/`; for each
   candidate computes `err` (swap `-out.log`→`-err.log`) and
   `cleared = join(dirname(out), 'cleared-<run>.md')`; skips when `cleared` exists with non-blank
   (`trim().length > 0`) content; else opens `out` with `openSync(out, 'r')` (O_RDONLY, never
   creates) and probes `Bun.spawnSync(['flock', '-n', '-x', <fd-as-string>])` — exit 0 means the
   pair is abandoned and is collected. `ENOENT` on the open (pair vanished between scan and probe)
   skips the pair. The probe fd is always closed. A `-err.log` with no `-out.log` sibling produces
   no candidate. Include `{ out, err, cleared }` absolute paths in results.
4. `tests/durable-capture.test.ts` stays green byte-for-byte (fd-passed stdout keeps byte order and
   content): run it and paste results.

## 3. Read-first list

- `src/run-check.ts` — `checkedRun`, `spawnLogged`, the `capture <name>:` block, `refusePublish`,
  the unlink site.
- `src/flock.ts` — `flockHold` for repo style; do NOT reuse it (separate helper process = startup
  gap, design F13).
- `tests/durable-capture.test.ts` — existing capture assertions.
- `tests/abandoned-capture.test.ts` — the planned tests (do not edit; T1's refusal is a different
  unit's job and stays red).
- `skills/implement-issue/ponytail.md` (in the worktree as `skills/implement-issue/ponytail.md`).

## 4. Change list and needed interfaces

- `src/run-check.ts` only. Imports to add: `Bun.spawnSync` is a global; `openSync`, `closeSync` are
  already imported; `readdirSync`/glob support for the scan (`Bun.Glob` `scanSync` with
  `dot: true` is used in `src/pack.ts` — copy that pattern, `**/capture-*-out.log` + regex filter).
- Interface consumed by the next unit: `export function abandonedCaptures(folder: string):
  { out: string; err: string; cleared: string }[]`.
- No other unit may touch `src/run-check.ts`; you own it fully this wave.

## 5. Do-not, reasons and exceptions

- Do not edit any test file — planned tests are A's; a red planned test that your correct code
  should pass is a mismatch, return it.
- Do not touch `src/phase.ts`, `src/flock.ts`, skills or docs — other units own them.
- Do not create capture-err on an fd or lock it — only capture-out; the pair's liveness is told
  from one file.
- Do not add flags/options beyond the signature above — plan-locked shape.
- Reason: locked design decisions D1–D3; exception: a revised brief from A.

## 6. Ordered steps

1. Read `src/run-check.ts` end to end; grep `spawnLogged` and `capture-` callers.
2. Edit `checkedRun` (openSync + flock + finally-held fd) and `spawnLogged` (outFd).
3. Add `abandonedCaptures` beside them.
4. `bun run typecheck` and the commands in section 7.
5. Commit one commit with a message like
   `run-check: shared flock on capture-out open description and abandonedCaptures`.

Advisory size: 1 file, under 20 turns.

## 7. Commands

Run in the worktree, output kept via `akrogon run-check` per section 8:

- `bun install --frozen-lockfile --backend=copyfile`
- `bun run typecheck`
- `bun test tests/durable-capture.test.ts --timeout=30000`
- `bun test tests/run-check.test.ts --timeout=30000` if that file exists (check first).

Do NOT run `tests/abandoned-capture.test.ts` for a green verdict — its refusal case stays red until
the phase gate lands; if you run it for diagnosis, report only whether its two other tests
(`live pair`, `probe`) pass.

## 8. Done-when, evidence and report

The four criteria pass with evidence: typecheck green, durable-capture green, commit id reported.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
