# Brief: shell-sweep

## What

Two changes in akrogon dispatch.

1. When `akrogon phase` (or any command) commits a leaf's phase move, akrogon ends the leftover shells of every recorded seat of that leaf. Leftover shells are the shell processes in the seat's systemd scope whose parent is the harness or a process outside the scope, together with their descendants. The sweep spares:
   - the calling process's ancestor chain
   - any shell subtree holding the process of a run-check of the leaf that is still running or still publishing
   - every non-shell harness child (MCP servers, codex helpers) and the shells under those helpers.
   Each swept seat that had a process ended or an error gets one `shell_sweep` timing row. A sweep failure warns and leaves the committed move in place.
2. Dispatch treats a seat terminal that hc recovered as a bare shell (after a reboot, a core restart or a signal death) as a lost seat. It takes the existing lost-seat path and charges `lost`.

## Why

Tamdoma/akrogon#157.
- Claude keeps its hc status at `working` while a background shell it started is alive, even after its turn ended (charting proof P1). The idle gate in `src/next.ts:dispatchSlot` then never delivers the next phase prompt, and the leaf stalls silently. The incident leaf stalled 4 h 50 m until the operator killed the shell by hand.
- After a host reboot, kept seat terminals come back as live bash shells with no status. Dispatch neither delivers to them nor relaunches them.

## Done-criteria

These are the door's criteria. The operator decision has no `Done when:`.

1. Covers the decision's second sentence, "Leftover seat shells end when the leaf's phase advances". After a committed phase move, these processes are gone:
   - each leftover shell of every recorded seat of the leaf (a shell in the seat scope whose parent is the harness or a process outside the scope)
   - the descendants of each such shell, including a reparented background shell and a looping shell that keeps starting children.
   For each seat that had a process ended, one `shell_sweep` timing row names the leaf, that seat's slot and the ended pids with their program names (C,D). Proof: own test with real processes at the `/proc` and cgroup boundary.
2. In the same sweep these all survive:
   - the calling process and its ancestors
   - a shell subtree holding a run-check of the leaf that is still running or still publishing its log after its payload ended
   - a non-shell child of the harness, and a shell under that child.
   Proof: the same own test as criterion 1, in the same scenario, so it fails on the base through criterion 1's kills (D).
3. When the sweep cannot end a process or read a seat, the move stays committed, `akrogon phase` exits as it does without the sweep, and a structured warning names the leaf, slot, pids and error. Proof: own test.
4. A recorded seat terminal that is `live` with null status is replaced through the existing lost-seat path (seat_lost row, end, `lost` + 1, failed at 3, `startSeat`) when it shows either recovery shape:
   - parked: null pid and a set reason other than `spawn_pending`
   - spawned: a shell foreground program and a non-empty launch argv whose first word is not `systemd-run`.
   A seat still starting (launch argv `systemd-run`, or reason `spawn_pending`) is left alone. Proof: own test using hc terminal records shaped like the charting proofs P2.
