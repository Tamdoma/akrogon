# Plan: chart-prose

Prose-only edits inside `skills/chart-issues/`. Debate is off; synthesized directly from brief and design. Line numbers are at 735cd63 and verified against the live worktree.

## Decisions

- D1 Small rounds (questions.md:27): replace the whole sentence with the design's wording — same list of parts, then "A small round keeps the parts that carry the decision, the reply key and the challenge check.", then the unchanged continuous-numbering sentence. The phrase "never cut" disappears entirely.
- D2 Corrections (shapes.md:80): replace the sentence from "A taken fork is never reopened" through "binding decision." with "Append each explicit operator correction with its date, preserve earlier answers, and treat the last appended correction as binding only for the answer it changes." Append at the paragraph's end: "A fork file with no operator answer under `## Taken` is open, and CHART.md lists none." All other sentences in the paragraph stay.
- D3 Forks open (shapes.md:26-27): delete the `## Forks open` heading and its sample line from the CHART template. `## Fog` and `## Off route` stay.
- D4 Standing block: shapes.md:142 placeholder becomes `<installed path of standing-design.md, then the current interpretation: how its rules apply to this leaf>`. standing-design.md's last line becomes "Each leaf design names this file's installed path and writes its own interpretation of these rules." The "Copy every binding decision" sentence at shapes.md:148 stays.
- D5 Write order: the sample phase line becomes `phase: plan.synthesis  # plan.positions when debate: 'yes'`. The preflight paragraph (shapes.md:166) gains "Refuse the handoff while any fork file lacks an operator answer or `## Fog` is not empty." The final paragraph (shapes.md:170) gains, before "then run `akrogon status`": "Write brief.md and design.md before state.yaml, and a prerequisite leaf's files before its dependents', because dispatch picks up any folder holding a state.yaml."

## Read-first

- `skills/chart-issues/assets/questions.md` — line 27 target.
- `skills/chart-issues/assets/shapes.md` — lines 26-27, 80, 142, 152, 166, 170.
- `skills/chart-issues/assets/standing-design.md` — last line.
- `issues/open/dead-prose/chart-prose/brief.md` and `design.md` — locked wording.

## Interfaces

File names and grep targets are literal; wording is by content, not line number. The five replacement/insertion strings are quoted verbatim in the design's Literal interfaces section — use them exactly.

## Checklist

1. questions.md:27 — swap sentence per D1. Criterion: `grep -n "never cut" skills/chart-issues/assets/questions.md` empty.
2. shapes.md:26-27 — delete `## Forks open` block per D3. Criterion: `grep -rn "Forks open" skills/chart-issues/` empty; `grep -c "^## Fog$" skills/chart-issues/assets/shapes.md` prints 1.
3. shapes.md:80 — replace sentence and append open-inventory sentence per D2. Criterion: `grep -n "binding only for the answer it changes" skills/chart-issues/assets/shapes.md` prints one line.
4. shapes.md:142 — placeholder per D4. Criterion: `grep -n "installed path" skills/chart-issues/assets/shapes.md` prints one line.
5. standing-design.md last line — per D4. Criteria: `grep -n "verbatim into each leaf design" skills/chart-issues/assets/standing-design.md` empty; `grep -n "installed path" skills/chart-issues/assets/standing-design.md` prints one line.
6. shapes.md sample phase line — add comment per D5. Criterion: `grep -n "plan.positions when debate" skills/chart-issues/assets/shapes.md` prints the sample phase line.
7. shapes.md:166 — add refusal sentence per D5.
8. shapes.md:170 — add write-order sentence per D5. Criterion: `grep -n "before state.yaml" skills/chart-issues/assets/shapes.md` prints one line.

## Verification

- All done-criteria greps above.
- `git diff origin/main --stat` lists only files under `skills/chart-issues/`.
- `bun test`, `bun run typecheck`, `bun run format` pass.

## Open limitation

Charts already written under `issues/chart/*` keep their Forks open sections and copied standing blocks; they are excluded and not retrofitted. `skills/chart-issues/SKILL.md` is untouched — its "every fork in every chart is taken" line already matches the open-inventory rule.

## Dependencies

None. lifecycle-prose shares no file.
