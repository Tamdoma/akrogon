# Plan: option-drawings

Docs-only leaf. Add the chart door's drawing rule to `skills/chart-issues/assets/questions.md` ("Operator questions and peer exchange") and `docs/use/plan-work.md` ("Answer one fork per round"). No `src/`, `tests/` or `issues/` change; no test pins the round shape (standing design: review reads the text against the done-criteria and renders the template once by eye). Prose conditions are observed by B's review reading; the plan's own commands cover the mechanical parts (one template block, 60-column block, placement, file scope).

## Read first

- `brief.md`, `design.md` (this leaf folder) — done-criteria and locked picks.
- `skills/chart-issues/assets/questions.md` — the file under change: the template fence (line 3 area), the "Every round uses this shape" paragraph, the signposts exception paragraph.
- `docs/use/plan-work.md` — section "Answer one fork per round".
- `skills/chart-issues/assets/standing-design.md` — no vanity tests; prose criteria are read, not executed.
- `skills/chart-issues/SKILL.md` `## Autopilot` (line 135) — confirms autopilot rounds are presented rounds, so one rule covers every mode.
- `tests/docs-links.test.ts` — confirms `docs/**.md` and every SKILL.md are link-checked; the one-sentence plan-work.md edit adds no link, so the configured `test` check stays green.
- `/home/ivan/Work/infra/akrogon/learnings/LESSONS.md` — one relevant lesson: 2026-09-11 stale-rule-in-docs (a rule changed in a skill was left stale in `docs/`). Mitigation already in scope: `grep -rn "round" docs/` shows `plan-work.md` is the only doc hit carrying the round rule.

## Interfaces needed

None. Text only; no code reads `questions.md` (checked: `grep -rn "questions.md" src/ tests/` finds only `src/run-check.ts` naming the log label and `tests/chart-shapes.test.ts` naming `shapes.md`, not this file). The template is a shape the door copies when writing a round.

## Decisions

- D1 — Fence arithmetic. The template's outer fence becomes ` ```` ` (four backticks, info string `markdown`) and the example drawing block inside uses ` ```text `. CommonMark: an inner fence closes the outer only if it is bare and at least as long; ` ```text ` carries an info string so it can never close any fence, and a bare ` ``` ` is shorter than ` ```` ` so it cannot close it either. The template still renders as one block. The door's real rounds emit ` ```text ` for drawings, so the inner form matches emitted output.
- D2 — Rule sentence in the "Every round uses this shape" paragraph, after the parts list and before the trap sentence, reading roughly: "A question carries drawings only when its options differ in something a person sees or follows — a screen, layout, state change, flow, file or tree shape — and a drawing makes the choice much easier; when it does, one fenced `text` block sits directly after that question's option bullets and before How to choose, with one drawing per option captioned with its option code, the drawings side by side when both fit the door pane's width of about 60 columns and stacked otherwise, and a drawing replaces no required round part." The same block states the rule holds for autopilot rounds (they are presented rounds under `SKILL.md` `## Autopilot`, so one sentence naming no mode exception, plus the words "in autopilot rounds too" to make it explicit), and A's pre-send read covers it — the existing last sentence "Before sending a round, A reads it once against these rules and fixes what fails" gains no new clause beyond "these rules" already covering the drawing rule; record whether the rule is named in that sentence or covered by "these rules" (D9 below).
- D3 — Signposts exception sentence gains one clause, keeping its single sentence: after "it carries no research line", add "and it may carry drawings under the same test". This is the design's "one word in its exception sentence" settled as a short clause (a bare word cannot carry "under the same test").
- D4 — Fork record: extend the existing sentence "The fork records the chosen option's avoidance mechanisms as binding decisions, carried into each affected leaf." with "and keeps the chosen option's drawing verbatim beside them."
- D5 — plan-work.md, one sentence in the second paragraph of "Answer one fork per round" (after "the research behind it"): "A question whose options look different comes with a small drawing of each when the drawings make the choice much easier." Keeps the "much easier" condition per the adopted correction.
- D6 — Template example: under question 1's options, after the `- **1b**` bullet and before `How to choose`, one ` ```text ` block, two captioned mini-panels side by side, all lines ≤60 columns. Sketch (placeholder style matching the template's `<...>` convention):

  ```text
  1a                          1b
  +--------------------+      +--------------------+
  | <option 1a's drawn |      | <option 1b's drawn |
  |  shape>            |      |  shape>            |
  +--------------------+      +--------------------+
  ```

  (Longest line 56 columns.) The implementer may simplify the panels but must keep captions-as-option-codes, side-by-side form and the 60-column bound.
