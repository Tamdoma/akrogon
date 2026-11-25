# Final-shape check: shell-sweep, slot B

No defect in K1–K4 as written. Checked against akrogon source and four free probes run 2026-11-25. What I verified for each correction:

## K1 — SIGKILL, no wait, at commitMove after the save

- `src/phase.ts:commitMove` writes the new state (`saveState`) and prints the move before any follow-up work, and wraps follow-up failures in `MoveCommittedError` — so a sweep placed with the follow-up work cannot uncommit the move, matching the correction's "warns, never marks the move failed". Compatible.
- SIGKILL correctness: my mapping-session probe killed the mask shell with SIGTERM and claude flipped root to `done`. SIGKILL produces the same waitable death event for the harness — no mechanism in claude can distinguish them, since both are observed through the child becoming waitable. No defect. (The only thing dropped is graceful cleanup of the shell's own children, which K2's tree-kill already makes moot — they are in the kill set anyway.)
- Caller-chain sparing is implementable where it matters: the census (2026-11-25, live seat fw-seo-targets-ia-keyword-a) shows the reporting `bun` inside the seat's bash family, so the chain walk from `process.pid` to the harness is real and short. For dispatch-driven moves the caller is outside every seat scope and the walk simply exits the scope. No defect.

## K2 — root rule, spares, never-skipped

- The parent rule is consistent with observed topology: reparented processes in these scopes are adopted by herdr-core (census 2026-11-25: harness ppid is the herdr-core pid 15010, itself outside the seat scope), so "parent is the harness pid or a pid outside the scope" catches both direct and orphaned shell roots. No defect.
- Root/tree relationship is sound: the inner wrapper bash (ppid = outer bash, inside scope) is not a root but sits inside the outer root's tree. No double-kill or miss.
- The run-check spare is implementable as written: `src/admission.ts:liveRuns` yields records carrying the writer `pid` plus `start_time` (with the documented pid-reuse check via `/proc/<pid>/stat` field 22, `src/admission.ts:liveStartTime`), and `run`/`leaf` fields to filter by leaf. A root subtree is spared exactly when it contains a live writer pid of this leaf. Verified live (2026-11-25): an active run-check `bun` writer sits inside the seat scope's shell family while its payload scope is a sibling — so the spare is load-bearing, and it exists. No defect.
- pid/start-time re-check before signalling matches the existing `liveStartTime` pattern. No defect.

## K3 — two evidence shapes, schema widening, predicate scope

- Probed 2026-11-25 in a throwaway hc session (zprobeboot), simulating reboot by killing the payload and restarting the core:
  - Surviving payload across a core restart: terminal reattaches with real `pid`, `foreground` intact — the parked shape does **not** false-positive on healthy seats. (This was the main defect risk I went looking for; it does not exist.)
  - Killed payload across a core restart: terminal resurrects live with `status: null`, `reported: false`, `foreground` = `{name: bash, argv: ["/usr/bin/bash"]}`, fresh shell pid. Exactly the spawned shape.
  - In the window between death and shell spawn, the terminal showed `pid: null`, `reason: "signaled"`, `foreground: null` — the parked shape exists and `spawn_pending` is a real distinct value to exclude.
- `argv[0] is not systemd-run`: consistent with reality. Healthy seats' foreground argv0 is the harness path (checked live, seat t3h6: the claude binary path, fg pid == harness pid, 2026-11-25); systemd-run exits after setup and never occupies a foreground. The exclusion is redundant-but-harmless for health, correct for rejecting boot-window misreads. No defect.
- One editorial correction, not a defect: `src/hc.ts:terminalSchema` already carries `foreground.argv` (line 19). The widening needed is `foreground.name`, plus `reason` and `reported` at terminal level.
- Confining the predicate to dispatchSlot's lost branch does not regress capacity or broadcast accounting: `activeCount`/`liveSeat`/`broadcastInProgress` keep their current (less precise) behavior, which is what they do today — no mechanism is broken, one is merely not improved. Consistent with the dissent record (D R6). No defect.

## K4 — keep-off rejected

- Verified the premise and the conclusion independently. Probe 2026-11-25: without `keep`, an externally killed terminal goes `finished` (lost-seat path handles it); with `keep`, it resurrects as a bare shell. So keep-off would indeed remove the need for K3 detection.
- The rejection stands anyway: `hc run` in `src/hc.ts:run` passes no `--keep` flag, yet seats are keep — the flag is set outside akrogon. `~/.config/herdr-app/AGENTS.md` (sections on herdr-core ownership and terminal panes) corroborates that herdr-app owns terminal lifecycle policy. A mechanism akrogon does not control cannot be the fix; K3's detection is the only owner-side answer. No defect in the rejection.

## Residual honesty

Two items sit below the defect bar but belong on the record:

1. A seat replaced through the lost path is ended via hc, but its systemd scope is not a child of the hc terminal in the process tree — shells inside the old scope can outlive the replacement and are never swept again, because the sweep targets recorded seats and the record now points at the new terminal. Bounded resource leak, no masking effect (nothing delivers to the old shells' harness, which is dead). Not a K-defect; a candidate residual line for the leaf design.
2. The K1/K3 reliance on `reason` values (`signaled`, `server_stop`, `stopped_by_restart`, `holder_lost`, `spawn_pending`) rests on one evening's probes of hc 0.1.22. These strings are undocumented; a version change in herdr-core can rename them, degrading detection silently to today's stall. Mitigation already inside the leaf shape: the spawned shape (foreground shell) carries most of the weight and does not depend on `reason`.
