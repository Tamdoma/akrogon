# Worker brief: durable check capture mechanism (U1)

Worktree: /home/ivan/.akrogon/worktrees/akrogon/durable-check-capture-u1
Leaf: durable-check-capture. Tests proving the criteria are already committed on the leaf branch (HEAD); you write product code only.

## 1. Goal

Implement plan decisions D1–D8: `akrogon run-check` (and every `checkedRun` caller) writes the command's stdout and stderr into run-unique capture files inside the holder from launch, prints their paths before waiting, keeps a shared flock on `<owner>/.lock` held by a wrapper-lived holder process plus the command's own flock wrapper, publishes the existing combined log and removes captures only on success, and `packFolder`/owner movement take the same lock exclusively while refusing fast when invoked from inside that owner's own capture.

## 2. Numbered acceptance criteria

1. `tests/durable-capture.test.ts` all five cases green on this worktree.
2. `tests/close-pack.test.ts` all cases green, including the rewritten `same-owner completion inside a capture refuses fast naming the run`.
3. `tests/run-check.test.ts` and `tests/check-names.test.ts` green (env allowlist gains `AKROGON_CAPTURE_OWNER`, `AKROGON_CAPTURE_RUN`; stderr gains the early `capture <name>:` line).
4. `bun run typecheck` clean.
5. Normal run behavior unchanged: `check <name>: <exit> <path>` line, exit code, stdout/stderr replay, `check-<name>-<ms>-<pid>.log` content (stdout then stderr), `check_start`/`check_end` timing on completed runs only, `refusal.json` + kept run root + `out.log` on publish refusal, no owner recreation.

## 3. Read-first list

- `src/run-check.ts` — whole file; `checkedRun`, `spawnLogged`, `runCheck`, `ownerRefusal`, `constructedEnv`, `copied`.
- `src/pack.ts` — `packFolder` scan order; `src/pack-command.ts` `packOne` refusal path (`RefusalError`, `refused <arg>:` line); `src/phase.ts` `completeOwner` (`.closing` → `packFolder` → `renameSync` → marker rm).
- `src/evidence.ts` — `locate`/`readMember`/`LogTarget` for owner-dir math.
- `src/shell.ts` — `spawnFiles`/`finishCaptured`/`Result`/`SpawnResult` (do not change).
- `src/scope.ts` — `runUnitArgv`, `startRunGuard` (`tail --pid` precedent).
- `src/admission.ts` — held vs nested admissions.
- `tests/durable-capture.test.ts`, `tests/close-pack.test.ts`, `tests/run-check.test.ts`, `tests/check-names.test.ts` — the contract.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

Owns (no other unit touches these): `src/flock.ts` (new), `src/run-check.ts`, `src/pack.ts`, `src/pack-command.ts`, `src/phase.ts`. Must land first: nothing. Shared test resource: none.

- `src/flock.ts`: `export function flockHold(path: string, mode: '-s' | '-x'): Promise<{ release: () => Promise<void> }>` — `Bun.spawn(['flock', mode, path, 'sh', '-c', 'printf ready\\n; exec tail --pid=$PPID -f /dev/null'])` with piped stdout/stderr; resolve when the first stdout line arrives; on child exit before that, throw an `Error` whose message carries the child's stderr; `release()` SIGKILLs the child and awaits `exited`.
- `src/run-check.ts`:
  - New `captureOwner(target, repo): Promise<string>` — same `locate` math as `ownerRefusal` (`recorded = resolve(target, 'out.log')`): `locate` null → `target`; one owner dir → `found.ownerDirs[0]` (chart `direct`); otherwise the open-path ancestor of `recorded` at member depth.
  - `spawnLogged(argv, cwd, env, capture: { out: string; err: string })` — `Bun.spawn` with `stdout: Bun.file(capture.out)`, `stderr: Bun.file(capture.err)`, await `exited`, read both files into `Result`. No `spawnCaptured`, no `captureRoot`.
  - `checkedRun`: after `env.AKROGON_RUN` is set, add `env.AKROGON_CAPTURE_OWNER = <captureOwner(target, repo)>`, `env.AKROGON_CAPTURE_RUN = run`. Compute `lockPath = resolve(owner, '.lock')`. Acquire `flockHold(lockPath, '-s')`, then recheck `ownerRefusal(target, repo, true)`; on fire write `refusal.json`, remove `.owner`, set `refused`, throw `PublishRefusedError` as today's late refusal does (message `captured output stays in <runRoot>/out.log`). Then `mkdirSync(target, { recursive: true })` + `existsSync(target)` gate (no owner recreation), create both capture files `capture-<encodeURIComponent(name)>-<run>-out.log`/`-err.log`, print `capture <name>: <out> <err>\n` on stderr, run the command. Command argv is wrapped `['flock', '-s', lockPath, ...argv]` for both admissions (held admission wraps `runUnitArgv(...)`).
  - After exit: read captures into `Result`, replay stdout/stderr as today, late `ownerRefusal` as today; refusal path writes `runRoot/out.log` from the captured bytes (same combined order) + `refusal.json`, deletes the capture pair under every `found.ownerDirs` member dir it can reach, throws `PublishRefusedError`. Success path: `copyFileSync(out→kept)` + `appendFileSync(kept, err-bytes)` (combined content equals today), `check_end` timing, then `unlinkSync` both captures only after publication succeeds. `mkdirSync(target)` at publish is removed. Wrap the flock holder in try/finally → `release()`.
