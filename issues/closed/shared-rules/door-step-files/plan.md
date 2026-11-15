# Plan: door-step-files

Move the Direct route, Autopilot and Handover detail of `skills/chart-issues/SKILL.md` into three step files under `skills/chart-issues/assets/`, keep what each door path needs before its step arrives, and repoint every citation of a moved rule. Prerequisite `skill-links-in-folder` is merged (HEAD = main tip c3e368c7): the link test in `tests/docs-links.test.ts` already reads every tracked `.md` under `skills/` with a per-folder bound, so the new files are checked once committed.

## Decisions

- D1 — `## Direct route` cut. `SKILL.md` keeps: the intro paragraph (what the route is, `## Autopilot`-related refusal context), the refusal bullet list, the route-question paragraph with the `Route:` record rule, and a directive "the door reads `assets/direct-route.md` when the direct route is chosen". Moves to `assets/direct-route.md`: the numbered Protocol, the repair bound, the growth stop, both continuations, and the no-new-attempt rule. The door's fourth copy of the red-check rule moves with the protocol unchanged in meaning and command form (locked Q1).
- D2 — `## Autopilot` cut. `SKILL.md` keeps: the three-mode definition including the delegate-signposts-only clarification and the ask-which-mode rule; the start rule ("starts only from the operator's words in the door's own terminal… Outside hc the door says autopilot cannot start"); the mode-record read rule with its resume consequences ("the door reads the latest entry before continuing: the same A transcript path continues… starts attended until the operator says 'continue autopilot'"); and a directive "the door reads `assets/autopilot.md` when the session's mode is autopilot or full autopilot". Moves to `assets/autopilot.md`: self-answer behavior and recording, first-reply contents, handed-chart waits and parks, the new-chart proposal protocol, consultant drops, the mode-end condition, the off-transition peer collection, CHART.md record and pass-end rules.
- D3 — `## Handover` cut. `SKILL.md` keeps: the trigger paragraph (what a handover is and when it fires); the "Any session that receives a start prompt" check paragraph; and a directive "the door reads `assets/handover.md` when Drain moves on to a named next chart". Moves to `assets/handover.md`: old A's entry append and next-chart folder creation, the detached `door-reset.ts` launch and start-prompt construction, the helper's stage behavior, operator-input cancellation, harness support and stated limits.
- D4 — Open for the plan, answered: the Autopilot section's own handover paragraphs (lines ~153–155: the handed-list entry, autopilot folder contents, `continue autopilot (handover <time>)` resume entry; the `seats.yaml` deferral) live in `assets/autopilot.md`. An attended switch never needs them; every session under autopilot already opens `autopilot.md` because its mode is on (old A read it at session start, fresh A reads it on entry when the mode record shows autopilot). `handover.md` stays attended-only. Consequence the implementer must honor: the kept fresh-A check must not instruct an autopilot session to write `continue attended`; the resume entry follows the session's mode, with the autopilot form findable in `assets/autopilot.md`.
- D5 — Citation repoints (a citation of a moved rule names the step file; a citation of a staying rule keeps `## <section>`):
  - `SKILL.md` Open first reply "follows `## Autopilot` for its other contents" → names `assets/autopilot.md` (the first-reply contents move).
  - `SKILL.md` signposts paragraph "who answers it in `## Autopilot`" → unchanged (the mode definition stays).
  - `SKILL.md` Drain "per `## Autopilot`" (autopilot drain behavior) → `assets/autopilot.md`; "per `## Handover`" (entry append + reset) → `assets/handover.md`.
  - `SKILL.md` Handoff "answered by A itself per `## Autopilot`" → `assets/autopilot.md`; "the route question or the one-line refusal from `## Direct route`" → unchanged (stays); refusal bullet "under autopilot (`## Autopilot`)" → unchanged (concept cite); line 10 `(## Autopilot)` → unchanged.
  - Inside moved text: `## Autopilot`'s handover paragraphs' "per `## Handover`" → `assets/handover.md`; other in-section `## Autopilot`/`## Handover` cites repoint to their step files where the cited rule moved, or stay where it stayed (e.g. the CHART.md `## Autopilot` section reference is a chart record section per shapes.md, not a self-cite — unchanged).
  - `assets/questions.md` both `SKILL.md` `## Autopilot` cites (autopilot pick exception line 39; consultant-drop rule line 62) → `assets/autopilot.md`. `../SKILL.md#open` unchanged.
  - `assets/shapes.md` line 95 `SKILL.md` `## Handover` cite → `assets/handover.md`; line 384 `SKILL.md` `## Autopilot` cite → `assets/autopilot.md`.
  - `docs/reference/files.md` `[skill's Handover section](../../skills/chart-issues/SKILL.md#handover)` → the step file `../../skills/chart-issues/assets/handover.md` (anchor `#handover` stops being where the procedure lives).
  - `scripts/door-reset.ts` comment and prompt naming SKILL.md: unchanged (design excludes it; the prompt names SKILL.md deliberately).
  - Citation style inside step files and for moved rules: `[<name>](assets/<name>.md)` link form in `SKILL.md`, sibling-relative `(<name>.md)` inside `assets/` files; all links stay inside `skills/chart-issues/` for the folder bound.
