# Terminal chart disposition

## Question

Q1. Which terminal stages exist: `closed` only, or `closed` and `held` as distinct stages?

Q2. What does `held` mean and which declaration wins when a chart carries more than one marker, including after a reopening?

Q3. Do the two existing framework CHART.md records get normalized to the new markers, and when?

### Carries
- `skills/chart-issues/assets/shapes.md:163` refuses a leaf whose What, done-criteria or owned surfaces touch any path under `issues/`. Both framework records are under `issues/`, so normalization can only be an operator step on main, never a leaf in any repo. (B, R1)
- `skills/chart-issues/assets/shapes.md:33` and `SKILL.md:57` are the existing writer contract, defining only `Handed off <YYYY-MM-DD>`.
- Charts have no state.yaml and no lifecycle phase (`shapes.md:15`).

## Findings
- (both) `src/status.ts:247` gives any `^Handed off` line unconditional precedence over everything else. A second marker has no defined behaviour today.
- (B) The live held chart `framework/issues/chart/skill-lane-argument-kind/forks/disposition.md:16-18` says the fixer owns implementation and verification and the GitHub reports stay open pending evidence. It does not establish a universal "will never hand off" meaning for held, so Q2 is material and not settled by Q1.
- (B) The same fork lists both "hold" and "hand off" as options at line 4, which is why prose inference is off route.
- (A) Marker regexes must be anchored at line start like the existing one, or Off route prose matches.
- (both) One issue, one leaf in `akrogon`: writer contract, reader and scenarios are one observable outcome, not separate prose and code issues.

## Taken
2026-09-18, operator:

Q1 taken: `closed` and `held` as two distinct stages.
Reason: the two live examples are genuinely different states; one is dead, one has live obligations with a fixer.
Forecloses: a single collapsed terminal word.

Q2 taken: the last marker line in the file wins.
Reason: reopening becomes an append, nothing is deleted, history stays readable, and it matches the existing append-only `Handed off <date>` habit.
Forecloses: unconditional `Handed off` precedence; any rewrite-in-place scheme.

Q3 taken: normalize both existing framework records, and the chart-issues door agent performs the edits, not the operator.
Operator verbatim: "3a - you do them yourself, I'm not touching the code"
Reason: two lines, and without it the reported rows still read `charting` after the leaf merges.
Forecloses: leaving the records unchanged; any leaf owning the edit (refused by shapes.md:163).
Execution: the door agent edits `framework/issues/chart/legacy-lifecycle-residue/CHART.md` and `framework/issues/chart/skill-lane-argument-kind/CHART.md` on main at handoff, once the marker wording is final. Recorded as a prerequisite with the door agent as owner.