- `src/pack.ts`: `export function enclosingCapture(folder: string): string | undefined` returning `AKROGON_CAPTURE_RUN` when `AKROGON_CAPTURE_OWNER` realpath-equals `folder`, `dirname`-equals it (chart `direct` vs chart folder), or names its open/closed/parked sibling with the same basename under the same `issues/<state>` root. `packFolder` starts with `if (enclosing... ) throw new Error(\`Refusing to pack ${folder}: inside run-check run ${run}\`)`, then wraps the whole body in `flockHold(resolve(folder, '.lock'), '-x')` before the `**/*.log` scan (including before the no-logs early return).
- `src/pack-command.ts` `packOne`: before `writeFileSync(marker)` — `const run = enclosingCapture(target.packDir); if (run !== undefined) { console.error(\`refused ${target.arg}: inside run-check run ${run}\`); throw new RefusalError(); }`.
- `src/phase.ts` `completeOwner`: before `writeFileSync(resolve(owner, '.closing'), '')` — `const run = enclosingCapture(owner); if (run !== undefined) throw new Error(\`Refusing to complete ${owner}: inside run-check run ${run}\`)`.

## 5. Do-not, reasons and exceptions

- Do not change `src/shell.ts`: other callers rely on `spawnFiles`/`spawnCaptured`/`finishCaptured` byte-for-byte. Exception: none; a shared need is a mismatch.
- Do not edit any test file: planned tests are A's. A red or wrong planned test is a mismatch return, never a test fix. Exception: none.
- Do not add timers, polls, sleeps, or non-blocking lock probes: locked design forbids them; waiting is `flock` blocking + positive file signals in tests. Exception: none.
- Do not widen the `copied` env allowlist or write `.env` files; the two `AKROGON_CAPTURE_*` names are set directly by `checkedRun`, never copied from the caller. Exception: none.
- Do not touch `src/reconcile.ts`, `src/admission.ts`, `src/timing.ts`, `src/evidence.ts`, `src/akrogon.ts`, or docs: unowned. Exception: a real gap returns a mismatch with evidence.
- Restated: the only route outside this change list is a mismatch back to A with evidence; never scope-widening edits.

## 6. Ordered steps

1. `src/flock.ts` — write `flockHold`. (AC 1,2,4)
2. `src/run-check.ts` — `captureOwner`, reworked `spawnLogged`, `checkedRun` capture/lock/print/publish/refusal lifecycle per §4. (AC 1–5)
3. `src/pack.ts` — `enclosingCapture` + `packFolder` refusal and exclusive lock. (AC 1,2,5)
4. `src/pack-command.ts` — `packOne` pre-marker refusal. (AC 2)
5. `src/phase.ts` — `completeOwner` pre-`.closing` refusal. (AC 2)
6. `bun install --frozen-lockfile`, `bun run typecheck`, then run §7 commands. (AC 1–4)

Advisory size: about 5 files and under 25 turns.

## 7. Commands

Run from the worktree (`akrogon` resolves the leaf owner automatically):

- `bun test tests/durable-capture.test.ts`
- `bun test tests/close-pack.test.ts`
- `bun test tests/run-check.test.ts tests/check-names.test.ts`
- `bun run typecheck`

Keep output through `akrogon run-check --name <label> -- <cmd>` and cite the `check <label>: <exit> <path>` lines.

## 8. Done-when, evidence and report

All §2 criteria green with pasted `check <label>: <exit> <path>` lines; commit only your chunk on the worktree's detached HEAD and return the commit id. No `Test-Change` trailer needed (no test file changes); any accidental test edit is a violation to report, not commit.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
