# Implementation report: setup-before-seat

Implement pass, slot A, 2026-11-25. Delegated run: one wave, two workers (sub-briefs `brief-1.md`, `brief-2.md`), both landed by cherry-pick. No paid commands, no credentials needed (`akrogon status` showed no `Missing:` lines).

## Base and head

- Base: `646819159203d8ba256d0990f85fd17b44c1bd78` (origin/main at pass start; refresh: branch already on it, no rebase moves, none recorded).
- Committed head: `cc92e145` (setup-before-seat branch).
- Commits on the leaf branch: `44c72f78` tests (planning), `0e6595b4` core (worker u1's `058ccd88` cherry-picked), `cb4d7a9a` docs (worker u2's `f509cece` cherry-picked), `d091d8ee` prettier formatting, `cc92e145` leaf-temp ordering repair.

## Changed files and reasons

- `src/next.ts` — the setup step in `ensureWorktree` (due on missing/differing marker, differing marker deleted before the run, `flock <install lock> sh -c <setup>` under `constructedEnv`, own-modules throw, marker write; created-worktree removal under `worktreeLock` on failure); busy computation in `allocate` from `leafSeats` plus `liveRuns`; allocate outcome union handled in `dispatchLeaf` (`end('none')`), `broadcastPass` (return) and `seatCommand` (throw naming the seat or run). Repair `cc92e145`: the leaf temp is created inside the setup step, not in `allocate` before `ensureWorktree` — see the incident below.
- `src/config.ts` — `INSTALL_LOCK_FILE`/`SETUP_MARKER_FILE` constants, `setupMarkerPath`/`deleteSetupMarker` helpers; `setupCommand` reuses the constant (answers the design's open question: one constant, no drift).
- `src/guard.ts` — `ownModulesRefusal(cwd)` extracted; the `guard` verb prints it, the setup step throws it.
- `src/batch.ts` — `move` deletes the marker immediately before `git reset --keep`.
- `learnings/LESSONS.md` — the `fresh worktree skips setup (2026-11-25)` line removed.
- `learnings/history/2026-11-25-fresh-worktree-skips-setup.md` — ends with `Applied 2026-11-25 by src/next.ts:ensureWorktree:478: <what stops it>`, verified against the committed file at the worker's commit. The setup step's exact line may shift with later commits on this branch; the reference resolved at `0e6595b4`.
- `docs/reference/config.md`, `docs/reference/checks.md` — the `setup` row/paragraph state setup also runs in a leaf worktree before a seat works there, once per checkout state.
- `src/AREA.md` — first-allocation pattern and `akrogon config` composition note carry the dispatch-time duty; 39 lines.
- `tests/setup-dispatch.test.ts`, `tests/setup-busy.test.ts`, `tests/setup-fixture.ts`, `tests/AREA.md` — committed at planning (`44c72f78`); only prettier line-formatting since (`d091d8ee`, trailers carried), no expectation changed.

## Commands run and results

Worker evidence (read back with `akrogon log`):

- `check u1-dispatch: 0` — implementation/check-u1-dispatch-1795611923288-2115710.log — 7 pass / 0 fail
- `check u1-busy: 0` — implementation/check-u1-busy-1795611945880-2118715.log — 5 pass / 0 fail
- `check u1-typecheck: 0` — implementation/check-u1-typecheck-1795611950433-2122353.log
- `check u2-docslinks: 0` — implementation/check-u2-docslinks-1795611455083-2055718.log — 18 pass / 0 fail

Lane evidence after each cherry-pick:

- `check lane-pick1: 0` — implementation/check-lane-pick1-1795612031227-2129837.log (both setup test files)
- `check lane-pick2: 0` — implementation/check-lane-pick2-1795612033711-2136669.log (docs tests)

Criterion proofs, implement-end rerun (head `d091d8ee` then repaired `cc92e145`):

- Criterion 1, 2, 3, 5, 6 — `akrogon run-check --name final2-dispatch -- bun test tests/setup-dispatch.test.ts --timeout 180000` on `d091d8ee`: `check final2-dispatch: 0` — implementation/check-final2-dispatch-1795612089552-2146434.log — 7 pass. Rerun after the ordering repair on `cc92e145`: `check fix1-dispatch: 0` — implementation/check-fix1-dispatch-1795612913251-2953643.log.
- Criterion 4 — `akrogon run-check --name final2-busy -- bun test tests/setup-busy.test.ts --timeout 180000` on `d091d8ee`: `check final2-busy: 0` — implementation/check-final2-busy-1795612110455-2149378.log — 5 pass. Rerun on `cc92e145`: `check fix1-busy: 0` — implementation/check-fix1-busy-1795612934257-2965698.log.
- Criterion 7, 8 — the reviewing seat reads the diff (docs and lesson lines above).
- Wall time: each criterion proof run is minutes-sized by the busy file's null-status delay — dispatch file ≈21 s, busy file ≈21 s per single run; whole-file runs within verify ≈104 s for both files.

`akrogon verify` on committed head `cc92e145`: green, receipt `5fd551e7-88cc-4878-b697-00094ae0681e` (tree `1ddd092d`), exit 0 — full suite 1476+ pass, format/typecheck green. First verify attempt was red on prettier formatting only (3 files); fixed in `d091d8ee`, no behavior change.

## Incident found and repaired in-pass

`tests/next.test.ts` `changed repo root reports recorded and expected worktrees without creating or prompting` failed on the leaf head and passed on base `64681915` (3/3 each way, deterministic). Cause chain proven by inotifywatching a reproduction: the worker's placement of `ensureLeafTemp` in `allocate` before `ensureWorktree` created a sweepable leaf-temp directory in passes that then threw at the worktree-path-mismatch refusal; the end-of-pass reconcile swept it, and any removal triggers the reconcile's `git worktree prune`, which dropped the stale `relocated` registration the test asserts unchanged. Repair `cc92e145`: the leaf temp is created inside the setup step itself (where the design's `ensureLeafTemp` before the setup step is needed), and `allocate` keeps the base's post-`ensureWorktree` creation; a pass refusing before any setup work leaves nothing sweepable. Red evidence: implementation/check-nextroot-repro-1795612350308-2797060.log; green after repair: the test passes on `cc92e145` (verified in the verify run's full suite and a direct rerun, 13 expect() calls, 0 fail).

## Known limitations and unverified criteria

- Locked residual (design Q3a): a hung setup holds the pass until the listener's `PASS_DEADLINE_MS` process-group kill or an operator kill; no deadline added.
- `learnings/history` `Applied` file:line reference resolves at commit `0e6595b4`; later cosmetic line shifts on this branch do not re-verify it.
- Unverified criteria: none.
- No known-red judgment invoked; no `advisory` configured; `merge_checks` empty, not run (land-run only).

## check.fix pass, slot A, 2026-11-25

Repairs of review-B findings F1, F2, F3, all `Handed to A` as fix-plus-proof pairs. Delegated as one worker unit (`brief-3.md`, worker commit `665723a2` cherry-picked as `18840a88`).

### Refresh records

- Implement pass refresh: prior base `64681915`, prior head `cc92e145`; rebase moved the branch onto `011d47575accb875bdf898f5b52f67d016a1120f` at check.fix start with no conflicts. New head after repair `18840a88`. (The implement pass itself was already at base, no refresh move then.) The reviewed base/head handed off: reviewed base `64681915` (merge-base per B), reviewed head `cc92e145`; handed-off base `011d4757`, handed-off head `18840a88`.
- End-of-repair refresh: branch already at `origin/main` tip, no move.

### Reproduction evidence (red before fix, committed first in `6d8f1ee0` with `Test-Change` trailers)

- F1: `check repro-f1: 1` — implementation/check-repro-f1-1795614065157-3657415.log — capacity wait row recorded for the busy leaf.
- F2: `check repro-f2: 1` — implementation/check-repro-f2-1795614065667-3658384.log — `cc=1` reached the setup child with CLAUDECODE in valid `pass_env`/`env` config.
- F3: `check repro-f3: 1` — implementation/check-repro-f3-1795614066114-3658931.log — the per-leaf report held only the guard text, no `"code":1`.

### Repair commits and content

- `6d8f1ee0` — reproduction tests (A, before delegating, per the check.fix test exception).
- `18840a88` — `src/next.ts` only: (F2) `AKROGON_RUN`/`CLAUDECODE` deleted from the constructed env at the setup spawn, check-side `constructedEnv` and the schema unchanged; (F3) the own-modules refusal throws `CommandError(['akrogon','guard','own-modules'], path, { code: 1, stdout: '', stderr: refusal })`; (F1) `setupDue` extracted and shared, busy computed before the capacity refusal, and a due setup in a recorded worktree runs before the capacity refusal (maintenance owed regardless of seating), which then gates only the new seat. The worker's deviation from brief-3's sketched F1 shape is recorded in its return and accepted by A: the locked epilogue of the F1 reproduction test (setup reruns with capacity full and a recorded worktree) cannot be satisfied by the sketched ordering; the implemented ordering is the minimal one satisfying it, and busy leaves still never see the capacity mask.

### Post-repair proof

- Worker evidence: `check u3-dispatch: 0` (8 pass), `check u3-busy: 0` (6 pass), `check u3-typecheck: 0` — implementation/check-u3-*.log.
- Lane after cherry-pick: `check lane-u3: 0` — implementation/check-lane-u3-1795616413658-585311.log — both files green on `18840a88` content.
- Rerun trigger applied: both criterion-proof files and `src/next.ts` changed since the last green runs, so both files reran green (the lane run); the whole-file ×5 reruns and full suite ran inside verify.
- `akrogon verify` on committed head `18840a88`: `verify leaf 18840a88cb86054e52adc754d13f58565de7b7fa: green`, exit 0 — fresh run, all checks green, 70 changed-file test passes + full suite. No merge_checks run (land-run only; config empty).

### Known limitations and unverified criteria

- Unchanged from the implement pass, plus: brief-3's edge note stands — a commit-free leftover replaced mid-pass can flip due inside `ensureWorktree`, whose gate remains the authority for the busy return.
- Unverified criteria: none.

## check.fix pass 2, slot A, 2026-11-25

Repair of review-B finding F4 (`Handed to A`, fix-plus-proof pair): the `maintenanceFirst` ordering at `18840a88` ran setup before the capacity gate and let first-allocation validation errors escape a busy leaf. Delegated as one worker unit (`brief-4.md`, worker commit `f903649d` cherry-picked as `4a1f3407`).

### Refresh records

- No base movement since the first check.fix refresh: branch rebased onto `011d4757` at this pass chain's start; end-of-repair refresh found the branch already at the origin/main tip, no move. Prior reviewed head `18840a88`, handed-off head `4a1f3407`, base unchanged `011d4757`.

### Reproduction evidence (red before fix, committed first in `11d0fc85` with `Test-Change` trailer citing C4, the docs/use/run-work.md capacity contract and B's CLI evidence)

- `check repro-f4a: 1` — implementation/check-repro-f4a-1795618151256-1461749.log — the capacity-full epilogue: setup ran (2 calls) where none may run while the sibling holds the only slot.
- `check repro-f4b: 1` — implementation/check-repro-f4b-1795618151659-1462658.log — the dirty unallocated leftover produced exit 1 with the validation error while the leaf's run-check was live, where a quiet busy is required.
- The F4 correction also rewrote the F1 epilogue assertion B flagged as exceeding the criterion: it now requires no setup plus a capacity wait with the slot full, then setup and delivery after the slot frees.

### Repair commits and content

- `11d0fc85` — corrected and new reproduction tests (A, before delegating).
- `4a1f3407` — `src/next.ts` only: `maintenanceFirst` removed entirely; `due` computed unconditionally; the due-and-busy outcome returns in `allocate` before both the capacity refusal and `ensureWorktree`; the capacity refusal restored to its unconditional pre-`18840a88` position. `ensureWorktree`'s internal busy gate unchanged (recreation-flip edge). Net +8/−13.

### Post-repair proof

- Worker evidence: `check u4-dispatch: 0` (8 pass), `check u4-busy: 0` (7 pass), `check u4-typecheck: 0` — implementation/check-u4-*.log.
- Lane after cherry-pick: `check lane-u4: 0` — implementation/check-lane-u4-1795618551467-1531025.log — both files green on `4a1f3407` content.
- Rerun trigger applied: `src/next.ts` and `tests/setup-busy.test.ts` changed since the last green runs, so both files reran; the ×5 changed-file reruns and full suite ran inside verify.
- `akrogon verify` on committed head `4a1f3407`: `verify leaf 4a1f34078029c43be2309fcb96e570202366ea02: green`, exit 0.

### Known limitations and unverified criteria

- Unchanged from the implement pass.
- Unverified criteria: none.
