# Unit U6: backpressure-safe run-check echoes (review finding F2)

## 1. Goal

Repair a proven defect in `src/run-check.ts`: the synchronous echo writer throws `EAGAIN` when a pipe reader keeps the pipe open but does not drain it, truncating output and exiting the writer 1 instead of the command's code. The echoes must deliver every byte through an open pipe no matter how slow the reader, while still swallowing `EPIPE` (closed pipe) as the leaf's criterion 2 requires.

## 2. Numbered acceptance criteria

1. `bun test tests/tool-kill.test.ts -t "open but undrained"` passes: 1 MiB on both streams with pipes never read — exit 7, the kept log holds all 2 MiB, stdout delivers the full echo, and the final `check slow: 7` summary prints on stderr.
2. `bun test tests/tool-kill.test.ts -t "closed stdout pipe"` passes: the criterion-2 case is unchanged — EPIPE still swallowed, exit 7, kept file and check_end row published.
3. No regression in the run-check consumers: `bun test tests/run-check.test.ts tests/durable-capture.test.ts` passes (read the filenames; if they do not exist, find the real run-check test files with ls tests/ and run those).

## 3. Read-first list

- `src/run-check.ts` — `writeSwallowingEpipe`, `checkedRun`'s publish/echo order, `runCheck`'s summary write.
- `tests/tool-kill.test.ts` — both writer cases (the closed-pipe case and the undrained-pipe case).
- The review-B probe result: a holder run with an open reader and 1 MiB per stream exited 1 with `EAGAIN`, echoed only 219,264 of 1,048,576 stderr bytes, and skipped the final summary (`implementation/check-review-b-pipe-1795607483124-249393.log` in the leaf folder — read it).
- This skill folder's `ponytail.md`.

## 4. Change list and needed interfaces

Owned paths: `src/run-check.ts` only. You write and edit no test — tests are committed and red on the head you start from; a test you believe is wrong is a mismatch returned to A.

Creation commit: `a08e388d0efe59cc00bfc5dcc6858958aacad0f6`.

The defect, precisely: process stdout/stderr pipes are non-blocking under Bun, so `writeSync` to a full pipe throws `EAGAIN` instead of blocking; the current loop propagates it. The repair must handle all of:

- `EPIPE` — closed reader: swallowed entirely (never rethrown), the publish never depends on the pipe. Unchanged behavior.
- `EAGAIN` — open but full pipe: the write must be retried after the pipe drains. How you wait is the unit's core decision; verify your chosen mechanism yourself with small probe scripts in $TMPDIR before writing (probe: does `writeSync` to a pipe throw EAGAIN in Bun, is `Atomics.wait` usable on the main thread in this Bun version — `bun -e` experiments). Acceptable shapes: retrying synchronous write with a blocking wait primitive that works on Bun's main thread (probe `Atomics.wait` on a SharedArrayBuffer; if the main thread refuses, a bounded spin with `Bun.sleepSync`/`usleep` equivalent is acceptable — the echo is the process's final act, so blocking the thread is semantically correct here); or an async write path (`fs.write` promise form) awaited sequentially, if you verify it does not lose ordering or the exit code in either pipe state. Do not regress to plain `process.stdout.write` — its EPIPE surfaces at exit-flush uncatchably and was the original bug.
- Ordering: bytes must arrive in order and completely; the final summary line must still be written after both echoes.
- Partial writes: keep the offset loop.

## 5. Do-not, reasons and exceptions

- Do not write or edit any test file; a wrong expectation is a mismatch with evidence. Exception: none.
- Do not change the publish order (kept file, check_end, unlinks before echoes) or what gets published: criterion 2 pins it. Exception: none.
- Do not swallow errors other than EPIPE and the retried EAGAIN: any other errno must still throw loudly — a writer that cannot report is worse than a dead one. Exception: none.
- Never run any `git stash` subcommand in the worktree: leaf worktrees share one stash. To set work aside, commit a WIP commit and, before returning, `git reset --soft a08e388d0efe59cc00bfc5dcc6858958aacad0f6` into one returned commit.
- Never stop a process by command-line pattern; use `akrogon stop-run <run-id>` for runs.
- Return a mismatch with evidence instead of changing scope or interfaces; the exception is a revised brief from A.

## 6. Ordered steps

1. Read section 3; reproduce the EAGAIN throw with a small $TMPDIR probe (spawn a writer shaped like the current code with undrained pipes). Probe `Atomics.wait` and the alternative write shapes. (criterion 1)
2. Implement the repair in `writeSwallowingEpipe` (or its replacement) in `src/run-check.ts`. (criteria 1, 2)
3. `bun test tests/tool-kill.test.ts -t "open but undrained"` — green; `-t "closed stdout pipe"` — green. Iterate as needed.
4. Run the broader run-check test files per section 2 criterion 3 — green.
5. Commit once.

Advisory size: 1 file, under 25 turns.

## 7. Commands

- `bun install --frozen-lockfile --backend=copyfile` first in your worktree if `node_modules` is absent.
- `akrogon run-check --name u6-pipes -- bun test tests/tool-kill.test.ts --timeout=120000` for evidence (the "failed removal" case in the same file belongs to another unit and may fail — note it, it is not yours). Fall back to bare `bun test` if run-check cannot resolve the leaf in your detached worktree.
- Never `akrogon verify` — that is A's.

## 8. Done-when, evidence and report

Both writer cases green, no regression in the run-check test files, one commit. Report with the commit id and these four lines filled:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
