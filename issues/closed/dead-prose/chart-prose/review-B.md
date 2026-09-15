# Review B: chart-prose

Base: 735cd630afe03fe21b773aafeabdddddc88ca612
Reviewed head: f466617dfd65b2326f6d80ac856477e17ddef8c8

## Verification

- Read the full diff `git diff origin/main` — three files, all under `skills/chart-issues/`, matching the design's literal interfaces verbatim:
  - questions.md:27 replaced with the locked small-round wording; "never cut" gone.
  - shapes.md: `## Forks open` block deleted, `## Fog`/`## Off route` intact; correction sentence replaced and open-inventory sentence appended at paragraph end; placeholder now names installed path + interpretation; sample phase line carries the debate comment; preflight refusal appended; write-order sentence inserted before `akrogon status` with correct sentence boundaries ("...registered root. Write brief.md... state.yaml. Then run `akrogon status`...").
  - standing-design.md last line replaced with installed-path wording.
- All six done-criteria greps pass (worker output confirmed by my own diff read).
- `bun test` 217/0, `bun run typecheck` clean, `bun run format` clean — run by B during implement; no code changed since, no rerun needed.
- Internal consistency: the new "CHART.md lists none" rule matches the deleted template section; the preflight refusal covers both open fork files and non-empty Fog; SKILL.md:37 "every fork in every chart is taken" stays consistent with the open-inventory rule.
- No AREA.md in the diff; no tests touched (none required for prose).

## Findings

- Nit: `docs/guide/parts.html:69` still describes the chart as "forks taken, forks open, fog, off route." The design excludes `docs/` and locks the diff to `skills/chart-issues/`, so this leaf cannot fix it; recorded for the docs-owning leaf.

## Verdict

ready
