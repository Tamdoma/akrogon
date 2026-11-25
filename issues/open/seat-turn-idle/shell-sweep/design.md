# Design: shell-sweep

## Binding decisions, verbatim

### Seed decision (Tamdoma/akrogon#157), from forks/seed-decision.md


#### Operator decision (Ivan Juras, 2026-11-24)

- Fix this in akrogon/hc, not with a watch-side kill permission: a seat whose agent turn has ended counts as idle for prompt delivery even when a background shell it started is still running.
- Leftover seat shells end when the leaf's phase advances.
- Not in scope: granting the watch permission to kill seat shells as the workaround.

seed decision from Tamdoma/akrogon#157, taken at import on 2026-11-24, not asked, decided by ivanjuras

Reason: not stated. Alternatives: not stated.

### Signposts, from forks/signposts.md


A's picks under full autopilot (operator: "Full autopilot mode. Don't ask me anything. Think from the systems perspective: simplicity, clarity elegance."), not operator words:

1. 1a. Removing the failure class beats guarding it (operator value: simplicity, removing over adding).
2. 2a. Free tests catch these mechanical bugs at lower cost (operator values: speed and price).
3. 3a. Fewest moving parts (operator value: simplicity).
4. 4a. Fewest leaves to dispatch and review (operator value: simplicity).
5. 5a. #157 stalls unattended runs and holds capacity; #153 is the widest change and gains from the others landing first.
6. 6a. No migration step to run or get wrong (operator value: simplicity).

Account: the session prioritizes fixing each mechanism in akrogon itself, proving it with free tests, and reusing existing records. It gives up per-repo config knobs, live-run evidence and new record kinds unless a chart shows no other way.

### Shell sweep, from forks/shell-sweep.md

A's autopilot pick, 2026-11-25. Not operator words. Sources: slots/fork-shell-sweep-{A,B,C,D}.md, -merged.md, -rebuttal-{B,C,D}.md, `## Charting proofs`.

- Q1 a. Sweep inside `src/phase.ts:commitMove` after the move is saved and logged, for every recorded seat of the leaf, sparing `process.pid`'s ancestor chain. A sweep failure warns with structured fields and never marks the committed move failed. Moves to `failed` and `merged` sweep too.
  - Reason (signpost 1a, value removing over adding):
    - The incident leaf advanced `implement -> check.review` with the loop already running, so this sweep ends it (INTAKE.md "Observation").
    - When the shell dies, claude flips to `done` and advances `turn` (P1), and the existing gate delivers.
  - Kill signal: SIGKILL to the collected set, with no wait under the global lock (D rebuttal R4, C rebuttal).
  - Rejected:
    - b: the first pass can land while the seat's own `akrogon phase` still runs inside the seat scope.
    - c: the listener wakes only on `turn`, `blocked`, `finished` and `lost` (`src/listen.ts:listenCommand`, no timer). The delivery sweep would need a new periodic wake plus a time threshold that kills shells in genuine long turns, since hc cannot tell those turns from ended ones (P1).
  - Standing dissent: B and D hold c. B argues a 30 to 60 min quiet period from the last delivery, with a periodic wake. D argues a few minutes from phase entry.
- Q2 a, sharpened.
  - Roots: processes in the seat scope whose `/proc/<pid>/comm` (or argv0 basename without a leading `-`) is in the shell set {sh, bash, dash, zsh, fish, ash, ksh, nu}, and whose parent is the harness pid or a pid outside the seat scope.
  - Each root is ended with its descendant tree.
  - Spared: the caller's ancestor chain, and any root subtree holding a live run-check process of the leaf (`src/admission.ts:liveRuns`).
  - Before signalling, re-check each pid's start time and its membership in the seat scope.
  - Each sweep appends one `shell_sweep` timing row with the leaf, slot, pids, comms and errors (extending timings, signpost 3a).
  - Reason:
    - Codex keeps non-shell helpers in the seat scope (P3), so b and c kill them or need a version-coupled allowlist.
    - The parent rule catches reparented shells (C) and never classifies shells under a non-shell helper (D rebuttal R5).