- D6 — Step file shape: each opens with `# <title>` and a one-line "read when" preamble, matching `assets/questions.md`/`shapes.md` convention, and carries the links its readers need (`shapes.md`, `questions.md`, `SKILL.md`, `lesson-rule.md` where its text cites them) — all inside `skills/chart-issues/`.
- D7 — Test edits only, no new test: in `tests/docs-links.test.ts`, `chart-issues direct landing names the known-red command` reads `skills/chart-issues/assets/direct-route.md`; `chart-issues skill names akrogon pack at every end-marker site` reads the union of `SKILL.md` and `assets/direct-route.md` (marker words and ≥3 backticked `akrogon pack <chart>` literals live across both after the move). Committed at planning with a `Test-Change: tests/docs-links.test.ts` trailer citing done-criterion 5 (literals move into the step file).
- D8 — Report clause table: `implementation/report.md` holds one row per clause (sentence/rule) of the three sections, old place → new place, covering every clause; the review follows it along the brief's six reading paths plus compaction resume.

## Read-first

- `skills/chart-issues/SKILL.md` (worktree) — the three sections and every internal citation.
- `skills/chart-issues/assets/questions.md`, `assets/shapes.md`, `assets/standing-design.md` — citing files and style convention.
- `skills/chart-issues/scripts/door-reset.ts` — names "chart-issues SKILL.md, Handover" in a comment; unchanged.
- `tests/docs-links.test.ts` — the two command-literal tests and the link check.
- `skills/AREA.md` — door assets listing to update.
- `docs/reference/files.md` — the one docs page stating a moved rule's place.
- `docs/use/quick-fix.md`, `docs/use/autopilot.md`, `docs/use/plan-work.md`, `docs/examples/*`, `docs/reference/{words,skills,limits,config}.md` — link the skill but name no moved rule's place; checked and unchanged (report lists each match).
- `issues/chart/shared-rules/forks/shape.md` — findings O3/O4 (link coverage, installed-folder reach), leaf review corrections.
- `learnings/LESSONS.md` — `2026-09-11-lock-vs-criterion` (check criteria against verbatim copied text) and `2026-09-14-ambiguous-prose-after-rename` (sweep prose for old terms, not only old paths): the repoint list in D5 covers both.
- `skills/lesson-rule.md` — shared rule; links inside step files use in-folder names.

## Interfaces

- New files: `skills/chart-issues/assets/direct-route.md`, `assets/autopilot.md`, `assets/handover.md`.
- Kept anchors: `## Direct route`, `## Autopilot`, `## Handover` in `SKILL.md` (existing `SKILL.md` `## <section>` cites still land; `../SKILL.md#open` untouched).
- Command literals: `verify --holder <chart>/direct --known-red` (moves into `direct-route.md`); `akrogon pack <chart>` at the three end-marker sites (one stays in `SKILL.md` Handoff, two move into `direct-route.md`).
- Handover start prompt still names `<absolute skill folder>/SKILL.md`; `door-reset.ts` untouched.

## Checklist (waves)

### Wave 1 — three independent units, disjoint paths, no shared test resource, no inter-unit dependency

- U1 — owns `skills/chart-issues/SKILL.md`, `skills/chart-issues/assets/direct-route.md`, `skills/chart-issues/assets/autopilot.md`, `skills/chart-issues/assets/handover.md`. Perform the three cuts per D1–D4 with per-clause preservation, write the three step files per D6, repoint the `SKILL.md` cites per D5, keep `wc -w` notes for criterion 6.
- U2 — owns `skills/chart-issues/assets/questions.md`, `skills/chart-issues/assets/shapes.md`. Apply the four repoints in D5, nothing else.
- U3 — owns `skills/AREA.md`, `docs/reference/files.md`. Name the three new files among the door's assets in AREA.md; repoint the Handover link in files.md per D5.

A owns `implementation/report.md` after the waves: the clause table (D8), `wc -w` before/after numbers, docs-match list, and criteria evidence.

Docs checklist: `skills/chart-issues/SKILL.md` (U1); `assets/questions.md`, `assets/shapes.md` (U2); `skills/AREA.md`, `docs/reference/files.md` (U3); `tests/docs-links.test.ts` (planned edit, committed below). `door-reset.ts`, `standing-design.md`, `lesson-rule.md`, all other `docs/` pages: unaffected.

