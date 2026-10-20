# stuck-repair

## Question

How does the one stuck framework twin (open satellite-plan-fit, 6 merged leaves, GitHub #282 and #285 still open) get finished: move its leaves into the closed satellite-plan-fit once, or rename it and rewrite its recorded log paths?

### Carries

- Reshaped 2026-10-19 by A: the 20 #103 leaves named in the intake are already under framework `issues/closed` (e.g. check-accuracy/component-loader) and their sources (#276, #242, #243, #273, #274, #185) are CLOSED on GitHub, so only satellite-plan-fit remains stuck.
- owner-reuse 1a (operator 2026-10-19): no name reuse; the one existing twin is repaired once.
- close-witness 1a (operator 2026-10-19): `delivered by <slug>`; no worktree needed.

- Operator 2026-10-18: "most elegant systemic issues. Always better to remove redundancies and complicated code first before adding and stacking new code."
- Opening map: issues/chart/paid-proof-bounds/slots/map-merged.md

## Findings

Full notes: [slots/stuck-repair-merged.md](../slots/stuck-repair-merged.md) (A,B,C notes and rebuttals, 2026-10-19).

- better-than-training · GitHub reads 2026-10-19 (A,B,C) · #282, #285 OPEN (pool-parity); #281, #284, #292, #294 CLOSED; the intake's #103 leaves are already closed.
- better-than-training · framework tree 2026-10-19 (A,B,C) · 757 recorded wave-2 log paths carry the owner name; only EPIC.md overlaps between the twins; 0 archive name overlap with the 708 loose logs (B,C).
- better-than-training · live `akrogon log` probe 2026-10-19 (C) · a recorded wave-1 log path fails to read today because the open twin hides the closed archive.
- better-than-training · src/pack.ts, src/pack-command.ts, src/pull.ts closeCommand (A,B,C) · pack and close exist and are rerunnable; pack checks bytes and reads members back before unlinking.
- model-knowledge · no outside search: a one-time data repair in this repo.
- Changed the question: the #103 part fell away (already repaired); keeping the twin as a live proof is void under owner-reuse 1a (A, C withdrew).

## Taken

Operator 2026-10-19: "1a | 2a | 3a |" (answered the plain-language rewrite of round 3 after "elid").

- 1a: the door moves the six wave-2 issue folders into `issues/closed/satellite-plan-fit` once, keeps the owner name, merges the two EPIC.md files into one index, removes the empty open owner, and packs with `akrogon pack issues/closed/satellite-plan-fit`.
- 2a: #282 and #285 are closed with `akrogon close <source> --by pool-parity` only after the move and pack are verified.
- 3a: one team broadcast for the six wave-2 leaves after the repair.

Binding avoidance mechanisms: the empty open owner is removed before packing (A,B,C); only satellite-plan-fit paths are changed, never timings.jsonl or verify-runs.jsonl (B,C); pool-parity's worktree and tab are left to reconcile (A,B,C); both sources are read back CLOSED before the repair is called done (A,B,C); the broadcast covers only the six wave-2 leaves.

Done 2026-10-19 by the door on framework main (uncommitted, left for the operator's issues commit): six folders moved into `issues/closed/satellite-plan-fit`, one EPIC.md listing all eight issues, open owner removed; `akrogon pack issues/closed/satellite-plan-fit` printed "708 packed (0 tracked, 708 untracked), 708 deleted"; all 797 recorded satellite-plan-fit log paths in timings.jsonl and verify-runs.jsonl read back with `akrogon log` (0 unreadable; a wave-1 path failed before the repair); `akrogon status` lists no satellite-plan-fit leaf; `akrogon close Tamdoma/tamdoma-framework#282 --by pool-parity` and #285 read back CLOSED with comment "delivered by pool-parity"; broadcast to DISCORD_WEBHOOK_URL_1 delivered (exit 0).