- Q3 a. A seat terminal is lost when it is `live` with `status` null and either shape holds:
  - Parked: `pid` is null and `reason` is set and is not `spawn_pending`.
  - Spawned: `foreground.name` is in the Q2 shell set and `argv[0]` is not `systemd-run`.
  - Dispatch then takes the existing lost-seat path in `src/next.ts:dispatchSlot` (seat_lost row, end, `lost + 1`, fail at 3, `startSeat`).
  - `src/hc.ts:terminalSchema` gains `argv`, `reason` and `foreground.name`. The predicate is used only in dispatchSlot's lost branch.
  - Reason:
    - hc `keep` makes a signal death look the same as a reboot (P2), so the `lost` charge is the only bound on a crash loop.
    - Sharing the predicate with `allocate` or `broadcastInProgress` causes a cap deadlock and a silent broadcast drop (D rebuttal R6).
  - Rejected:
    - b: an unbounded relaunch loop.
    - c: leaves the reboot stall that the intake's Expected behavior names.
    - Turning keep off: herdr-app turns keep on when it adopts a terminal into a tab (`~/.config/herdr-app/AGENTS.md`, terminal panes), so akrogon does not own that flag (B rebuttal premise confirmed, owner found).
- Residuals, recorded and not fixed here:
  - A shell started after the seat's own phase call, and a masked silent end with no advance, both stay masked with no wake. No dispatch pass runs, so even the 1 h busy notice does not post (B rebuttal). Recorded in forks/seed-decision.md `## Findings`.
  - Codex and agy masking is unobserved. If codex masks through `node_repl` or `codex-code-mode-host`, Q2 does not unblock it (D rebuttal R7).

#### Final-shape check, 2026-11-25

Sources: slots/fork-shell-sweep-final-check-{B,C,D}.md. No pick breaks. These corrections are part of the Taken shape:

- Q1 kill order (C): signal the collected trees top-down, parents before children, so no parent forks after a child is killed. Then re-collect once with the same rule in the same sweep and kill anything new. There is still no wait.
- Q2 run spare (C): spare a root subtree holding the writer pid of any run record of the leaf whose writer is alive (`src/admission.ts:writerLive`) in the `waiting`, `live` or `ended` state, not only `liveRuns()`. `checkedRun` marks the record `ended` before it publishes its log and unlinks its captures. A kill in that window leaves an abandoned capture pair that refuses every later move (`src/run-check.ts:abandonedCaptures`).
  - The start-time re-check must read through `procRoot()`. `src/admission.ts:liveStartTime` reads `/proc` directly.
- Q3 spawned shape (C): require a non-empty launch `argv` whose first word is not `systemd-run`.
- Q3 schema (B): `foreground.argv` already exists in `terminalSchema`. The additions are the top-level `argv`, `reason` and `foreground.name`.
- Not taken: D's proposal to make `src/timing.ts:readTimings` skip unknown kinds. An older build reading a newer timings file loses its timings, and that holds for every kind added before this one. It is not this leaf's change (scope).
- Residual (B): when the lost path replaces a seat, shells left in the old seat's scope are not swept again. They cannot mask, because their harness is dead. Reconcile stops the leaf's scopes at close.
- Residual (B): the `reason` strings come from hc 0.1.22 probes and are undocumented. The spawned shape does not depend on them.

#### Leaf review, 2026-11-25

Sources: slots/leaf-review-{B,C,D}.md. These corrections are part of the Taken shape:

- Q2 timing row (C,D): one `shell_sweep` row per swept seat that had a process ended or an error, naming that seat's slot. This replaces "one row per sweep".
- Q2 run spare (B,C,D): `src/admission.ts` gains one export listing the leaf's run records in `waiting`, `live` or `ended` state whose writer is alive. `writerLive` is private today.
- Q2 boundary (C,D): every proc read goes through `procRoot()` (including `src/seat.ts:cgroupOf` and `liveStartTime`). Scope membership is read under `cgroupRoot()`.

### Exclusions

- Out of this leaf, per the decision's `Not in scope:`: no watch-side permission to kill seat shells.
- Out of this leaf, per the shell-sweep Taken (Q1 c rejected): no delivery-time sweep and no periodic listener wake.

### Standing design

Installed path: /home/ivan/.akrogon/releases/085f2f88c3a1920732e10afbc0bad190cf32d540/skills/chart-issues/assets/standing-design.md. How it applies here:
- Each done-criterion is proven by an own test at the real boundary. The sweep's tests use real child processes, plus a cgroup tree under `AKROGON_CGROUP_ROOT` and a proc tree under `AKROGON_PROC_ROOT` (`src/scope.ts:cgroupRoot` and `procRoot`. `tests/helpers.ts` sets `AKROGON_PROC_ROOT`, and `tests/leaf-slices.test.ts` and `tests/green-merge.test.ts` set `AKROGON_CGROUP_ROOT`) (C).
- The recovered-shell tests use hc terminal records shaped like charting proof P2.
- There is no paid call, live run or end-to-end run. Charting proofs P1 and P1b (claude flips to `done` when the shell dies by TERM or by SIGKILL) reach the key part every criterion rests on, the existing idle gate delivering after the flip.
- The bug-fix rule applies: criteria 1, 3 and 4 fail on the current base and pass after. Criterion 2 (what survives) is asserted in criterion 1's scenario, so that test fails on the base through criterion 1's kills (D).
- No new machinery. The tests reuse the repo's fixture helpers.

