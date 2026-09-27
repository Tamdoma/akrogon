# Design: peer-c-role

## Binding decisions, verbatim

### Peer shape (issues/chart/chart-peer-c/forks/peer-shape.md)
Operator 2026-09-26: `1a, 2a, 3a`

Q1-A: C copies B's whole charting role: blind map at open, blind pass per fork, one disagreement-only rebuttal, one late check on a mechanism or contract change, and implementer review of draft contracts before handoff. The skill states these rules once for each named peer.
Q2-A: each peer is blind to A's draft and to the other peer's map, pass and rebuttal; each rebuttal reads only A's merged file.
Q3-A: C is named only with B; the first reply names B then C.

Why: B's recorded value came from its own independent view, and one rule for every peer avoids a second role to keep in sync; peers seeing each other converge.

Forecloses: a narrower C role (rebuttal-only or review-only), C reading B's work, C without B.

### Merge record (issues/chart/chart-peer-c/forks/merge-record.md)
Operator 2026-09-26: `1a`

Q1-A: merged points list the slots that agree, such as `(A)`, `(B,C)` or `(A,B,C)`, with the same rule for two or three slots; `(both)` leaves the skill and guide. Existing charts keep their `(both)` tags as history.

Why: one rule covers every slot count, and no code reads the tags.

Forecloses: keeping `(both)` beside a new `(all)` word.

### Standing locks carried
- door-second-slot (issues/closed/akrogon-loop/chart/forks/door-second-slot.md): a peer joins by the operator naming its pane at chart open; no config key, no election question; A owns the interview and the record; one rebuttal; one late check; restatements need no check.
- debate-count (issues/closed/akrogon-loop/chart/forks/debate-count.md): naming door peers never sets the `debate` field; any slot runs any harness, nothing is slot-dependent.

## Standing design

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md

Interpretation for this leaf: the change is agent-facing markdown with no auth, backend, secret or runtime path, so the auth, mutation and secret lines do not apply. No credentials are needed. The user-visible flow is the chart door, run by an agent reading the skill; end-to-end verification is the grep and diff criteria plus the repository checks, with the command output recorded in the implementation report. A three-pane herdr rehearsal is not required. No human-only prerequisite exists.

## Leaf architecture

Owned surfaces:
- `skills/chart-issues/SKILL.md`: lines 23 (first reply), 35 (opening map), 47 (per-fork exchange, rebuttal, direct requests, late check), 57 (handoff contract review, currently "two-slot exchange").
- `skills/chart-issues/assets/questions.md`: line 40 (independent research), section "Blind B exchange" lines 42-50 (rename to cover each peer).
- `docs/guide/chart.md`: lines 160-164 (section and prose), the diagram after it, line 201 (contract review).

Interfaces kept literal: `herdr agent wait` without a timeout; exact per-peer return paths under `<chart>/slots/` and the temporary directory before chart folders exist; the challenge check carries every peer's rebuttal.

Exclusions:
- `skills/chart-issues/assets/shapes.md`: `slots/<pass>.md` already covers any peer; no edit.
- `src/`, `tests/`, `config.yaml`, `issues/`: C has no config key, state, phase or dispatch role; lifecycle tabs stay two panes.
- plan-issue, implement-issue, check-issue and every other skill: C exists only in charting.
- Existing charts under `issues/` keep `(both)`.
- No advice on which model runs in C's pane; the operator did not decide it.

Dependencies: none.
