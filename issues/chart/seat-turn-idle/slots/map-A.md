# Opening map: slot A

Akrogon main 47bca6c1 (= origin/main), hc 0.1.22, read 2026-11-24.

## seat-turn-idle (#157)

Mechanism. `src/next.ts:dispatchSlot` delivers only when `seat.status.state` is `idle` or `done`; it treats a seat as lost only when the terminal is missing or `finished`. hc's `status` is a 7501 record whose "words are the program's own; nothing is translated" (`hc schema`, Status). So `working` after the turn ended is Claude Code's own report while a background shell lives, not hc's derivation. Seed cause confirmed for akrogon, refuted for hc: an hc change would have to translate the program's words, which hc by design does not.

Forks.
1. How akrogon knows a seat's turn ended.
   - a. Read the harness transcript's end-of-turn record (akrogon already resolves transcripts for claude, codex, pi, agy in `src/transcript.ts`). Works for every harness that writes one; invites per-harness parsing upkeep.
   - b. A harness hook (claude `Stop`) writes a marker akrogon reads. Claude-only; a second channel to keep in sync with hc.
   - c. Stop seats from starting background shells (harness setting). Removes the trigger for claude but not the locked result for other harnesses, and it fights the decision's wording ("counts as idle even when a background shell ... is still running").
   - Pick: a, if one free probe shows each harness's end-of-turn record is present while the shell lives. Needs a real observation (one short claude seat with a `sleep` background shell).
2. How leftover shells end "when the leaf's phase advances".
   - a. At delivery of the next phase prompt to an ended-turn seat, stop every process in the seat's leaf scope that is not the harness process itself (seats start in a leaf scope, `src/seat.ts` scopeEntry). No in-turn tool can be running then, so nothing legitimate dies.
   - b. In `akrogon phase` itself. Risky: the phase call runs as a child of the agent, so it would have to spare its own ancestor chain.
   - Pick: a. Lesson 2026-10-13 (pattern kill crosses leaves): stop by owned PID or scope only, never `pkill -f`.
3. Is the reboot variant (pane is a bare shell, status null, agent gone) in scope?
   - a. Yes: a live terminal whose foreground program is not the seat's harness is a lost seat, so `next --resume` relaunches it. Same class: seat liveness misread.
   - b. No: record only.
   - Pick: a, small and same function; seed Expected behavior asks for it, the decision does not forbid it.

Pitfalls. Killing the agent's own process; killing another leaf's processes; a test that needs a real claude session (paid, standing grant) when a fake hc terminal plus a fixture transcript proves the dispatch rule for free.

## fresh-leaf-base (#156)

Mechanism. `src/next.ts:ensureWorktree` reuses an existing path after only checking it is a worktree of the same repo; if the path is gone but `refs/heads/<slug>` exists it checks that out; only a missing branch starts from `trackingRef`. `src/config.ts:base` is `merge-base HEAD <trackingRef>`, so a stale branch becomes the base. `src/reconcile.ts` keeps an orphan store worktree as "unmanaged worktree" and never removes it. There is no withdraw command in `src/`; withdrawal was deleting the leaf folder by hand, so the leftover is expected, not a failed cleanup.

Forks.
1. What happens at a leaf's first allocation (`state.worktree` undefined) when a worktree or branch of the slug already exists.
   - a. Leftover branch with no commits of its own and a clean worktree: remove and recreate from the tracking ref. Dirty, or with own commits: refuse loudly naming the leftover and what to do. No work is silently lost.
   - b. Always refuse loudly. Simplest code, but every re-handoff stalls until someone acts.
   - c. Always fast-forward or reset. Loses leftover edits silently.
   - Pick: a.
2. Lesson retirement. The leaf stops the mechanism on the one path (`ensureWorktree`) and must remove the "leaf worktree kept at a stale base" line; that line is uncommitted (needs N1).

## run-check-display (#155)

Mechanism. `src/run-check.ts:constructedEnv` copies a fixed list plus repo `env`/`pass_env`, then cuts the bus. Display variables reach a run only when a repo lists them. Lesson 2026-11-07 (run-check hides the desktop bus) is the same class.

Forks.
1. Where display reaches the run.
   - a. run-check copies `DISPLAY`, `WAYLAND_DISPLAY` and `XAUTHORITY` (and keeps `XDG_RUNTIME_DIR`, which `runUnitArgv` already restores when copied) for every repo. Removes the class. Invites: a GUI test that silently failed headless may now open a window on the operator's screen; Playwright headless ignores DISPLAY.
   - b. Document `pass_env` per repo. Leaves the trap for the next repo.
   - Pick: a.
2. Which variables are needed. Free probe: a headed Chromium under run-check with only `DISPLAY` copied, then with `XDG_RUNTIME_DIR`, on X (Hyprland Xwayland). Wayland-only is not observed.
Lesson "run-check drops DISPLAY" retires with a.

## merge-test-facts (#154)

Mechanism. b9fe5027 deletes plain logs at owner completion. `verify-runs` command entries keep `failures` (names, from `src/flaky.ts:failureNames`, which already matches bun's `(fail) name [12ms]` lines and drops the duration). Timeouts (`this test timed out after Nms`) and green durations live only in log bytes. `merge-attempts` rows (`src/attempts.ts:appendAttempt`) carry no verify `run`.

Forks.
1. What survives.
   - a. Parse at capture: failure entries keep duration and a timed-out flag; green per-test durations kept too. Row growth: one entry per test per run, hundreds of tests on framework.
   - b. Keep merge-scope verify logs at completion (exempt them from b9fe5027's delete). No parser change; disk grows (another door's footprint chart wants it smaller).
   - c. Parse at capture into a compact per-test duration record outside verify-runs (e.g. `timings.jsonl` rows), failures keep a timed-out flag in the row.
   - Pick: open between a and c; signpost 3 (extend existing records) favours a timed-out flag in the row plus per-test durations in the existing `timings.jsonl`.
2. Attempt join: add the verify `run` to the attempt row. Small and independent.
3. Runner coupling: duration and timeout parsing is bun-output-specific like `failureNames`; other runners give none, recorded as absent.

## direct-visible (#153)

Mechanism. The direct route writes no leaf (`docs/use/quick-fix.md`), and `src/status.ts` shows charts only as `CHART, TAKEN, FOG, STAGE, AGE`. Progress lives in `<chart>/direct/` and CHART.md `## Direct attempt`. Broadcast: `skills/chart-issues/assets/direct-route.md` step 7 sends broadcast-issue on landing; delivery for #148 is unconfirmed (needs a read of the broadcast record).

Locked (decision): tracked like a leaf, run in the door's current tab by A with the reviewer slot; status shows phase (build, review, repair, merge), seats and runs; broadcasts on landing.

Forks.
1. What record carries direct work.
   - a. A real leaf `state.yaml` with a direct marker that dispatch skips and status renders. Reuses every leaf reader; risk that `next`, reconcile, capacity and merge treat it as a dispatchable leaf.
   - b. A small machine record in the chart (`direct/state.yaml`: phase, seats, runs holder) that status renders as a leaf-like row. Smaller; one new reader.
   - Pick: b leans simpler, but "exactly like a lifecycle leaf" may need a. Needs a fork round.
2. Phase names: build, review, repair, merge map to direct-route steps.
3. Broadcast: verify whether #148's broadcast reached Discord before treating it as a bug.

Charts are independent; no cross-chart dependency.