## Criteria → observations

- C1 (step detail read when the step arrives; SKILL.md names each file at its point): judged by review along the diff and D5. Supporting observation: link test green proves each named file exists and opens (`bun test tests/docs-links.test.ts`). Size: minutes. Rerun: re-review whenever the four door files or the table change; the link test reruns on any markdown change under `skills/`.
- C2 (no rule lost; clause table followed on the six reading paths): judged by review from `implementation/report.md`'s table plus `git diff` of the door files. Size: minutes. Rerun: re-review on diff change.
- C3 (kept pre-step content): review + spot greps of `SKILL.md` for refusal list, route question, three-mode def, mode-record rule, start-prompt check (`grep -n 'route question\|full autopilot\|Any session that receives\|reads the latest entry' skills/chart-issues/SKILL.md`). Size: seconds. Rerun: on `SKILL.md` change.
- C4 (every citing place lands): link test covers markdown links; kept `##` headings keep plain-text cites landing; repoint list D5 verified by review. Observation: `bun test tests/docs-links.test.ts`. Size: seconds. Rerun: on markdown change under `skills/` or `docs/`.
- C5 (command literals findable and exact; link check accepts SKILL.md + three files): `bun test tests/docs-links.test.ts` — the two literal tests and the whole-skills link check. Size: seconds. Rerun: on change to the four files or the test.
- C6 (fewer words loaded): `wc -w skills/chart-issues/SKILL.md skills/chart-issues/assets/{direct-route,autopilot,handover}.md` before and after, recorded in report.md. Baseline: SKILL.md 8,387 (a33d967b); removed ≈3,761 − kept stubs. Size: seconds. Rerun: on file change.
- C7 (AREA.md names files; docs repointed): `grep -n 'direct-route\|autopilot\|handover' skills/AREA.md`; `grep -rn 'SKILL.md#\|chart-issues' docs/` audited in report.md with each match listed. Size: seconds. Rerun: on docs change.

## Checked conditions (breakable conditions of the criteria vs decisions)

- C4/C5 "links resolve, folder bound holds": the link test is the case. Shown red at planning by temporary edit (below): a `SKILL.md` link to `assets/direct-route.md` before the file exists reports `missing file` — same violation class as a step-file link typo or a moved-target break. A step file linking outside `skills/chart-issues/` is covered by the existing bound unit test and the per-folder bound applied to every tracked file.
- C5 "literals stay exact and findable": the two edited tests fail red at planning (missing file), proving they observe the new locations.
- C1/C2/C3/C7 kept-content and clause-coverage conditions: no mechanical case exists; review judges them against the clause table (D8) — recorded here per the traced-reason clause, since a wording snapshot is rejected by standing design and a grep count cannot prove meaning preserved.

## Planned criterion test runs

- `akrogon run-check --name literal-tests-prered -- bun test tests/docs-links.test.ts -t 'chart-issues'` — intended red: both tests fail (ENOENT `assets/direct-route.md`). Output: recorded below after the run.
- `akrogon run-check --name link-check-missing-target -- bun test tests/docs-links.test.ts -t 'resolve to files and anchors'` — with a temporary `[step](assets/direct-route.md)` link in SKILL.md, reverted after. Output: recorded below after the run.

Results (recorded 2026-11-11, both intended red):

- `check literal-tests-prered: 1 /home/ivan/Work/infra/akrogon/issues/open/shared-rules/door-step-files/implementation/check-literal-tests-prered-1794393745734-2358097.log` — both tests fail: `error: ENOENT: no such file or directory, open '.../skills/chart-issues/assets/direct-route.md'`, 0 pass / 2 fail. Proves each edited test observes the new file location.
- `check link-check-missing-target: 1 /home/ivan/Work/infra/akrogon/issues/open/shared-rules/door-step-files/implementation/check-link-check-missing-target-1794393748639-2361020.log` — with a temporary `[step](assets/direct-route.md)` link in SKILL.md (reverted after the run): `broken` reported `SKILL.md: missing file assets/direct-route.md`. Proves the link check catches the missing-target violation class that a wrong file name or moved-target break would produce; post-implementation green over committed new files covers links inside them.

## Notes

- No grants, no env names, no paid or live operations. `akrogon status` shows no `Missing:` lines.
- No design/brief conflict found.
- The serial-solo/delegated question: wave 1 holds three units with disjoint owned paths and no shared fixture — delegated wave of 3 (config `implement: subagents`).
- The tests commit lands on the leaf branch before any product code, with the `Test-Change` trailer.
