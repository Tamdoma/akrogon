# Plan: setup-before-seat

Slot A synthesis, 2026-11-25. From the leaf brief and design; the design's binding decisions hold verbatim. No conflict between brief and design found.

## Read-first

1. `src/next.ts` — `allocate`, `ensureWorktree`, `writeLeafEnv`, `dispatchLeaf`, `broadcastPass`, `seatCommand` (`end('none')`/`recordWait` shape).
2. `src/config.ts` — `setupCommand`, `withSetup`, `leafTemp`/`ensureLeafTemp`, `constructedEnv` is **not** here (run-check.ts).
3. `src/run-check.ts` — `constructedEnv` (allowlist; `AKROGON_RUN`/`CLAUDECODE` absent by construction), `refuse` (not called).
4. `src/guard.ts` — `guard`, the own-modules branch.
5. `src/batch.ts` — `move`/`applyTop` (`reset --keep` path).
6. `src/admission.ts` — `liveRuns`, `ownLive`.
7. `src/reconcile.ts` — `leafSeats` (recorded-address match).
8. `src/shell.ts` — `spawnCaptured`, `CommandError`.
9. `src/seat.ts` — `startSeat` (name collision on a live same-name terminal; `state.seat` re-recorded).
10. `src/timing.ts` — `recordWait`, `capacityWaits`.
11. `tests/first-allocation.test.ts`, `tests/next.test.ts`, `tests/hc-delivery.test.ts` — CLI boundary, `holdTurns`, live run-check records, `hc kill/rm`.
12. `tests/setup-fixture.ts` — recording setup scripts, log-order helpers (new, committed).
13. `docs/reference/config.md` (`setup` row), `docs/reference/checks.md` (`setup` paragraphs), `src/AREA.md` (first-allocation pattern, `akrogon config` composition note).
14. `learnings/LESSONS.md` + `learnings/history/2026-11-25-fresh-worktree-skips-setup.md` — the lesson this leaf retires.

## Decisions

