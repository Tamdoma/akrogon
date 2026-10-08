# Map brief for slot B (chart-issues door, opening map)

You are slot B, a charting peer. Produce your own independent territory map. Do not read any other slot's map. Do not edit repo files.

## Intake (read verbatim)
- /home/ivan/Work/infra/akrogon/issues/seeds/59-akrogon-next-should-accept-an-epic-issue.md (Tamdoma/akrogon#59)
- /home/ivan/Work/infra/akrogon/issues/seeds/60-akrogon-next-puts-a-replaced-seat-a-pane.md (Tamdoma/akrogon#60)
- /home/ivan/Work/infra/akrogon/issues/seeds/61-akrogon-has-no-per-repo-switch-to-pause.md (Tamdoma/akrogon#61)

## Live surfaces (inspect, cite file:line)
- /home/ivan/Work/infra/akrogon/src/next.ts (selectLeaves ~1167, dispatchLeaf ~593, allocate ~337, nextCommand ~1231, sweep ~710)
- /home/ivan/Work/infra/akrogon/src/park.ts, src/state.ts (missingLeafMessage), src/akrogon.ts, src/config.ts, src/turn.ts (eligibility)
- /home/ivan/Work/infra/akrogon/plugin/herdr-plugin.toml, plugin/next.sh
- /home/ivan/Work/infra/akrogon/tests/next.test.ts, tests/fake-herdr.ts
- herdr 0.9.3 CLI (`herdr pane split --help` allows right|down only; `herdr pane swap --help`)
- docs/guide/ for operator-facing docs of next/park

## Existing locks
- Repo key akrogon, `direct: false`, checks = format, test, typecheck, test_changed.
- A leaf branch may not touch `issues/`.

## Task
Write a proportional territory map covering the three reports: for each, the material forks (decisions that change the outcome), questions a practitioner would ask, pitfalls over the work's lifetime and what each option could break or invite later. Also propose how the three split into destinations/issues/leaves and any real dependency between them. Note anything in the reports you found wrong on inspection. Keep it compact.

## Return
Write your map to exactly: /tmp/claude-1000/-home-ivan-Work-infra-akrogon/f36fe13b-a2e2-4c58-9a98-340ec40a2fb9/scratchpad/door/map-B.md