- D7 — Commit shape: one commit on `option-drawings`, both files, no `src/`/`tests/`/`issues/` change; criterion 5's diff then lists only the two named files. Working-tree edits are invisible to that diff (it is commit-vs-commit), so the same check runs after committing, and `git status --porcelain` clean is verified before the pass ends (lesson 2026-09-11 uncommitted handoff).
- D8 — No `Open for the plan:` questions in the design; all listed choices resolve as above. One design-vs-brief tension, noted for review not reopened: the design's carried line says "side by side when they fit about 80 columns" in pick 2 but the adopted correction sets 60; 60 governs (correction adopted 2026-11-04).
- D9 — Criterion 1's "A's pre-send read covers it" is satisfied by the existing final sentence's "these rules" now including the drawing rule; no new sentence needed. If B reads it as requiring the drawing named at that site, the fallback is appending "including any drawing block" to that sentence — same site, same clause count. Decide at write; record choice in report.md.

## Checklist and waves

Serial-solo: the two files form one rule change (the doc sentence restates the skill rule; splitting would force duplicating the decision context) and one unit keeps both edits in one commit. implement-issue's serial-solo rule applies: A implements the plan itself, no workers.

- Unit U1 (owns `skills/chart-issues/assets/questions.md`, `docs/use/plan-work.md`): apply D1–D6, run P1–P4 below, commit, run P5.
  - Docs checklist: `docs/use/plan-work.md` (one sentence, D5) — affected; `skills/chart-issues/assets/questions.md` — affected (it is the product surface). No other agent or human doc carries the round-shape rule: `grep -rn "round" docs/ skills/*/SKILL.md` shows SKILL.md delegates the shape to questions.md ("The round's light shape … live in questions.md") and the rest of `docs/` describes rounds only by link to that section. No doc beyond the two named files is affected.

## Criteria → observations

### C1 — reader learns when/where/form/replacement/pre-send (questions.md prose)

- Observation: B's review reads the "Every round uses this shape" paragraph against the criterion (the real boundary is the rendered skill text; a review read is the only meaningful consumer check — a grep for words would not prove a reader learns them).
- Mechanical aids (run at implement, not proof of the prose):
  - P1 (placement + one block): `sed -n '/^````markdown/,/^````$/p' skills/chart-issues/assets/questions.md | grep -q 'Challenge check' && sed -n '/^````markdown/,/^````$/p' skills/chart-issues/assets/questions.md | grep -c '^```text$'` → exit 0 and count 1; plus `awk` order check: `awk '/^````markdown/{t=1} t&&/^```text$/{d=NR} t&&/^How to choose/{h=NR} END{exit !(d<h && d>0)}'` → exit 0.
  - P2 (width): `sed -n '/^```text/,/^```$/p' skills/chart-issues/assets/questions.md | awk 'length($0)>60{print "OVERWIDTH"; bad=1} END{exit bad}'` → exit 0.