- **D1 Marker.** File `akrogon-setup` at the worktree's own `git rev-parse --git-path`, content exactly the `setup` string, written only after setup and the guard succeed. Due when missing or differing; a differing marker is deleted before the run. `git rev-parse` resolves it relative to the worktree, so resolution runs inside/at the worktree (as `emitEnvFile` already does for its temp file). No `node_modules` trigger (C's standing dissent recorded, not adopted).
- **D2 Call site.** The setup step lives in `ensureWorktree`, after `writeLeafEnv` and before the final `saveState`; the busy return happens before `writeLeafEnv` so `.env`/`env_names`/`env_generation` stay in step. `allocate` runs `ensureLeafTemp` before `ensureWorktree` and passes busy in; `ensureWorktree` returns `State | { busy: string }` where the string is the detail a refusal names (seat slot, address and status, or the run-check name and run id).
- **D3 Command.** `flock <resolved lock> sh -c <setup>` via `spawnCaptured` with `cwd: worktree`, `env: constructedEnv(repo, leafTemp(repo, slug))`, stdin ignored by default; the lock path is `git rev-parse --git-path akrogon-install.lock` resolved against the worktree. A non-zero exit throws `CommandError` (argv, cwd, exit code, captured output); then the in-process `own-modules` check throws the guard's refusal text; then the marker write. No `refuse()` call (locked Q4a). No deadline (locked Q3a; standing residual recorded: a hung setup holds the pass until the listener's `PASS_DEADLINE_MS` group kill or an operator kill).
- **D4 Busy.** Computed in `allocate` from the `leafSeats` result it already fetches plus `liveRuns()` matching repo+leaf: busy is a recorded seat live with status `working`, `blocked` or null, or a live/waiting run record. `error`, `idle`, `done`, finished terminals and ended runs are not busy. `allocate` returns the busy outcome beside `Allocation` and capacity `null`: `dispatchLeaf` ends the pass with `end('none')` (no capacity row, no error, `invocation.skipped` untouched), `broadcastPass` returns, `seatCommand` throws naming the seat or run. `phaseWake`/`unpausePass`/`landedWake` need no handling (design leaf architecture, C).
- **D5 Failure path.** Only the setup step is covered by remove-on-failure (a `writeLeafEnv` failure keeps today's shape). A worktree this `ensureWorktree` call created is removed under `worktreeLock` with `git worktree remove --force` (as `createSparseWorktree`'s own catch), never in `createSparseWorktree` itself (verify/buildStack share it); an existing or adopted worktree is kept unmarked. `saveState` never runs on failure, so no `worktree:` is recorded and `capRefusal` counting is unchanged.
- **D6 Move invalidation.** `src/batch.ts:move` deletes the marker (absent fine) immediately before `git reset --keep` — the same line order the brief states, so the invalidation cannot be lost to an early return after the reset.
- **D7 Sharing.** `INSTALL_LOCK_FILE`/`SETUP_MARKER_FILE` constants plus `setupMarkerPath`/`deleteSetupMarker` in `src/config.ts` beside `setupCommand`, which reuses the constant — this answers the design's open question: yes, one constant, so the check-side composition and the dispatch step never drift. `src/guard.ts` exports `ownModulesRefusal(cwd)` returning the message or null; the `guard` verb prints it, the setup step throws it. No import cycle: `next.ts` may import `constructedEnv` from `run-check.ts` (run-check's imports never reach next.ts); `config.ts` stays below both.
- **D8 Unset setup.** Nothing runs: no command, no guard, no marker (locked Q6a).
- **D9 Docs.** `docs/reference/config.md` `setup` row and `docs/reference/checks.md` `setup` paragraph say setup also runs in a leaf worktree before a seat works there, once per checkout state; `src/AREA.md` first-allocation pattern paragraph and the `akrogon config` composition note gain the dispatch-time duty (marker, busy gate, removal on failure).
- **D10 Lesson retirement.** The leaf removes the `fresh worktree skips setup (2026-11-25)` line from `learnings/LESSONS.md` and ends `learnings/history/2026-11-25-fresh-worktree-skips-setup.md` with `Applied 2026-11-25 by src/next.ts:ensureWorktree:<line of the setup step>: <what stops it>`. The line number is written at implementation time when the diff is final.
- **D11 Tests first.** `tests/setup-dispatch.test.ts`, `tests/setup-busy.test.ts`, `tests/setup-fixture.ts` are written and committed red on the base ahead of all product code (commit `44c72f78`), with the `Test-Change` trailers. Implementation edits product files only.
- **D12 `akrogon seat` test shape.** hc refuses a second terminal under a live seat's name, so tests exercise `akrogon seat` the way the command is actually used: after retiring the live seat (`hc kill`/`rm`). This is usage, not a product gap.

## Acceptance criteria, proofs and condition checks

Proofs are the leaf's own tests at the real boundary: fixture home, temp git repos, the real hc core with the stand-in agent. Free tests; the paid-budget sizing rule does not apply. Test commands run through `akrogon run-check` from the worktree; proof is per whole file. Rerun trigger for both files: any change under `src/next.ts`, `src/config.ts`, `src/guard.ts`, `src/batch.ts`, `src/admission.ts` or the fixture helpers; size: seconds-to-minutes (whole file: dispatch ≈3 s core section + busy ≈21 s dominated by the 20 s null-status delay; the configured suite reruns changed test files ×5).

Red evidence recorded at plan time (test commit `44c72f78` holds exactly what ran):

- Base red, both files, before any product code:
  - `check setup-dispatch-c1-c6-base: 1` — criteria 1, 2, 3 and the three criterion-5 tests fail (no setup ever runs: `Received: 0` call records, missing marker, pass exits 0); criterion 6 passes on the base as the design predicts.
  - `check setup-busy-c4-base: 1` — all five criterion-4 tests fail (`Expected: 1, Received: 0`).
