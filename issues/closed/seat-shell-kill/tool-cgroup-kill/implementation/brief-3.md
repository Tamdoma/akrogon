# Brief 3 — U3: recovered bare-shell seat takes the lost path

## 1. Goal

Implement plan decision D13 of `plan.md` (in the leaf folder) so that `tests/recovered-seat.test.ts` passes in full. The test file is the behavior spec; read it completely first.

## 2. Numbered acceptance criteria

1. The predicate matrix test passes: `recoveredShellSeat` exported from `src/next.ts` returns true for parked shapes (`pid` null, `reason` in signaled/server_stop/stopped_by_restart, status null, state live) and spawned shapes (`foreground.name` in the shell set, non-empty `argv` whose first word is not systemd-run), and false for `spawn_pending`, `systemd-run` argv0, non-shell foreground, non-null status, finished state, empty argv.
2. The integration test passes: a crafted `--keep` bash terminal carrying the leaf's seat labels, killed so hc replaces it with the machine shell, then `akrogon next <slug>` — exactly one `seat_lost` timing row with `slot A` and the crafted address, the crafted terminal ended, `lost.A` 1 in state, one replacement seat live. A second `next` pass charges nothing more and replaces nothing.
3. Pre-existing behavior unchanged: `tests/hc-delivery.test.ts` and `tests/next.test.ts` still pass unchanged — the predicate is used ONLY in `dispatchSlot`'s lost-seat branch, never in `liveSeat`, `allocate`, `activeCount` or `broadcastInProgress`.

## 3. Read-first list

- `tests/recovered-seat.test.ts` — the spec, read fully.
- `src/hc.ts` — `terminalSchema`, `seen()`, `Seen` type, `foregroundSchema`.
- `src/next.ts` — `dispatchSlot`'s lost-seat branch (the `seat === undefined || seat.state === 'finished'` condition and what follows it: the seat_lost row, `end`, `lost` counting, `startSeat`).
- `tests/hc-delivery.test.ts` — the existing lost-seat test for how rows/flows behave.
- `plan.md` decision D13 in `/home/ivan/Work/infra/akrogon/issues/open/seat-shell-kill/tool-cgroup-kill/plan.md`.
- this skill folder's `ponytail.md`.

## 4. Change list and needed interfaces

Owned paths: `src/hc.ts`, `src/next.ts`. Nothing else. Worker worktree created at commit `b9ebcf84e36565c17d2ca0a52ae8f9a32f3e7683` (filled at wave start).

Binding facts:

- `terminalSchema` gains `argv: z.array(z.string()).default([])`, `reason: z.string().nullable().default(null)`, and `foregroundSchema` gains `name: z.string().default('')`. `Seen` gains `argv: string[]`, `reason: string | null`, and its foreground type gains `name: string`. hc 0.1.22 exposes all three; an absent field reads as no match. Check the `seen()` transform — it spreads the parsed terminal, so schema additions flow through, but the `Seen` type must declare them.
- `recoveredShellSeat(t: Seen): boolean` exported from `src/next.ts`: `t.state === 'live' && t.status === null` AND (parked: `t.pid === null && t.reason != null && t.reason !== 'spawn_pending'` OR spawned: `t.foreground` non-null with `name` in {sh, bash, dash, zsh, fish, ash, ksh, nu} AND `t.argv.length > 0` AND basename of `t.argv[0]` is not `systemd-run`). The test's negatives include a `systemd-run`-first argv WITH a shell foreground — both conditions are required for the spawned shape.
- In `dispatchSlot`, extend exactly the lost-seat branch condition with `|| recoveredShellSeat(seat)`. Nothing else in the file changes. The existing lost path then runs as-is: seat_lost row, end, lost counting, replacement startSeat.
- The test reads raw hc JSON itself for the recovery wait; your schema fields are what `terminal.list` parsing accepts without stripping (zod non-strict objects strip unknown keys — the schema must declare the fields or `leafSeats`' `Seen` records never carry them).

## 5. Do-not, reasons and exceptions

- Do not write or edit any test file. A red or wrong planned test is a mismatch returned with evidence. Reason: A owns tests; exception: a revised brief from A.
- Do not touch any other source file. The predicate must not leak into `liveSeat`, `allocate`, `activeCount` or `src/reconcile.ts:broadcastInProgress` — design exclusion. Exception: none.
- Do not change hc-shim or fixture behavior. Reason: the test drives a REAL throwaway hc core; exception: none.
- Never run any `git stash` subcommand — worktrees share one stash. To set work aside: commit as WIP and before returning `git reset --soft b9ebcf84e36565c17d2ca0a52ae8f9a32f3e7683`, then make the unit's single returned commit.
- Do not stop processes by command-line pattern; use `akrogon stop-run <id>`. No exceptions.
- Restated: return a mismatch with evidence instead of changing scope, tests or interfaces; the only exception is a revised brief from A authorizing the change.

## 6. Ordered steps

1. Read the spec test and read-first list. Install dependencies per section 7. Run the red test once: `bun test tests/recovered-seat.test.ts --timeout=120000` — expect the missing-export failure.
2. Add the schema and type fields in `src/hc.ts`.
3. Add `recoveredShellSeat` and wire the lost branch in `src/next.ts`.
4. Run the targeted tests until green.

Advisory size: 2 files, under 30 turns.

## 7. Commands

Install first: `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile --backend=copyfile'`

Targeted tests, from your worktree:
- `bun test tests/recovered-seat.test.ts --timeout=120000`
- `bun test tests/hc-delivery.test.ts --timeout=120000` (regression guard — long, uses real hc cores)
- `bun test tests/next.test.ts --timeout=120000` (regression guard)

Keep output through `akrogon run-check --name <label> -- <cmd>` citing the `check <label>: <exit> <path>` line. Note: run-check inside your detached worktree may fail to resolve a leaf; if it does, run the bare command and paste its output directly instead, naming that deviation in your report.

## 8. Done-when, evidence and report

`tests/recovered-seat.test.ts` green end-to-end, both regression files green, one commit on top of the creation commit. You change no test file, so no `Test-Change` trailer applies.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
