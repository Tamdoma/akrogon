# Design: fork-per-round

## Binding decisions, verbatim

### round-granularity
Operator 2026-09-21: 1-A. A round takes one fork. The agent picks the next fork, redoes research from the answers so far, asks that fork's questions, records Taken, and reshapes the remaining forks and fog before the next round. A one-fork destination is one round. Reason: every later fork is asked against a settled chart, which is where the old depth came from.
Forecloses: one complete round holding every fork's questions; bundling independent forks into one round to save turns.

### fork-order
Operator 2026-09-21: 1-A. CHART.md keeps an ordered "Open forks" list, next answerable fork first, preferring the one whose answer reshapes the most remaining forks, re-sorted after each Taken. Prerequisite notes stay in the fork's Carries. No new field. Reason: one editable place to see what comes next, on resume too, without a dependency system.
Forecloses: a `blocked-by` or status field on fork files (B); naming only the next fork in CHART.md (C).

### fog-graduation
Operator 2026-09-21: 1-A. Take gets one explicit step: after each answer, re-read Fog, move newly sharp material questions into their own fork files removing only that material from Fog, reshape the remaining forks, update the ordered Open forks list, then select and research the next fork. Reason: names source, destination and timing so the transfer stops being a habit. No fields, commands or approvals.
Forecloses: leaving "reshape the remaining chart after answers" as the only rule.

### Locks
Operator 2026-09-21 (#27): "Forks are taken one at a time, each in its own full-detail round with its own research ... If there's only one fork for smaller problems, that's okay ... Minimum changes: simplicity, clarity, elegance." Same vocabulary as today. No watchers, no new command state, no widening scope.

Standing design: `/home/ivan/.claude/skills/chart-issues/assets/standing-design.md`. Interpretation: this leaf changes skill prose and one guide page. No auth, secrets, backend state or user-visible flow exists, so the verification commands are the docs-links test and the full suite; the negative case is criterion 7 read as a whole, since a contradicting sentence left behind is the defect this leaf exists to remove. Leaf work is agent-owned; the operator later refreshes the installed copy under `~/.claude/skills`, which is not a leaf surface.

## Leaf architecture

Owned surfaces: `skills/chart-issues/SKILL.md` (Drain, Take), `skills/chart-issues/assets/questions.md` (round paragraph), `skills/chart-issues/assets/shapes.md` (CHART.md template, fork paragraph), `docs/guide/chart.md` (forks section, records paragraph), `skills/AREA.md` and `README.md` only if they describe chart rounds.

Literal interfaces:
- questions.md round sentence becomes: "Present the current fork's material questions in one complete round and wait for the operator's answer; the next fork is researched and presented after that answer." The rest of the paragraph is unchanged.
- SKILL.md Take, replacing "Record operator answers ... reshape the remaining chart after answers;": "Record operator answers and their reasons in fork files. After each answer, re-read Fog and move newly sharp material questions into their own fork files, removing only that material from Fog. Reshape the remaining forks and update CHART.md's ordered Open forks list before selecting and researching the next fork;" followed by the existing handoff-readiness and prototype clauses.
- SKILL.md Drain, after the territory map sentence: "A round takes one fork, the next answerable fork first, preferring the one whose answer reshapes the most remaining forks; a destination with one fork costs one round." The direct-item sentence in Drain becomes: "A direct single item whose map finds no open fork and no fog writes the same chart structure and proceeds to handoff immediately." (B)
- shapes.md CHART.md template:
  ```
  ## Forks taken
  - [<fork>](forks/<fork-slug>.md): <settled answer>

  ## Open forks
  - [<fork>](forks/<fork-slug>.md): <question in one line>, in the order they will be taken
  ```
  and the fork paragraph's last sentence becomes: "A fork file with no operator answer under `## Taken` is open and appears in CHART.md's Open forks list in the order it will be taken, next first."
- docs/guide/chart.md: one or two sentences in "Forks are decisions; fog needs investigation" and one in the records paragraph, no new heading.

Exclusions: no change to `src/`, `tests/`, `plugin/`, other skills, `issues/`, the installed skill copy, or the round shape (opening paragraph, research line, options, pitfalls, reply key, challenge check). No `blocked-by`, status or claim fields. No change to the B exchange rules, which already work per fork.

Dependencies: none.
