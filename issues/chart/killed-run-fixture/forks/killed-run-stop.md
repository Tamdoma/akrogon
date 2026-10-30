# Killed run stop

## Question

### Q1 · What does akrogon promise after a live run-check dies before its test's cleanup ran?

Options on the table from the shared opening map: (a) a loud refusal at the seat's next `akrogon phase` move while the leaf holds a dead run's capture pair, cleared by the seat after it cleans what the pair printed; (b) the test survives its wrapper's death so its own `finally` runs; (c) automatic cleanup with no returning seat; (d) skill prose only.

### Q2 · How does the refusal tell a dead run's capture pair from a live one?

Applies when Q1 is (a). A live run's pair must never block a move, a dead one must, for every way a run dies (wrapper killed, `stop-run`, reboot, SIGKILL of the test, nested runs).

### Q3 · Which leaves and moves does the refusal cover, and what clears it?

Applies when Q1 is (a). Covers: every leaf or only leaves whose `readiness.yaml` grants declare fixtures; whether a move to `failed` and operator recovery stay open; what the seat does to clear a pair (rename, note, command) without losing the evidence `akrogon log` and `pack` read.

### Carries

- Intake: [INTAKE.md](../INTAKE.md), Tamdoma/akrogon#124.
- Shared opening map: [slots/map-A.md](../slots/map-A.md), [slots/map-B.md](../slots/map-B.md).
- Lock 2026-09-18 (issues/chart/seat-stall-detection/forks/no-akrogon-detector.md, Taken): no hidden watchdogs, clocks or polling.
- issues/chart/killed-check-log/CHART.md Off route: making a check survive its caller was out of scope for #120 (changes admission and guard ownership); not foreclosed for #124.
- Seed lesson history path `/home/rudi/Work/akrogon/learnings/history/2026-10-28-killed-run-fixture-leak.md`, absent on this repo's main and origin/main.

## Findings

- Measured 2026-10-28, bun 1.4.4: a `bun test` blocked in `try`, sent SIGTERM, exits with no `finally` run (better-than-training, scratch measurement, discarded). So the guard's `systemctl --user stop` of the run scope ends the test with no in-process cleanup. (A)

- Blind notes: [A](../slots/killed-run-stop-A.md), [B](../slots/killed-run-stop-B.md); [merged](../slots/killed-run-stop-merged.md); [B rebuttal](../slots/killed-run-stop-rebuttal-B.md) (F10 a reader keeps an fd scan live; F11 the promise covers abandoned pairs only; F12 a rename breaks `akrogon log <printed path>` because `src/evidence.ts` `locate` keeps exact names).
- Final shape: [slots/killed-run-stop-final-shape.md](../slots/killed-run-stop-final-shape.md). B check 1 ([F13](../slots/killed-run-stop-final-check-B.md)): a wrapper `flockHold` helper and a separately acquired child `flock` leave a startup gap, reproduced by B. Corrected to one lock on one shared open file description; B check 2 ([F14](../slots/killed-run-stop-final-check-2-B.md)): a pathname `flock` probe recreates an unlinked capture; adopted as a tightening (probe opens the existing file without creating it and treats a vanished pair as finished), no mechanism added.
- Proof 1, better-than-training, 2026-10-28, bun 1.4.4: SIGTERM ends a blocked `bun test` with no `finally` run. Scratch measurement, files deleted.
- Proof 2, operation `flock(1)` fd-mode shared lock passed to a bun child as stdout, probed with `flock -n -x`: command a bun wrapper `openSync(cap,'w')`, `Bun.spawnSync(['flock','-s','3'],{stdio:['ignore','inherit','inherit',fd]})`, `Bun.spawn(['sh','-c','echo child-start; exec sleep 20'],{stdio:['ignore',fd,'inherit']})`; identity local user ivan; versions bun 1.4.4, util-linux 2.42.4; 2026-10-28T13:07:29Z; result: wrapper and child alive busy (1), wrapper SIGKILLed with child alive busy (1), both dead with a `tail -f` reader open free (0), child dead with wrapper alive busy (1), both dead free (0); cleanup: scratch directory removed, no process left; limits: not run under `systemd-run --scope` or the run guard's stop, and the pathname probe form there recreates a missing file (F14), so the leaf probes an fd opened without create.

## Taken

A's pick under autopilot, 2026-10-28: 1a 2a 3a (not operator words).

- Q1 · 1a: `akrogon phase` refuses every non-failed move of a leaf (`--check` and one slot's completion included) while the leaf folder holds an abandoned capture pair with no non-blank `cleared-<run>.md` beside it, naming each pair and the clear step. Moves to `failed` and operator recovery from `failed` stay open. Containment on wrapper death is unchanged. The promise covers abandoned pairs (the wrapper died before publishing). Reason: the pair is already a per-run record written before launch, so the stop needs no new state, timer or credential and catches every way the wrapper dies. Rejected: 1b survive the wrapper (SIGKILL and reboot still leak, reverses #120 ownership); 1c automatic cleanup (watchdog lock 2026-09-18, no cleanup authority); 1d prose only (already existed, did not stop this).
- Q2 · 2a: one shared flock on one open file description. `checkedRun` opens capture-out for writing in place of its `writeFileSync`, locks that description with a one-shot `flock -s 3` helper inheriting the fd, and `spawnLogged` passes the same fd as the child's stdout in place of `Bun.file(capture.out)`, for nested and non-nested runs. The pair is live while the wrapper or any descendant holding stdout lives. The probe opens the existing capture-out without creating it and runs `flock -n -x` on that fd; a pair gone at probe time is finished, never abandoned. Reason: no gap from creation to unlink, readers take no lock, a reboot frees it. Rejected: admission records (nested runs have none, removed before the stop ends); an open-fd scan of /proc (a reader keeps a dead run live, B F10); a wrapper helper plus a separate child lock (startup gap, B F13).
- Q3 · 3a: the seat runs the leaf grant's own discovery, cleanup and authenticated absence read for that run, not only the IDs the pair printed, then writes a non-blank `cleared-<run>.md` beside the pair saying what it found, cleaned and read. Capture names and bytes stay. A later green run clears nothing. check-issue and implement-issue say: after a run-check printed no `check` line, recover before any rerun. Rejected: a rename (breaks printed paths, B F12); a new resolution command (a file does it).
- Binding: the owning leaf retires `learnings/history/2026-10-28-killed-run-fixture-leak.md` under the lesson rule's Retire clause when that file is on its base, else records its absence.
- Open for the plan: whether a run can be abandoned between `landGates` and `commandMerged`/`completeOwner` side effects, and if so where the recheck sits (B F8).
- Standing consultant dissent: none after F13 and F14 were adopted. B's Q4 (a killed test whose wrapper survives) is Off route, see CHART.md.