## Held disagreements

- Not a decision, the decision stands. It is against the decision's first sentence ("a seat whose agent turn has ended counts as idle for prompt delivery even when a background shell it started is still running").
  - Fact: hc cannot tell an ended turn with a shell from a working turn with one (P1), and the listener has no timer (`src/listen.ts:listenCommand`).
  - Consequence: a shell started after the seat's own phase call, or a turn that ends without a phase call while a shell runs, still masks the seat with no wake. The 1 h busy notice does not post either.
  - Raised by A (forks/seed-decision.md `## Findings` F1). B and D proposed a delivery-time sweep with a quiet period. State: unanswered, recorded under autopilot.
- Not a decision, the decision stands. It is against the shell-sweep Taken Q2 being harness-independent.
  - Fact: codex keeps `node_repl` and `codex-code-mode-host` in the seat scope (P3), and codex masking is unobserved.
  - Consequence: if codex masks through those helpers, the sweep never unblocks a codex seat.
  - Raised by D. State: unanswered.

## Leaf architecture

- Owned surfaces:
  - `src/phase.ts:commitMove` (call site).
  - A new sweep function in the seat module (`src/seat.ts`, beside `cgroupOf`).
  - `src/timing.ts` (a `shell_sweep` row kind, one row per swept seat that had a process ended or an error, naming the slot) (C,D).
  - `src/admission.ts`: one new export listing the leaf's run records in state `waiting`, `live` or `ended` whose writer is alive (`writerLive`, private today). `liveStartTime` reads through `procRoot()` (B,C,D).
  - `src/hc.ts:terminalSchema` and `Seen` (add `argv`, `reason`, `foreground.name`).
  - `src/next.ts:dispatchSlot` (the lost-branch predicate).
- Sweep interface: `sweepSeatShells(repo, leaf, seats, spare)`. It is called once per committed move, after `saveState` and the move log. It returns one result per swept seat, used for that seat's timing row.
  - One boundary route, following the existing scans in `src/reconcile.ts` (C,D):
    - Every proc read goes through `procRoot()`: `<pid>/cgroup`, `<pid>/stat` for the parent and start time, `<pid>/comm`, and `self` for the caller chain. `src/seat.ts:cgroupOf` changes to read through `procRoot()`.
    - Scope membership is read from `cgroupRoot()` joined with the scope path, from that path's `cgroup.procs`.
  - Seat scope: resolve each recorded seat's harness pid from hc, then read its scope path from `<pid>/cgroup` under `procRoot()`. Require the path to sit under `leafSlice(repo, slug, home)` and end in `.scope`.
  - Kill set: shell roots per the Taken Q2 rule, with their descendants, minus the spares. Re-check each pid's start time (read through `procRoot()`; `src/admission.ts:liveStartTime` reads `/proc` directly) and scope membership. SIGKILL top-down, parents before children, then re-collect once and kill anything new.
  - Spares: the caller's ancestor chain from `self` under `procRoot()` upward, and any root subtree containing the writer pid of a run record of the leaf whose writer is alive (`src/admission.ts:writerLive`) in state `waiting`, `live` or `ended`.
- Failure: warn with structured fields, following `renameTab`'s warning in `src/phase.ts`. Never throw `MoveCommittedError` from the sweep.
- Consumers of changed state:
  - `src/next.ts:dispatchSlot` relies on the seat's hc status. After the sweep, claude reports `done` and advances `turn` (P1), and the existing listener `turn` wake runs the pass.
  - `src/next.ts:observeBusy` keeps `busy_since`. Open for the plan: confirm a stale `busy_since` carried across the advance cannot post a false busy notice once the seat reads `done`.
- Recovered-shell predicate: one function over `Seen`, used only in `dispatchSlot`'s lost branch. It must not go into `liveSeat`, `allocate`, `activeCount` or `src/reconcile.ts:broadcastInProgress` (Taken Q3).
  - The silent-end branch reads `prompted.turn < seat.turn`. A recovered terminal resets `turn` to 0, so it falls through to the lost branch.
  - Open for the plan: confirm that ordering with the recorded prompt turn above 0.
- Residual: shells in a replaced seat's old scope are not swept again (they cannot mask). Reconcile stops them at leaf close.
- Exclusions:
  - hc itself (Off route).
  - `src/timing.ts:readTimings` tolerance of unknown kinds (final-shape check, not taken).
  - herdr-app's keep setting (Taken Q3).
  - Consultant terminals of chart doors, which are not leaf seats.
