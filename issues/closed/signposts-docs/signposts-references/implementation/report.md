# Report: signposts-references

Serial-solo run (every wave held one unit). Base `bfca777d`, head `8c47e1e1`. No refresh needed: origin/main was already the branch base at pass start, tree clean.

## Commits

- `1dd486de` docs: chart folder layout, TAKEN count and mode-aware wordings (U1: files.md, words.md, limits.md, commands.md, skills.md)
- `8c47e1e1` docs: signposts round detail, autopilot record lines and chart-issues index (U2: why-it-works.md, what-it-is.md, plan-work.md, autopilot.md, ways-to-run.svg, skills/AREA.md)

## What landed, per decision

- D1 files.md `chart/<chart>/` row: full folder list (`CHART.md`, `INTAKE.md`, `seats.yaml`, `USAGE.md`, `forks/` with `signposts.md` original/copy wording, `slots/`, `direct/`) plus the handover entry's signposts path with a `#handover` link into the skill. Source column gains shapes.md.
- D2 plan-work.md: "Open a chart" states the first reply names mode and signposts answerer, and `forks/signposts.md` is the session record. "Set the signposts" now carries missed-angles exchange, light round shape (4–7 questions, 2–3 choices, recommendation, what it steers, no research line), the prioritize/give-up account, session lifetime and resume rule, original-plus-copies, correction/conflict handling, signposts ordering/drops, and the per-mode unanswered rule, ending with a link to the skill.
- D3 autopilot.md: mid-chart switch-on asks signposts first; the round is presented and answered once, not a chart wait; full autopilot may order but never drop (a would-be drop is recorded); waits move on to the next chart not waiting in the signposts order; `## Autopilot` `signposts:` line names who answered and the chart holding the original.
- D4 mode-aware pages: words.md "Chart door"/"Fork", limits.md two bullets, why-it-works.md contract sentence, what-it-is.md steps and Chart entry now link `docs/use/autopilot.md` for who answers per mode. limits.md keeps locally that approvals stay the operator's in every mode.
- D5: commands.md `akrogon status` row gains the TAKEN clause matching `chartRow` (every `forks/*.md` with non-empty `## Taken`, signposts included); skills.md chart-issues Result names the signposts round and three modes; ways-to-run.svg autopilot label is `A answers the forks` (19 chars, same box and text node); skills/AREA.md "Key files" gains the chart-issues line naming `SKILL.md` and `assets/`.

## Commands run

- `akrogon run-check --name docs-links -- bun test tests/docs-links.test.ts` → exit 0, 8 pass (criterion 6, links/anchors). Log: `implementation/check-docs-links-1793796720947-921400.log`.
- `akrogon run-check --name diff-scope -- git --no-pager diff --name-only "$AKROGON_BASE"...HEAD` → exit 0; lists exactly the 11 files named in What, no `src/`, `tests/` or `issues/` (criterion 6, scope). Log: `implementation/check-diff-scope-1793796721042-921581.log`.
- `akrogon verify` → green on `8c47e1e1`: format, typecheck and `bun test` (1309 pass, 0 fail). Log: `implementation/check-test-1793796802169-921783.log`.

## Criterion proof map

- C1–C5 (prose/SVG facts): verified by reading each diff hunk against the source of truth (`skills/chart-issues/SKILL.md` Open/Drain/Autopilot/Handover, `assets/shapes.md` Chart records, `assets/questions.md` signposts paragraph, `src/status.ts` `chartRow`). No mechanical check exists for prose truth — review reads the same pages.
- C6: links green (docs-links log above); scope diff green (diff-scope log above).

## Known limitations / unverified criteria

- The SVG label bound (≤ ~30 chars in its box) is verified by inspection only: `A answers the forks` is 19 chars at the same 14 px font beside 26–27-char neighbours. No rendered screenshot was taken.
- `docs/pictures/chart-door.svg` still says "you answer" forks (line 65) — excluded by the locked design; its caption already states the signposts order.

No missing env, no grants used, no live or paid operations, no worker worktrees. Wall times: docs-links ~0.1s, diff-scope ~0s, verify ~73s.
