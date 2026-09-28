# Design: create-peer-panes

## Binding decisions, verbatim

### Peer panes (akrogon chart chart-peer-panes, operator 2026-09-28: "3a | 4a | 5a")
- Q1-A: when the operator asks for peers without supplying panes, the door creates them: split A right at 0.5, then split B down at 0.5 for C. With B only, B takes the whole right half. Supplied panes still work unchanged. Reason: removes the manual layout step.
- Q2-A: the door asks once at open which harness and model each created peer runs.
- Q3-A: the door arranges only panes it creates and never moves supplied or unrelated panes. Foreclosed: temporary-tab moves.

## Standing design

`/home/ivan/.claude/skills/chart-issues/assets/standing-design.md`

- Auth, backend mutations and secrets: not applicable.
- No vanity tests: this is a skill prose change. Evidence is the done-criterion 5 layout capture from real herdr commands.
- Negative and edge cases: B only, supplied panes, A sharing its tab, running outside herdr.
- End-to-end: done-criterion 5 records the live layout as the artifact.
- No human-only prerequisite and no credentials.

## Leaf architecture

Owned surfaces:
- `skills/chart-issues/SKILL.md` Open section.
- `skills/chart-issues/assets/questions.md` blind peer exchange paragraph (`:44`).

Exclusions:
- No akrogon command, config key or `src/` change. Peer settings are asked, not configured.
- No `pane move` or temporary-tab rearrangement.

Pitfall: split A before B, or the ratios come out 25/75.
