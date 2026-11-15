# Implementation report: door-step-files

Base: `81c6bc83` (origin/main at refresh). Committed head: `5a289acf`. Refresh record: branch rebased `6a105a35` → onto `81c6bc83` at pass start (prior base c3e368c7, prior head c3e368c7+test commit).

## Changed files and reasons

- `skills/chart-issues/SKILL.md` — three cuts per plan D1–D3: Direct route keeps intro, refusal list, route question; Autopilot keeps the three-mode definition, the start rule and the mode-record read rule; Handover keeps the trigger and the fresh-A check. Each kept heading ends with a read directive naming its step file. Four internal citations repointed to step files (D5); one sentence in the fresh-A check reworded per D4 so the resume entry follows the session's mode instead of always `continue attended`.
- `skills/chart-issues/assets/direct-route.md` (new) — protocol steps 1–5, repair bound, growth stop, continuations, no-new-attempt rule, verbatim from the old `## Direct route`.
- `skills/chart-issues/assets/autopilot.md` (new) — self-answer behavior, first-reply contents, waits/parks, new-chart proposal, lifecycle-route/drain/seed/held rules, consultant drops, mode end and off-transition, CHART.md record and pass-end lines, and the two autopilot handover paragraphs (D4 placement).
- `skills/chart-issues/assets/handover.md` (new) — old-A entry append, folder creation, door-reset launch and start-prompt construction, helper behavior, operator-input cancellation, harness support.
- `skills/chart-issues/assets/questions.md` — two `SKILL.md` `## Autopilot` cites → `autopilot.md` (worker U2, a4f7e9b8).
- `skills/chart-issues/assets/shapes.md` — `SKILL.md` `## Handover` cite → `handover.md`; `SKILL.md` `## Autopilot` cite → `autopilot.md` (worker U2, a4f7e9b8).
- `skills/AREA.md` — Key files line names the three step files among the door's assets (worker U3, 6a9e5ca3).
- `docs/reference/files.md` — `[skill's Handover section](SKILL.md#handover)` → `../../skills/chart-issues/assets/handover.md` (worker U3, 6a9e5ca3).
- `tests/docs-links.test.ts` — planned edit committed at planning (6a105a35): the known-red literal test reads `assets/direct-route.md`; the pack-literal test reads `SKILL.md` + `assets/direct-route.md`. Trailer `Test-Change` present.

Worker commits cherry-picked serially: f2cda28a (U1), a4f7e9b8 (U2), 6a9e5ca3 (U3); changed-tests command green after each pick (check lines below). A repair commit 5a289acf moved the autopilot self-answer sentences out of `SKILL.md` `## Autopilot` into `autopilot.md` — the design assigns them to the step file; U1's read of the brief kept them. Worker worktrees `door-step-files-u{1,2,3}` removed.

## Commands run

- `check u1-docs-links: 0 implementation/check-u1-docs-links-1794393893221-2752494.log` (worker; 11 pass)
- `check u2-docs-links: 0 implementation/check-u2-docs-links-1794393833365-2448323.log` (worker; filtered link test green)
- `check u3-docs-links: 1 implementation/check-u3-docs-links-1794393832585-2447338.log` (worker; sole break expected-missing `assets/handover.md` before U1 landed)
- `check changed-tests-after-u1: 0 implementation/check-changed-tests-after-u1-1794393903592-2763214.log`
- `check changed-tests-after-u2: 0 implementation/check-changed-tests-after-u2-1794393905476-2767509.log`
- `check changed-tests-after-u3: 0 implementation/check-changed-tests-after-u3-1794393906832-2769039.log`
- `check changed-tests-after-a-fix: 0 implementation/check-changed-tests-after-a-fix-1794393937127-2899344.log`
- `verify leaf 5a289acfaf818debe097a2b2ed63dddf8a35e4fc: green` — setup `check-setup-1794393946718-2952569.log`, format `check-format-1794393950206-2952569.log` (prettier clean), typecheck `check-typecheck-1794393953634-2952569.log` (tsc clean), `verify test: 0 check-test-1794394042059-2952569.log` (1163 pass, 0 fail, 82 files, ~60 s). All logs under this folder.

## Clause table (criterion 2)

Old place = `skills/chart-issues/SKILL.md` section at base `81c6bc83`; new place on head `5a289acf`.

### `## Direct route`

| Old place | New place |
|---|---|
| Intro paragraph ("The direct route is a second ending…") | SKILL.md `## Direct route`, unchanged |
| Refusal intro + six bullets | SKILL.md `## Direct route`, unchanged |
| Route-question paragraph (`Route:` record, push authority) | SKILL.md `## Direct route`, unchanged |
| "Protocol, using the shapes in shapes.md:" + steps 1–5 (incl. known-red rule copy, `akrogon pack <chart>` at step 9) | `assets/direct-route.md` |
| "Repair bound: …" paragraph | `assets/direct-route.md` |
| "Growth stop: …" + Continuations bullets (incl. `akrogon pack <chart>` at abandon) | `assets/direct-route.md` |
| "No new direct attempt starts…" rule | `assets/direct-route.md` |
| — (added) | `SKILL.md` `## Direct route` read directive |

