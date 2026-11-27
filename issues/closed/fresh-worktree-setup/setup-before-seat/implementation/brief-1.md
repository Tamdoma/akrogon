# Sub-brief 1: dispatch-time setup core (unit W1-U1)

Wave 1. Commit A created the worker worktree at: `44c72f78` (confirmed).

## 1. Goal

Implement the leaf's core mechanism: akrogon runs the repo's configured `setup` in a leaf worktree before any seat works there. Plan decisions D1-D8 and D10. Owns `src/next.ts`, `src/config.ts`, `src/guard.ts`, `src/batch.ts`, `learnings/LESSONS.md`, `learnings/history/2026-11-25-fresh-worktree-skips-setup.md`. No other unit touches these paths.

## 2. Numbered acceptance criteria

From the leaf brief, the criteria this unit's code makes pass:

1. Setup runs once per checkout state in the leaf worktree before the first delivery: cwd=worktree, install lock held, leaf `.env` present, no `AKROGON_RUN`/`CLAUDECODE` in env; afterwards the marker holds the exact setup string; no rerun across re-prompt/`akrogon seat`; a changed setup string reruns once.
2. Adoption of a worktree with own commits runs setup there before first delivery.
3. `src/batch.ts:move` deletes the marker before `git reset --keep`; the next re-prompt reruns setup before the send.
4. Busy gate: setup due + a recorded seat live with status `working`/`blocked`/null or a live run-check → no setup, no delivery, no capacity row, no error, exit 0; `akrogon seat` exits non-zero naming the busy seat/run; `error` does not hold; delivery happens after the seat settles.
5. Failure: report names leaf/exit/output; no seat; created worktree removed with no `worktree:` in state; existing/adopted worktree kept unmarked; sibling still dispatched; next pass retries.
6. `setup` unset: nothing new runs, no marker, no guard.
8. Lesson retired: the `fresh worktree skips setup (2026-11-25)` line gone from `learnings/LESSONS.md`; the history file ends with `Applied 2026-11-25 by src/next.ts:ensureWorktree:<line of the setup step>: <what stops it>` — the line number resolved from your final diff.

The planned tests proving these already exist in the worktree (`tests/setup-dispatch.test.ts`, `tests/setup-busy.test.ts`, committed at `44c72f78`). They were verified red on the base and green on a scaffold of exactly this design. You write and edit no test. A test that is wrong or stays red once your code is correct is a mismatch returned to A with evidence.

## 3. Read-first list

In your worktree:

1. `src/next.ts` — `allocate`, `ensureWorktree`, `writeLeafEnv`, `dispatchLeaf`, `broadcastPass`, `seatCommand`, `createSparseWorktree` (read fully; this is the main edit).
2. `src/config.ts` — `setupCommand` (the flock/env composition to mirror), `leafTemp`, `ensureLeafTemp`, `INSTALL_LOCK_FILE` usage.
3. `src/run-check.ts` — `constructedEnv` (exported; use it unchanged).
4. `src/guard.ts` — the own-modules branch.
5. `src/batch.ts` — `move`/`applyTop`.
6. `src/admission.ts` — `liveRuns`; `src/reconcile.ts` — `leafSeats`.
7. `src/shell.ts` — `spawnCaptured`, `CommandError`.
8. `tests/setup-dispatch.test.ts`, `tests/setup-busy.test.ts`, `tests/setup-fixture.ts` — the contract your code must satisfy; read them before designing anything.
9. `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

Reference for depth (read-only, in the registered checkout): `/home/ivan/Work/infra/akrogon/issues/open/fresh-worktree-setup/setup-before-seat/plan.md` and `design.md` — the design's "Leaf architecture" section is the authoritative shape.

## 4. Change list and needed interfaces

Chunks that must land first: none (wave 1). Consumed output: none. Shared test resources: none with unit 2 (you run `tests/setup-*.test.ts`, it runs docs tests).

Exact contract:

**`src/config.ts`** — beside `setupCommand`:
- Export `SETUP_MARKER_FILE = 'akrogon-setup'` (or fold into one helper set) and reuse `INSTALL_LOCK_FILE` so `setupCommand` and the dispatch step share the constant (answers the design's open question: yes, one constant).
- Export marker helpers used by both `src/next.ts` and `src/batch.ts` without an import cycle: `setupMarkerPath(worktree)` resolving `git rev-parse --git-path akrogon-setup` in/at the worktree (git resolves it relative to the worktree), and `deleteSetupMarker(worktree)` (absent is fine). Keep them minimal.

**`src/guard.ts`** — export `ownModulesRefusal(cwd): string | null` holding the exact refusal text the own-modules branch prints today; `guard()` prints it, the setup step throws it. One message, one place.

**`src/next.ts`**:
- `allocate` runs `ensureLeafTemp` before `ensureWorktree` (the setup step's env needs the leaf temp).
- `allocate` computes busy from the `found` seats it already fetches (`leafSeats` result: a recorded seat whose terminal is live with status `working`, `blocked` or null status) and from `liveRuns()` entries whose repo and leaf match. It passes busy into `ensureWorktree`.
- `ensureWorktree` returns `State | { busy: string }`; the string is the detail a refusal names — for a seat: its slot, address and status (`no status` when null); for a run-check: its name and run id. When setup is due and busy, it returns the busy outcome **before** `writeLeafEnv` (so `.env`/`env_names`/`env_generation` stay in step) and before any dispatch.
- `allocate` returns the busy outcome as a distinct third shape beside `Allocation` and capacity `null`. Callers: `dispatchLeaf` ends the leaf's pass with `end('none')` (no capacity timing row, no error, `invocation.skipped` untouched); `broadcastPass` returns; `seatCommand` throws naming the busy seat address or the live run, e.g. `Refusing akrogon seat <slug> <slot>: setup is due in the worktree and <busy> holds the leaf`.
- The setup step in `ensureWorktree`, after `writeLeafEnv` and before the final `saveState`, in every branch ending with a worktree on disk (created, recreated, adopted, kept):
  - Due: `repo.config.setup !== undefined` and the marker is missing or its content differs. A differing marker is deleted before the run.
  - Run: resolve the install lock with `git rev-parse --git-path akrogon-install.lock` in the worktree, then `spawnCaptured(['flock', lock, 'sh', '-c', setup], { cwd: worktree, env: constructedEnv(repo, leafTemp(repo, slug)) })`. Stdin ignored by default, output captured. `constructedEnv` imported from `src/run-check.ts` — no import cycle exists (run-check never imports next).
  - Non-zero exit: throw `CommandError` (argv, cwd, exit code, captured output) — the failure propagates through `dispatchLeaf`'s existing per-leaf report catch.
  - Then the own-modules check in-process: `ownModulesRefusal(worktree)` non-null → throw the message.
  - Only then write the marker with the exact setup string.
  - Failure in a worktree **this call created**: remove it under `worktreeLock` with `git worktree remove --force` (mirror the catch in `createSparseWorktree`), rethrow; `createSparseWorktree` itself stays unchanged (verify and `buildStack` share it); `saveState` never runs, so no `worktree:` is recorded. An existing or adopted worktree is kept, unmarked. Only the setup step is covered by this removal — a `writeLeafEnv` failure keeps today's shape.
- With `setup` unset nothing runs: no command, no guard, no marker.

**`src/batch.ts:move`** — delete the marker (absent fine) immediately before `git reset --keep`, in that line order.

**Lesson retirement** — remove the `fresh worktree skips setup (2026-11-25)` line from `learnings/LESSONS.md`; append to `learnings/history/2026-11-25-fresh-worktree-skips-setup.md` the line `Applied 2026-11-25 by src/next.ts:ensureWorktree:<line of the setup step>: <what stops it>` with the line number from your final diff (grep your finished file). This lands last, after the code is final.

## 5. Do-not, reasons and exceptions

- Do not edit any test file or fixture. The tests are the leaf's locked proofs; a red or wrong one is a mismatch returned to A with the failing output and your evidence. Exception: none.
- Do not touch `createSparseWorktree`'s own catch, `src/verify.ts`, `buildStack`, `setupCommand`'s behavior, or check-side `withSetup` — explicitly excluded by the design; exception: none.
- Do not add a deadline/timeout to the setup run (locked decision Q3a). Exception: none.
- Do not call `refuse()` for the env and do not build the env by hand — `constructedEnv` unchanged is the locked decision (Q4a). Exception: none.
- Do not add a `node_modules`-existence trigger (locked decision Q1: marker only). Exception: none.
- Do not change an interface or scope; return a mismatch with evidence instead. Exception: a revised brief from A authorizing the change.
- Never run any `git stash` subcommand: every worktree of the repo shares one stash and a pop can lift a sibling's edit. To check behavior on the base use a second worktree of the base instead. To set work aside: commit it as a WIP commit and, before returning, `git reset --soft <creation commit>` and make the unit's returned commit once, so A's cherry-pick of that one commit carries all the work.
- Do not stop processes by command-line pattern (`pkill -f`, `killall`): the pattern matches other leaves' runs; use `akrogon stop-run <run-id>`.
- Restated: tests are locked and red ones come back as mismatches; excluded files and locked decisions stay untouched; no stash ever, WIP squashes into one returned commit.

## 6. Ordered steps

1. Install dependencies in your worktree first: `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile --backend=copyfile'` (the worktree has no `node_modules` — that absence is the very bug this leaf fixes).
2. Read the test files and the read-first list. Trace `allocate` → `ensureWorktree` → `dispatchSlot` end to end before editing.
3. `src/config.ts`: constants + marker helpers (criterion 1, 3).
4. `src/guard.ts`: extract `ownModulesRefusal` (criterion 5).
5. `src/next.ts`: the setup step, busy computation and the allocate outcome union with the three caller handlings (criteria 1-6). This is the bulk; keep it the smallest diff that satisfies the tests.
6. `src/batch.ts`: marker deletion in `move` (criterion 3).
7. Run the targeted tests (section 7). Iterate until green. If a test is wrong, stop and return a mismatch.
8. Write the lesson retirement with the final line number (criterion 8).
9. `git reset --soft <creation commit>` is NOT needed if you kept exactly one commit; otherwise squash your WIP commits into one commit carrying all the work. Commit message: `fix: run setup in leaf worktrees before seats, gated on busy` or similar honest summary.

Advisory size: about 6 files (4 source + 2 learnings) and under 60 turns. Beyond that, return a mismatch with evidence.

## 7. Commands

Run each through `akrogon run-check` and cite the printed `check <label>: <exit> <path>` lines in your report:

- `akrogon run-check --name u1-dispatch -- bun test tests/setup-dispatch.test.ts --timeout 180000`
- `akrogon run-check --name u1-busy -- bun test tests/setup-busy.test.ts --timeout 180000`
- `akrogon run-check --name u1-typecheck -- bun run typecheck`

The busy file takes ~20 s+ (a deliberate null-status delay). Never run `akrogon verify` and never the full suite.

## 8. Done-when, evidence and report

Both test files green and typecheck green on your commit, cited with their `check <label>: <exit> <path>` lines. Your one commit on the worker branch, its ID in the report. The lesson retirement carries the correct file:line. Read back any cited log with `akrogon log <path>`; paste at most short excerpts.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
