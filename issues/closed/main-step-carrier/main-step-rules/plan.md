# Plan: main-step-rules

Prose-only leaf. `debate: no`, so this plan is synthesized directly from brief and design.

## Read first

- `/home/ivan/Work/infra/akrogon/issues/open/main-step-carrier/main-step-rules/brief.md` — done-criteria and owned text.
- `design.md` (same folder) — binding decisions; the framework switch is already done and out of scope.
- `skills/chart-issues/assets/shapes.md` — CHART.md template (`## Off route` :35-36), fork-rules sentence :92, completion-owner rules :286-289, `issues/` refusal :293.
- `skills/chart-issues/SKILL.md` — source-close paragraph :35, `## Handoff` section.
- `skills/init-akrogon/SKILL.md` — `## Tests and grounding` :46-55, verification sentence :82.
- `docs/guide/chart.md` — Off route paragraph :128.
- `learnings/LESSONS.md` line 12 (history/2026-09-11-stale-rule-in-docs.md) — after edits, grep `docs/` and `skills/` for `operator step on main`, `Off route`, `test_changed` and own or report each hit.
- `skills/chart-issues/assets/standing-design.md` — no vanity tests; proof is readback of owned text plus blocking `checks`.

## Decisions

- D1: A step on main that a taken chart decision needs is never recorded under Off route. When its precondition exists, the door makes it during the pass and verifies the effective result (config edits via `akrogon config` at the registered root). When the precondition can only follow a leaf's merge, it is a pending step, never an Off-route entry.
- D2: Merge-blocked waiting edits keep the GitHub identity out of `sources` of every leaf whose completion could close it (`src/phase.ts:206-224` closes the union of sources). Stated in shapes.md as an explicit exception to the one-completion-owner rule; the identity stays open, mirrored by `akrogon pull`, and the door later makes and verifies the edit and runs `akrogon close <id> --by <text>` naming what delivered it.
- D3: Unsourced charts record each waiting edit in CHART.md as a pending operator step with exact edit, owner, prerequisite leaf and proving check. Home: a `## Pending steps` section in the CHART.md template (`<none or each waiting edit: exact edit, owner, prerequisite leaf, check>`), placed next to `## Off route`.
- D4: init-akrogon proposes each check as a repo-owned entry point (a package script, or a repo file run by its native tool) when one exists, otherwise today's runner command. Existing stored entries are not migrated; the generated setup/flock/run-check wrapping stays.
- D5: A verified `checks.test_changed` is a real run against a base with changes in which a changed test was seen selected and run, or the full existing suite ran. A clean exit alone does not count. The base may be read inside the entry-point script.
- D6: One home per rule: shapes.md owns chart record rules; SKILL.md gets only what its :35 paragraph and Handoff need so they do not contradict; chart.md mirrors criteria 1-3 in guide language at :128 only. No duplicated prose.
- D7: Scope wall. No src/, tests/, issues/, framework, other skills, seed-issue, scheduling or reminder text. Only the four named files change.

## Interfaces used as-is

- `akrogon close <owner/repo#n> --by <text>` (SKILL.md:35, README.md:139).
- `akrogon config` effective output for verifying a config edit at the registered root.
- `akrogon pull` mirroring keeps a withheld identity open.
- Sources-union closing at leaf completion (src/phase.ts:206-224), the mechanism D2 routes around.

## Checklist

Wave 1 (three independent units, disjoint owned paths, no shared test resource, no ordering):

- [ ] U1 — `skills/chart-issues/assets/shapes.md` + `skills/chart-issues/SKILL.md` (D1, D2, D3):
  - shapes.md: add `## Pending steps` line to the CHART.md template beside `## Off route` (:35-36); extend the `## Off route` comment/template so a needed main step is never recorded there.
  - shapes.md :92: keep or qualify the "Ruling work out records the reason in Off route" sentence so it cannot read as permitting a needed main step under Off route.
  - shapes.md :286-289 (one-completion-owner paragraph): add the stated exception — a waiting main edit withholds the identity from `sources` of every leaf whose completion could close it; door makes and verifies the edit, then `akrogon close <id> --by <text>` naming what delivered it.
  - shapes.md :293 (`issues/` refusal): the "operator step on main" tail gets the D1/D3 distinction — door-made-and-verified during the pass when the precondition exists, otherwise a Pending-steps record, never Off route.
  - SKILL.md :35 paragraph: name the D2 exception — a delivered/duplicate close is skipped and the identity withheld from `sources` when a waiting main edit can only follow that leaf's merge; the door closes it after making and verifying the edit.
  - SKILL.md `## Handoff`: one line that the door makes and verifies a needed main step during the pass when its precondition exists, and records a merge-blocked or unsourced waiting edit per shapes.md.