- Scaffold green (temporary product edit, since discarded): `check setup-dispatch-scaffold2: 0` (7 pass), `check setup-busy-scaffold3: 0` (5 pass) — proof the tests discriminate behavior, not fixture noise. Two scaffold runs failed earlier on test bugs only (`name_taken` live seat, stale-marker assertion contradicting locked decision D 2): corrected in the test commit.
- Deliberate break for criterion 4 (the busy test dropped: `if (busy !== null && due) return { busy }` removed): `check setup-busy-c4-break: 1` — the working, blocked, null and run-check cases go red on `setupCallsFor`/`setupCalls` `Expected: 1, Received: 2`; the error case correctly stays green (error is not busy). Break discarded.
- Deliberate break for criterion 6 (the unset check dropped: the own-modules guard ran unconditionally): `check setup-dispatch-c6-break: 1` — dispatch exits 1 instead of 0 with the guard refusal. Break discarded.

### C1 — fresh leaf: setup once per checkout state before the first delivery

Proof: `tests/setup-dispatch.test.ts` `criterion 1` — records cwd=worktree, `lock=held` (`flock -n` probe fails inside the run), `dotenv=yes` (leaf `.env` written first), `run=unset`/`cc=unset` even with `AKROGON_RUN`/`CLAUDECODE` set in the caller's env, marker content exactly the setup string, `task-build` after the setup records, no rerun across a re-prompt and `akrogon seat`, one rerun on a changed string.
Command: `akrogon run-check --name setup-dispatch-c1 -- bun test tests/setup-dispatch.test.ts --timeout 180000`
Conditions traced: "before the seat's first task is delivered" — the ordering assertion is the log line order written by two independent processes (hook vs setup); a send-first implementation emits `task-build` first. "Do not rerun" — the due read happens fresh in each `ensureWorktree` invocation in the same process as its use; no cached due state exists to go stale. "Env" — `constructedEnv` copies only its allowlist; the test sets both names in the caller env so absence is proven, not inherited luck.

### C2 — adoption runs setup in the adopted worktree

Proof: `tests/setup-dispatch.test.ts` `criterion 2` — the adopted worktree (branch with own commits, file `own`) is the cwd of the setup record and keeps its content; setup line precedes `task-build`.
Command: same as C1.
Conditions: the adopted path is never recreated, asserted by `own` surviving and `cwd=` naming the store path.

### C3 — move invalidates; the check.repair re-prompt reruns setup before the send

Proof: `tests/setup-dispatch.test.ts` `criterion 3` — drives the real exported `move` in-process on a fixture leaf in `check.repair` (a CLI invocation is itself the product behavior, so the in-process call at the same boundary stands), asserts the marker gone immediately after `move`, then a live idle re-prompt pass: second setup record ordered between the two `task-build` lines, both deliveries `check-issue` prompts.
Command: same as C1.
Conditions: "before `git reset --keep`" (D6) — the deletion preceding the reset in code order is the same keep state (one `move` invocation); an after-reset deletion would pass this test, noted as a review-visible line order. Dirty/untracked files in the worktree (`.env`, `node_modules`) do not block `reset --keep`, so the leaf worktree is always eligible.

### C4 — busy gate

Proof: `tests/setup-busy.test.ts`, four cases: working seat and blocked seat (parametrized `holdTurns` hook), a live run-check record (real admission record from a sleeping `run-check`), a null-status seat (20 s stand-in start delay), plus the negative case (error status does not hold). Assertions cover every bullet: no setup for the busy leaf, tasks unchanged, no `wait`/`capacity` timing row, exit 0, no `build` in stderr, the unstarted sibling dispatches in the same pass, `akrogon seat` non-zero naming the seat address or run id, delivery after the seat/run settles.
Command: `akrogon run-check --name setup-busy-c4 -- bun test tests/setup-busy.test.ts --timeout 180000`
Conditions traced: the busy verdict must not go stale inside a pass — it is computed in the same `allocate` call that dispenses the leaf, from the same `leafSeats` read used for delivery; `liveRuns` re-reads records at each call. "error does not hold" — the error case proves the gate distinguishes status values. "null counts" — proven with the delayed start. Red: deliberate break above.

### C5 — failure reporting and the worktree split

