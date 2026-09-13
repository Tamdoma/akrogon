# Plan: rename-vocabulary

Debate off (`debate: "no"`); synthesized directly from brief and design.

## Decisions

- D1 — Vocabulary map. Territory, map, fog, fork, question, round, chart, off route replace the meeting words everywhere under `skills/chart-issues/`. Term mapping: a chart's `decisions/` folder and per-topic files become `forks/` and fork files; the individual split is a `question`; operator `batch` becomes `round` (handoff context becomes "handoff review"/"the handoff", never "round" — a round is defined as Q blocks plus reply key plus challenge check); `Not Yet Specified` becomes `Fog`; `Out Of Scope` becomes `Off route`; `## Resolution` becomes `## Taken`; "resolved/decided" chart prose becomes "taken". Survivors: "binding decisions" in leaf designs, plan D1…Dn, `Handed off <date>`, `slots/`, and SKILL.md's `## Decide` heading becomes `## Take` (forks are taken).
- D2 — Chart migration runs at the authoritative root `/home/ivan/Work/infra/akrogon`, not on the leaf branch. `requireCodeOnly` (src/phase.ts:124,153) rejects any `issues/` diff on the branch at check.review, so the design's "migrated on the leaf branch" cannot execute; conflict recorded for review per the brief/design rule. The worktree's tracked `issues/` copy is inert and stays untouched. The root migration covers all 10 charts: 9 tracked (`issues/chart/status-empty-open` + 8 `issues/closed/*/chart`) plus the untracked `issues/chart/charting-vocabulary` (already carries `Handed off 2026-09-13`). Commit the migrated `issues/` paths on main directly, matching the "add issues" commit precedent; leave the checkout's other dirty files alone.
- D3 — `src/status.ts`: `chartHeader` becomes `['CHART','TAKEN','FOG','STAGE','AGE']`; `chartRow` reads `forks/`, counts files matching `/^## Taken\s*\n\s*\S/m`, counts `section(markdown, 'Fog')`; stage rule unchanged (`Handed off` line, else files+fog>0 `charting`, else `empty`). No dual-format reading.
- D4 — Skill rewrite covers `SKILL.md`, `assets/questions.md`, `assets/shapes.md` only; `assets/standing-design.md` has no chart vocabulary and stays untouched. Slot exchange examples in questions.md become `fork-name-A.md`, `fork-name-B.md`, `fork-name-merged.md`, `fork-name-rebuttal-B.md`, `fork-name-final-check-B.md`. shapes.md fork-file template: `# <fork title>`, `## Question` (one or more Q blocks), `### Carries`, `## Findings`, `## Taken`; CHART.md template section order `## Destination`, `## Forks taken`, `## Forks open`, `## Fog`, `## Off route`, optional trailing `Handed off`. shapes.md must state: one fork file holds one or more questions always presented on one screen; a fork is taken when every material question is taken; a pre-handoff correction is a new fork naming the superseded one (done-criterion 3).
- D5 — Migration mechanics per chart: rename `decisions/` to `forks/` (`git mv` for tracked, plain `mv` for the untracked chart); in every CHART.md rewrite the four headings and every `decisions/` link to `forks/`; in every fork file rewrite `## Resolution` to `## Taken`; rewrite `decisions/` path references in `issues/closed/loop-hardening/chart/INTAKE.md:278`, `issues/closed/akrogon-loop/chart/decisions/multi-chart-layout.md:32`, `issues/closed/install-prune-dead-links/chart/decisions/harness-folders.md:7`, and `issues/chart/charting-vocabulary/CHART.md` links. All other body bytes identical; `slots/` files, `## Notes`, INTAKE source text and `Handed off` lines verbatim. Closed leaf `design.md` files under `issues/closed/*/<leaf>/` keep their copied `## Resolution` headings (criterion 6's grep scopes to `issues/chart` and `issues/closed/*/chart` only).
- D6 — Docs and README: reword `docs/guide/files.html:106` ("the chart and its fork files"), `docs/guide/in-practice.html:75` ("taken/total forks, fog items"), `docs/guide/create.html:58` ("a chart of forks you take one by one"), README.md:54 chart-issues row ("into forks and leaf contracts"). Keep "decisions" at files.html:99, files.html:102 and create.html:63 — leaf-design context, allowed by criterion 7.
- D7 — Verification: `bun test`, `bun run typecheck`, `bun run format` in the worktree; the three greps from criteria 2/6/7; end-to-end `cd /home/ivan/Work/infra/akrogon && bun issues/worktrees/rename-vocabulary/src/akrogon.ts status --charts` after the root migration — the installed `akrogon` symlink runs the root's old code until merge, so the worktree entrypoint exercises the new `chartRow` against the real migrated charts. Expected: header `CHART  TAKEN  FOG  STAGE  AGE`, `status-empty-open  1/1  0  handed off`, `charting-vocabulary  5/5  0  handed off`.

## Read-first

- `issues/open/charting-vocabulary/rename-vocabulary/brief.md`, `design.md` (authoritative root)
- `skills/chart-issues/SKILL.md`, `assets/questions.md`, `assets/shapes.md`, `assets/standing-design.md`
- `src/status.ts:216-265` (chartHeader, section, chartRow, chartRows)
- `tests/status.test.ts:460-485` (chart fixture test)
- `docs/guide/files.html:106`, `in-practice.html:75`, `create.html:58`, `README.md:54`
- Root charts: `/home/ivan/Work/infra/akrogon/issues/chart/{status-empty-open,charting-vocabulary}/`, `/home/ivan/Work/infra/akrogon/issues/closed/*/chart/`
- `src/phase.ts:148-160` (requireClean, requireCodeOnly)

## Ordered checklist

1. Rewrite `skills/chart-issues/SKILL.md`, `assets/questions.md`, `assets/shapes.md` in the new vocabulary (D1, D4). Criterion: `grep -rniE "decision|batch|not yet specified|out of scope" skills/chart-issues/` matches only binding-decisions-in-leaf-designs lines.
2. Update `src/status.ts` chartHeader + chartRow (D3) and `tests/status.test.ts:460-485` fixtures (`forks/`, `## Forks taken`, `## Fog`, `## Taken`, test name). Criterion: `bun test` and `bun run typecheck` pass.
3. Reword the three docs lines and README row (D6). Criterion: `grep -niE "decision|unspecified" docs/guide/files.html docs/guide/in-practice.html docs/guide/create.html` matches only the design.md locked-decisions row.
4. Migrate all 10 charts at the root (D2, D5), then commit `issues/` paths on main. Criterion: at root, `find issues/chart issues/closed -type d -name decisions` prints nothing and `grep -rlE "^## (Decisions So Far|Open Decisions|Not Yet Specified|Out Of Scope|Resolution)" issues/chart issues/closed/*/chart` prints nothing.
5. Run the end-to-end status check (D7) and save output as the artifact. Criterion: header TAKEN/FOG, `status-empty-open` 1/1, `charting-vocabulary` 5/5, both `handed off`.
6. `bun run format`; commit leaf-branch files (skills, src, tests, docs, README) in the worktree. No `issues/` paths on the branch.

## Acceptance criteria

Mirror brief done-criteria 1-7; criterion 5 is verified through the worktree entrypoint against the root store (D7) and again by the installed command after merge.

## Risks and open limitation

- R1 — The root checkout carries uncommitted work overlapping this leaf's files (`src/status.ts`, `tests/status.test.ts`, `skills/chart-issues/*`, `src/phase.ts`, `src/next.ts`, `config.yaml`). The leaf merge will hit "local changes would be overwritten" until that work lands; outside this leaf's control.
- R2 — Committing the migrated charts on main ahead of the leaf merge diverges local main from origin/main until pushed.
- Open limitation — the worktree's inert tracked `issues/` copy keeps old names; criterion 6's greps are meaningful only at the authoritative root, where the live charts are.
