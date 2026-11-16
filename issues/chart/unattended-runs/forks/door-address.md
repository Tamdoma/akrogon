# Where the chart door reads its own hc address

## Question

Q1. Where does the door take "the door's address" from for the column helper, the restart helper and every brief's report step: `$HC_TERMINAL_ID` read at each use, a recorded value (summary, seats.yaml) checked against it, or something else?

Q2. Does the "door not in a tab" exit rule in SKILL.md `## Open` need to change once the address is live, or does a live address remove the dead-address case?

### Carries

- Signposts 1a, 2a (herdr-consultant-column lives in herdr-setup, outside this repo), 5a.
- Report #138 (INTAKE.md). Surfaces: skills/chart-issues/SKILL.md `## Open`, `## Handover`; assets/questions.md `## Blind peer exchange`; assets/handover.md.
- A chart that changes the door's own skill reaches doors only at the next release link.

## Findings

Blind notes: slots/door-address-A.md, -B.md, -C.md (no merge or rebuttal round: all three pick the same source; one point differs on Q2).

- Research (better-than-training, skills/chart-issues/SKILL.md `## Open`, `## Handover`, assets/questions.md `## Blind peer exchange`, assets/handover.md, read 2026-11-16): the inside-hc test reads `HC_TERMINAL_ID`, and every other rule says "door address" or "A address" with no source (A,B,C).
- Observation (A, 2026-11-16): `herdr-consultant-column t126 t1xx t1xy` run with this door's live `$HC_TERMINAL_ID` (t126) exited 0 and laid out the column. C observed `HC_TERMINAL_ID=t1xy` in its own shell, free.
- Pitfall (B): a literal `$HC_TERMINAL_ID` in a brief expands to the consultant's own address, and door-reset.ts runs in a helper terminal, so the value must be resolved by A and frozen into the brief or the argument.

## Taken

A's picks under full autopilot (2026-11-16, door t126), not operator words.

1. Q1: the door's address in every rule is `$HC_TERMINAL_ID` as A reads it at the moment of use. That covers the column helper calls including `--save` and `--restart`, each brief's report step, A's `transcript.ts` lookup, Mode and seat entries, door-reset.ts's target argument and the handover start prompt. A recorded address (summary, seats.yaml, Mode record) is history, never routing. A resolves the value and writes the literal into briefs and helper arguments, never the variable name. Reason: one live source removes the stale case (A,B,C). Rejected: a recorded value checked against the environment.
2. Q2: no change to the "door not in a tab" rule beyond stating its precondition: the helper was called with the live address. With that, the exit can only mean a live door with no tab. Reason: removal over a second guard (A,B). C's verify-and-rerun dissent stands.