- Condition check (D2's sentence): conditions the criterion states — "only when visible-or-followed difference AND much easier", "directly after bullets, before How to choose", "one per option captioned with code", "side by side if fit ~60 else stacked", "replaces no required part", "pre-send read covers". All are prose meanings a mechanical case cannot violate selectively; the reachable-by-decision conditions are D1's fence and D6's width/placement, covered by P1/P2 reds below. The wording conditions are held by the write itself and B's read — traced reason: no code path can break a prose clause, and the only mechanical surface (fence, columns, position) has cases.
- Size: seconds. Rerun trigger: any edit to the paragraph or template.

### C2 — template shows one drawing block under question 1's options, renders as one block, ≤60 cols

- Observation: P1/P2 above plus one eyeball render of the extracted block by the implementer (standing design: renders once by eye).
- Red at planning (temporary edits, reverted):
  - Premature close: bare ` ``` ` inserted inside the template, extracted at the current 3-backtick outer — `check template-closes-early: 1` (log `implementation/check-template-closes-early-1793795666469-3496304.log`, silent exit 1 = `Challenge check` not found). Under D1's 4-backtick outer the same failure shape is a bare 4-tick line inside; P1's `^````$` close pattern stops at the first one, so the same command catches it.
  - Overwidth: 62-column line inside a `~~~text` block — `check drawing-block-width: 1` (`implementation/check-drawing-block-width-1793795669511-3496671.log`, prints `OVERWIDTH 62: …`). Note: the probe's own sed pattern is `/^```text/` for the implemented block; the planning red used `~~~text` to avoid closing the live 3-backtick outer — equivalent width check on whichever inner fence D1 lands.
  - (Rejected earlier run `template-one-block` used the post-change 4-backtick anchor on the baseline file — vacuous red, not evidence; superseded by `template-closes-early`.)
- Condition check: "still renders as one template block" — D1's fence arithmetic plus P1; "inner fence differs" — ` ```text ` inside ` ```` ` differs by length and carries an info string (cannot close); "fits 60 columns" — P2, red shown.
- Size: seconds. Rerun trigger: edit inside the template block.

### C3 — autopilot coverage, signposts may carry drawings, Taken keeps drawing verbatim

- Observation: B's review reads the three sites (shape paragraph's autopilot words, signposts exception clause, fork-record sentence). No mechanical condition: three prose facts, each one clause, nothing a command can break selectively. Traced reason: prose-only.
- Size: seconds. Rerun trigger: edit to those sentences.

### C4 — plan-work.md one sentence with "much easier" condition

- Observation: B's review reads the paragraph; P3 display aid `sed -n '/## Answer one fork per round/,/## Review the handoff/p' docs/use/plan-work.md` prints the section for the read.
- Condition check: "says in one sentence" — prose; the "much easier" clause presence greppable (`grep -n 'much easier' docs/use/plan-work.md` exit 0). `docs-links.test.ts` stays green (no link added) — covered by configured `checks.test`.
- Size: seconds. Rerun trigger: edit to the section.

### C5 — diff lists only the two named files; src/, tests/, issues/ unchanged

- Observation (its own proof command, run post-commit): `test -z "$(git --no-pager diff --name-only 5499e3dab209ccc6fae14c8f4568e62e5c4c15c2...HEAD | grep -vE '^(skills/chart-issues/assets/questions.md|docs/use/plan-work.md)$')"` — diff minus the two allowed paths is empty — plus `test -z "$(git status --porcelain)"` for a clean tree (an uncommitted file is invisible to the commit-vs-commit diff).
- Red at planning: committed stray `src/status.ts` — `check only-named-files: 1` (`implementation/check-only-named-files-1793795672155-3497008.log`); the pre-commit form passes vacuously since the diff is commit-vs-commit, which is why D7 orders the check after the commit.
- Size: seconds. Rerun trigger: every commit on the leaf branch.

## What is not built

- No test file: standing design bars pinning the round shape; prose criteria are read by review.
- No changes to `checks`, SKILL.md or any other file.
- Image/SVG drawings: out per design.

## Human blockers / env

None. `env_names: []`, `akrogon status` shows no `Missing:` lines; the design names no credentials, grants or produces.
