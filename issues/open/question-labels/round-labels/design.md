# Design: round-labels

## Binding decisions, verbatim

### Label scope (issues/chart/question-labels/forks/label-scope.md)
Question: Do question numbers restart at 1 every round, or keep counting for the whole chart session?

Operator 2026-09-28: `1a`. Question numbers restart at 1 each round. A round is one fork, so each fork is one unit: its questions are `1`, `2`, its options `1a`, `1b`, `2a`, its reply key `1a 2b`. Reason: one fork is one whole unit, with no counter to remember. Foreclosed: counting across the chart session (1b).

### Intake constraint (issues/chart/question-labels/INTAKE.md)
Operator 2026-09-28: "Can we always stick to the 1A, 1b, 1c, 2a, 2b, 2c, etc? ... I need the simplest, most elegant solution. I don't want to overcomplicate the skill itself for this." Consequence: the change stays inside `questions.md`. `SKILL.md` and `shapes.md` are not edited, and no counter or new mechanism is added.

## Standing design

`/home/ivan/.claude/skills/chart-issues/assets/standing-design.md`. This leaf edits agent instruction text only. No auth, secrets, backend state or user-visible app flow is touched, so the Playwright and end-to-end rules do not apply. No tests are added, since a test on skill wording would be a vanity test. Verification is the grep and read checks in the brief plus the configured `checks`.

## Leaf architecture

Owned surface: `skills/chart-issues/assets/questions.md`, the template block (current lines 5-25) and the paragraph at line 27.

Target template lines:

```markdown
### 1 · <the question itself, as a person would ask it aloud, ending in a question mark>
- **1a (recommended)** <what happens if you pick this, and the one reason it wins>
- **1b** <what happens if you pick this, and its cost>
### 2 · ...
Reply `1a 2b`, or a numbered free-text answer.
```

Added sentence, in the paragraph after the template, near "Number questions continuously within a round and restart at 1 in the next round.": label questions `1`, `2` and options `1a`, `1b`, `2a`, and use no other code scheme in a round. Its purpose is to override the operator's global reference-code rule (`Q1`, `O1`) inside rounds on every harness.

Exclusions: `SKILL.md`, `shapes.md`, other skills, `docs/`, the operator's `~/.claude/CLAUDE.md`, and answers already recorded in older charts under `issues/`.