Proof: `tests/setup-dispatch.test.ts`, three cases: failing setup on a fresh leaf (report names leaf/exit 42/output; no seat; worktree removed; no `worktree:` in state.yaml; sibling dispatched; recovery pass delivers), guard failure with `package.json` and no install (reported; adopted worktree kept with `own` and no marker; recovery with an installing setup delivers and marks), failing setup in an existing worktree (kept, unmarked — the differing marker is deleted before the run; retry installs v2).
Command: same as C1.
Conditions: "next pass retries" — no failure state is persisted anywhere, so nothing can suppress the retry; proven by each case's recovery pass. "No seat starts" asserted by zero terminals. "no `worktree:`" asserted on state.yaml text.

### C6 — no setup configured

Proof: `tests/setup-dispatch.test.ts` `criterion 6` — root `package.json` present, no `node_modules` created anywhere: dispatch green, seat live, delivery logged, no marker. Red: deliberate break above.
Command: same as C1.
Conditions: "no guard runs" is observable only through its effect — the guard failure that would block dispatch never happens while `node_modules` is absent; the assertion pair (green delivery + no `node_modules`) is exactly that discrimination.

### C7 — docs say the new duty

`docs/reference/config.md` (`setup` row), `docs/reference/checks.md` (`setup` paragraph) and `src/AREA.md` (first-allocation pattern and `setup` composition note) state setup also runs in a leaf worktree before a seat works there, once per checkout state. Proof: the reviewing seat reads the diff; no mechanical test exists or is added.

### C8 — lesson retired

The `fresh worktree skips setup (2026-11-25)` line is gone from `learnings/LESSONS.md`; the history file ends with `Applied 2026-11-25 by src/next.ts:ensureWorktree:<line>: <what stops it>`. Proof: the reviewing seat reads the diff.

## File/criterion checklist and waves

### W1-U1 — core dispatch setup (implements D1-D8, C1-C6 proofs green)

Owns: `src/next.ts`, `src/config.ts`, `src/guard.ts`, `src/batch.ts`, `learnings/LESSONS.md`, `learnings/history/2026-11-25-fresh-worktree-skips-setup.md`.
Steps: constants + marker helpers in config; `ownModulesRefusal` in guard (verb reuses it); the setup step in `ensureWorktree` with the busy return before `writeLeafEnv`; `busyHolder` + allocate outcome union + the three caller handlings; `ensureLeafTemp` before `ensureWorktree`; marker deletion in `move`; then the lesson retirement with the final file:line (depends on this unit's own diff, so it lands last inside the unit).
Verify: both test files green (commands above), then `akrogon run-check --name setup-typecheck -- sh -c 'bun run typecheck'` and the configured `checks` the implement phase requires per its own rules.

### W1-U2 — docs (implements D9, C7)

Owns: `docs/reference/config.md`, `docs/reference/checks.md`, `src/AREA.md`. Disjoint from U1's paths; no shared test resource; no dependency (the design fixes the mechanism the docs describe).
Verify: `bun test tests/docs-links.test.ts tests/command-reference.test.ts` stays green (link integrity only); the criterion proof is B's read.

`tests/AREA.md` already carries the new test files (committed with the tests). No other agent or human doc is affected: skills name `setup` only as the check-side mechanism they inherit through `akrogon run-check`/`verify`, which this leaf does not change.

### Wave shape

Two parallel units in one wave. W1-U2 is small; if a serial-solo run happens instead, order is U2 then U1 or interleaved, result identical.

## Open limitations

- A hung setup holds the pass (and the worktree install lock) until the listener's `PASS_DEADLINE_MS` kills the pass's process group or an operator kills a manual run (design Q3a stated residual; no deadline is added).
- C's standing dissent (a missing-`node_modules` re-trigger beyond the marker) and B's (delivery-point call site) are recorded in the design and not adopted.
- `akrogon seat` cannot run while a live terminal already holds the seat's name (pre-existing hc constraint, unrelated to this leaf).
- A mid-setup kill can leave a worktree whose install partially ran; retry is keyed on success so the next pass reinstalls — partial-state idempotence is the setup command's own contract, as it already is for checks.