### `## Autopilot`

| Old place | New place |
|---|---|
| Mode-def sentences (session lifetime, three modes, delegate-only clarification, ask-which-mode) | SKILL.md `## Autopilot`, unchanged |
| Self-answer behavior, recommendation naming, pick recording, questions.md exception | `assets/autopilot.md` (first body paragraph) |
| Start rule ("starts only from the operator's words… Outside hc…") | SKILL.md `## Autopilot`, unchanged |
| First-reply echo, needs-sheet preview, INTAKE words, mode line, mid-chart switch-on, signposts presented, full-autopilot picks | `assets/autopilot.md` |
| Waits/parks paragraph + late-find notice + never-extends rules | `assets/autopilot.md` |
| New-chart proposal protocol | `assets/autopilot.md` |
| Lifecycle route, drain handed list, seed matches, held-work detection | `assets/autopilot.md` |
| Consultant drop rules | `assets/autopilot.md` |
| Mode ends, stays on across waits, operator's words end it | `assets/autopilot.md` |
| Mode-record append + "reads the latest entry before continuing" + resume consequences | SKILL.md `## Autopilot`, unchanged |
| "Once off, an open peer turn is collected first…" | `assets/autopilot.md` |
| CHART.md records + pass-end lines + footer wording | `assets/autopilot.md` |
| Autopilot handover entry (`handed <remaining list>`, folder contents, `continue autopilot` resume) | `assets/autopilot.md` |
| seats.yaml deferral paragraph | `assets/autopilot.md` |
| — (added) | `SKILL.md` `## Autopilot` read directive |

### `## Handover`

| Old place | New place |
|---|---|
| Trigger paragraph (what a handover is, when it fires, never-list) | SKILL.md `## Handover`, unchanged |
| Old-A paragraph (entry append, next-chart folder, door-reset launch, start prompt) | `assets/handover.md` |
| Helper paragraph (waits, keys, stages, no-confirm) | `assets/handover.md` |
| Fresh-A check paragraph | SKILL.md `## Handover`; one sentence changed per D4: "Its resume entry follows the session's mode: an attended session appends `continue attended (handover <time>)`, and a session whose mode record shows autopilot appends the autopilot resume entry per autopilot.md." |
| Operator-input cancellation paragraph | `assets/handover.md` |
| Harness support + stated limits paragraph | `assets/handover.md` |
| — (added) | `SKILL.md` `## Handover` read directive |

## Criteria evidence

1. **Step detail read when the step arrives** — directives in `SKILL.md` name each file at its point (direct route chosen / mode autopilot / Drain move-on to named chart); link test green proves each named file opens (`check changed-tests-after-a-fix: 0`). Review follows the table above.
2. **No rule lost** — table above covers every clause of the three sections; verified by sentence-level audit of base text vs head across the four files (six deltas, all legitimate repoints or the D4 sentence).
3. **Pre-step content present** — `SKILL.md` holds the refusal list + route question, the three-mode definition + start rule + mode-record read rule, and the start-prompt check. Spot: `grep -n 'route question\|full autopilot\|Any session that receives\|reads the latest entry' skills/chart-issues/SKILL.md` hits at lines 102–127.
4. **Citations still land** — `## Direct route`/`## Autopilot`/`## Handover` headings retained; repoints per D5 applied in `questions.md`, `shapes.md`, `docs/reference/files.md`, `SKILL.md`; link test green.
5. **Command literals findable and exact** — `verify --holder <chart>/direct --known-red` in `assets/direct-route.md`; `akrogon pack <chart>` ≥3 across SKILL.md (1) + direct-route.md (2); tests green (`check changed-tests-after-a-fix: 0`); link check accepts all four files (same run).
6. **Fewer words** — `wc -w` before: `SKILL.md` 8,387 (base `81c6bc83`). After: `SKILL.md` 5,412; `direct-route.md` 1,055; `autopilot.md` 1,476; `handover.md` 531 (sum 8,474, +87 of directives/preambles/links). A manual lifecycle-handing-off session loads 5,412 vs 8,387 (−35.5%).
7. **AREA.md and docs** — AREA.md names the three files. Docs audit (`grep -rn 'chart-issues' docs/ README.md`, `grep -rn 'SKILL.md#' docs/`): only `docs/reference/files.md` named a moved rule's place — repointed; every other page links the skill or describes behavior without naming a rule's place: `docs/use/quick-fix.md`, `docs/use/autopilot.md`, `docs/use/plan-work.md`, `docs/use/a-working-day.md`, `docs/examples/*.md`, `docs/reference/{words,skills,limits,config,state-and-phases,where-things-go}.md`, `docs/start/*.md`, `docs/README.md`.

## Known limitations

- A running door keeps the text it loaded; the new layout reaches doors at the next release link (design: stated limit).
- Citations as code spans (`` `autopilot.md` `` in questions.md/shapes.md) are not link-checked; the four repoints were applied by list and verified in the diff.
- Unverified criteria: none.