- [ ] U2 — `skills/init-akrogon/SKILL.md` (D4, D5):
  - `## Tests and grounding` / proposal paragraph (:47-55 region): checks are proposed as repo-owned entry points when one exists, otherwise the runner command; no migration of stored entries; wrapping unchanged.
  - Verification sentence :82: "verified" for `test_changed` defined per D5 — changed test seen to run against a base with changes, or full suite ran; clean exit alone does not count; base may be read inside the entry-point script.
- [ ] U3 — `docs/guide/chart.md` :128 (D6): Off route paragraph states the guide-level form of D1-D3: needed main steps are never Off-route entries; merge-blocked edits keep the report out of `sources` and the door closes it after making and verifying the edit; unsourced charts list each waiting edit in CHART.md with edit, owner, prerequisite leaf and check. Keep operator-facing voice, match criteria 1-3.

Docs affected (one line each): skills/chart-issues/SKILL.md (agent), skills/chart-issues/assets/shapes.md (agent), skills/init-akrogon/SKILL.md (agent), docs/guide/chart.md (human). No other agent or human doc affected; README.md `akrogon close` row already matches D2.

## Criterion proofs

No new tests: standing-design rules prose changes have no testable boundary ("no vanity tests"). Proof is readback of the owned text against each criterion plus blocking `checks`. Baseline checks run in this pass are green.

| # | Proof | Failure it catches | Size | Rerun trigger |
|---|-------|--------------------|------|----------------|
| 1 | Read shapes.md Off-route template, shapes.md :92, :293 and SKILL.md Handoff; confirm the "never Off route / door makes and verifies" rule exists. `bun run format` via `checks.format`. | Rule absent or only implied; format drift | seconds | Any edit to the named passages |
| 2 | Read shapes.md one-completion-owner paragraph and SKILL.md :35; confirm the stated exception, withhold-from-every-closing-leaf, and `akrogon close --by` ending. | Silent reassignment allowed; missing close step | seconds | Any edit to those passages |
| 3 | Read CHART.md template `## Pending steps` and the shapes prose naming edit/owner/leaf/check. | Unsourced waiting edits have no record home | seconds | Template or rule edit |
| 4 | Read init-akrogon SKILL.md Tests/proposal text; confirm entry-point-first and no-migration statements. | Old "inline command only" prose survives | seconds | Edit to that section |
| 5 | Read init-akrogon :82 region; confirm the real-run definition and "clean exit does not count". | Stub acceptance recurs (framework case) | seconds | Edit to that sentence |
| 6 | Read chart.md :128; confirm it covers criteria 1-3 in guide language. | Guide contradicts skill | seconds | Edit to the paragraph |
| 7 | `git diff --name-only origin/main...HEAD` lists only the four owned files; no src/, tests/, issues/, config or other-skill diffs. | Scope creep into code or records | seconds | Before `akrogon phase` advance |
| all | `checks.format`, `checks.typecheck`, `checks.test` (`akrogon run-check` lines from `akrogon config`) | Markdown/format breakage; repo regressions | minutes | Every commit before implement/merge prompts |

Rerun rule: the checks commands are the blocking gate; the readback proofs re-run whenever the named passages change.

## Open limitations / blockers

None. No credentials (`env_names` empty), no external calls, no machinery needed. Held disagreement recorded in design (B wanted Tamdoma/akrogon#87 closure held until framework sync): A's resolution stands — #87 stays in this leaf's `sources` because akrogon's behavior is already switched where it reads config; the pending framework sync is a chart-recorded operator step, which is exactly the mechanism this leaf writes into the rules.
