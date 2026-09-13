# Sub-brief 1: chart-issues skill rewrite

## 1. Goal

Rewrite `skills/chart-issues/SKILL.md`, `assets/questions.md`, `assets/shapes.md` in the land vocabulary. Plan D1, D4. Criteria 1–3.

## 2. Acceptance criteria

1. Each of territory, map, fog, fork, question, round, chart, off route appears in `skills/chart-issues/` with the design's meaning (below).
2. `grep -rniE "decision|batch|not yet specified|out of scope" skills/chart-issues/` matches only lines about binding decisions in leaf designs.
3. `assets/shapes.md` states: one fork file holds one or more questions always presented on one screen; a fork is taken when every material question is taken; a pre-handoff correction is a new fork naming the superseded one.

## 3. Read-first

- `/home/ivan/Work/infra/akrogon/issues/open/charting-vocabulary/rename-vocabulary/brief.md` and `design.md` (authoritative word meanings)
- The three files being rewritten, in full
- `ponytail.md` in this skill folder

## 4. Vocabulary map (apply exactly)

- `decisions/` folder → `forks/`; `decisions/<slug>.md` → `forks/<slug>.md`; "decision file" → "fork file"; "the selected decision" → "the selected fork".
- The individual split inside a fork is a `question`. "Each question decides one thing" → "Each question settles one thing".
- `batch` → `round` for operator Q&A (opening paragraph, Q blocks, reply key, challenge check). For the attended handoff use "the handoff" or "one attended handoff review" — a round is only the Q-block screen, never the handoff.
- `Not Yet Specified` → `Fog`; "material work not yet specifiable" → "fog"; "unspecified" → "fog" or "open" by context.
- `Out Of Scope` → `Off route` (work deliberately left past the destination, with the reason).
- `## Resolution` → `## Taken`; "resolved/decided" for chart items → "taken"; "unresolved decision" → "open fork"; "when every decision is resolved" → "when every fork is taken".
- `## Decisions So Far` → `## Forks taken`; `## Open Decisions` → `## Forks open`.
- SKILL.md `## Decide` heading → `## Take`.
- "operator decision" where it means the operator's go-ahead on the handoff tree → "the operator's go-ahead" or "authorization" (shapes.md already uses "handoff authorization").
- Keep: "binding decisions" in leaf designs (shapes.md leaf-design section), `Handed off <date>`, `slots/`, `debate` field, `hand_built`. Keep "decides what to build"-style verbs only where they mean a human choosing, not a chart record — prefer "settles"/"takes" where the chart meaning applies.
- Slot exchange examples in questions.md: `decision-name-*.md` → `fork-name-A.md`, `fork-name-B.md`, `fork-name-merged.md`, `fork-name-rebuttal-B.md`, `fork-name-final-check-B.md`.
- questions.md "For a decision, send B the intake…" → "For a fork, send B the intake…"; "The returned B file is a full batch" → "a full round"; "the measured finding in the decision" → "in the fork".
- shapes.md chart-records block: `decisions/<decision-slug>.md` → `forks/<fork-slug>.md`; "Create decisions/ even for a fully settled direct item" → "Create forks/ even…"; "CHART.md points to the selected decision" → "the selected fork".
- shapes.md fork-file template: `# <fork title>`, `## Question` holding one or more Q blocks, `### Carries`, `## Findings`, `## Taken`. "Unresolved questions have no invented Resolution" → "…no invented Taken". "A sharp question gets its own file" stays true at question granularity inside a fork — reword so a fork file holds the questions that travel together.
- Add to shapes.md (criterion 3), near the fork-file template: one fork file holds one or more questions always presented together on one screen; a fork is taken when every material question in it is taken, partial answers stay under `## Findings` and `## Taken` is written only then; a taken fork is never reopened — a correction before handoff is a new fork naming the one it supersedes, the original stays verbatim, only the effective answer becomes a binding decision.
- SKILL.md: "Record operator answers and their reasons in decision files" → "in fork files"; "no material decision or unspecified work requires the implementer to guess" → "no material question or fog requires…"; "every chart still holds an unresolved decision" → "an open fork"; "when every decision in every chart is resolved" → "when every fork in every chart is taken"; "asking the debate question once for the whole batch" → "once for the whole handoff"; "one attended handoff batch" → "one attended handoff review"; "the complete operator batch" → "the complete operator round"; "merges the completed independent batches" → "independent rounds"; "before an operator batch" → "before an operator round"; "resume from CHART.md and the selected decision's linked context" → "the selected fork's linked context"; description line "charts of open decisions" → "charts of open forks".
- questions.md: "Read before presenting an operator batch" → "operator round"; "what this batch settles" → "what this round settles"; "Every batch uses this exact shape" → "Every round"; "Number questions continuously within a batch and restart at 1 in the next round" → "within a round"; "Present all currently material questions in one complete batch" → "one complete round"; "cannot supply an operator decision" → "an operator answer"; "the complete operator batch" → "the complete operator round"; "a full batch, not a reaction" → "a full round"; "the current batch" → "the current round"; "decide without it" → "settle it without measurement" (or similar); "the decision" → "the fork".

## 5. Do-not

- Do not touch `assets/standing-design.md` (no chart vocabulary in it), other skills, src, tests, docs, or anything under `issues/`.
- Do not change behavior, file layout, preflight, handoff or footer semantics — words only, except the added fork-shape sentences criterion 3 requires.
- Do not rename "binding decisions", `debate`, `hand_built`, `Handed off`, `slots/`.
- Return a mismatch with evidence instead of inventing new structure; exception is a revised brief from B.

## 6. Steps

1. Rewrite SKILL.md (criterion 1, 2).
2. Rewrite questions.md (criterion 1, 2).
3. Rewrite shapes.md including the criterion-3 sentences (criteria 1, 2, 3).
4. Run the criterion-2 grep; iterate until only binding-decisions lines match.

Advisory size: 3 files, under 15 turns.

## 7. Commands

`: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE"` with `AKROGON_BASE=d554f78d87bb7b29a4da8528da4c641e3ba66785` — expected to select no tests for markdown-only changes; the criterion-2 grep is the real check here.

## 8. Done-when, evidence and report

Criteria 1–3 verified by grep and by reading the final files; paste the criterion-2 grep output.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
