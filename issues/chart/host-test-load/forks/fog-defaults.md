# Fog defaults

## Question
Q1. Do the six remaining Fog items stay as accepted defaults with no extra code?
- Seat tool timeouts on a waiting run: the waiter keeps running in its pane box and runs later.
- Servers alive across separate run-check calls: released over, the server stays in the pane box.
- A SIGKILLed run holder: check_start without check_end.
- Hand-split panes in a leaf tab: outside the box, not stopped.
- herdr server restart with dead panes: existing repair path recreates, seat-containment boxes them.
- Empty leaf slices after merge: stay loaded until the user manager restarts, no processes.

### Carries
- Sources: queue-order B,C; permit-release C; seat-scope C. proofs.md T3 (empty slice stays active).

## Findings
Handoff review 2026-10-13. Each default adds no code and none can raise host load past the slice limits.

## Taken
Operator 2026-10-13: "1a | 2a | 3a". 1a: all six accepted as written into the leaf designs. 2a: debate no. 3a: tree, contracts and live-change grants approved.

Correction 2026-10-13 after the leaf review (B, A): seat-containment's live run links its akrogon.slice into ~/.config/systemd/user, reads real properties, then removes the link; self-update's install stage also installs the slice link. Operator: "1a" (allow).
