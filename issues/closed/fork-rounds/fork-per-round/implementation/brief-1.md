# Brief-1: skill round prose (questions.md, SKILL.md)

## 1. Goal

Implement plan D1-D4 for leaf fork-per-round. questions.md gets current-fork round sentence. SKILL.md Drain gets one-fork sentence plus fixed direct-item condition. SKILL.md Take gets fog-graduation step.

## 2. Numbered acceptance criteria

1. questions.md holds new first sentence and old `Present all currently material questions in one complete round` is gone. Rest of paragraph byte-identical.
2. SKILL.md Drain holds one-fork sentence between territory-map paragraph and split paragraph, and direct-item condition reads no open fork and no fog.
3. SKILL.md Take holds fog-graduation step with handoff-readiness and prototype clauses byte-identical after semicolon.
4. No new heading, field, file, or command in these two files.
5. Changed-test command in section 7 passes.

## 3. Read-first list

- `/home/ivan/Work/infra/akrogon/issues/worktrees/fork-per-round/skills/chart-issues/assets/questions.md`
- `/home/ivan/Work/infra/akrogon/issues/worktrees/fork-per-round/skills/chart-issues/SKILL.md`
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`
- Pattern to copy: existing Drain/Take declarative sentences ending with semicolon-joined handoff clause. Keep that shape.

Open the repo index only if a path above is missing.

## 4. Change list and needed interfaces

Worktree: `/home/ivan/Work/infra/akrogon/issues/worktrees/fork-per-round`. Edit only these files.

File 1: `skills/chart-issues/assets/questions.md`
- Old first sentence: `Present all currently material questions in one complete round and wait for the operator's answer.`
- New first sentence: `Present the current fork's material questions in one complete round and wait for the operator's answer; the next fork is researched and presented after that answer.`
- Keep following text unchanged starting at ` Plain free text is a valid answer`.

File 2: `skills/chart-issues/SKILL.md`, Drain
- Anchor paragraph: `Show a proportional territory map before grilling, including material forks, practitioner questions and pitfalls grounded in inspected surfaces; when B is named, A and B map independently before A merges with attribution, using the blind file exchange in questions.`
- Insert after it as its own paragraph: `A round takes one fork, the next answerable fork first, preferring the one whose answer reshapes the most remaining forks; a destination with one fork costs one round.`
- Old: `A direct single item whose map finds no fog writes the same chart structure and proceeds to handoff immediately.`
- New: `A direct single item whose map finds no open fork and no fog writes the same chart structure and proceeds to handoff immediately.`

File 2: `skills/chart-issues/SKILL.md`, Take
- Old: `Record operator answers and their reasons in fork files, keep sharp questions distinct from fog, and reshape the remaining chart after answers; handoff becomes ready only when no material question or fog requires the implementer to guess, with small optional prototypes explicitly chosen as measurements whose scratch code is discarded.`
- New: `Record operator answers and their reasons in fork files. After each answer, re-read Fog and move newly sharp material questions into their own fork files, removing only that material from Fog. Reshape the remaining forks and update CHART.md's ordered Open forks list before selecting and researching the next fork; handoff becomes ready only when no material question or fog requires the implementer to guess, with small optional prototypes explicitly chosen as measurements whose scratch code is discarded.`

## 5. Do-not, reasons and exceptions

- Do not touch shapes.md, guide, AREA.md, README.md, src, tests, other skills, issues. Reason: owned by brief-2 or excluded. Exception: none.
- Do not reword literals or add sentences. Reason: plan D1 requires verbatim. Exception: return mismatch with evidence if old text differs.
- Do not add headings, fields, files, commands. Reason: criterion C7 forbids them. Exception: none.
- Do not run full suite. Reason: B runs it after last worker. Exception: none.
- Return a mismatch with evidence to the plan author instead of changing scope or an interface. Exception: a revised brief from B authorizing that change.

Reasons restated: scope split, verbatim rule, C7 ban, suite ownership, mismatch path. Exceptions restated: none except revised brief for scope or interface change.

## 6. Ordered steps

1. questions.md criterion 1: grep old sentence to show red, replace first sentence only, grep new sentence plus old-gone to show green.
2. SKILL.md Drain criterion 2: grep territory anchor and direct-item old text, insert one-fork paragraph and fix condition, grep both new strings.
3. SKILL.md Take criterion 3: grep Take old clause, replace with new three-sentence step, grep `re-read Fog` and handoff tail.
4. Criteria 4-5: confirm `git diff --stat` shows only these two files, run section 7 command.

Advisory size: 2 files, under 8 turns.

## 7. Commands

```sh
AKROGON_BASE=c9c96553f8d64c76668a1e2a9aee027e9d634ad1 bun test --changed="c9c96553f8d64c76668a1e2a9aee027e9d634ad1"
```

Run only this test command. Use grep for red/green checks.

## 8. Done-when, evidence and report

Done when criteria 1-5 hold with pasted grep and test output. Keep limitations explicit.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
