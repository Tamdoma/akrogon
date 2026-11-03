# Leaf drafts review (implementer read)

You are a consultant seat (letter in the one-line prompt). Work alone. Edit no file except your return file. Do not contact the operator. Read-only commands only; do not send text to any terminal except the final line.

The operator approved this split: herdr-setup issue `right-panel` (leaves panel-top-bar, files-panel, changes-panel, needs-you-panel, spaces-scroll) and akrogon issue `tasks-board` (leaves status-json, tasks-mod, tasks-mod blocked by status-json). Drafts:

- /home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/slots/drafts/herdr-setup/right-panel/
- /home/ivan/Work/infra/akrogon/issues/chart/tasks-panel/slots/drafts/akrogon/tasks-board/

Each leaf has brief.md, design.md, readiness.yaml, state.yaml. Contract rules: /home/ivan/.akrogon/current/skills/chart-issues/assets/shapes.md ("Leaf files", "Preflight and validation") and standing-design.md beside it. Decisions: the fork files in /home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/forks/ and /home/ivan/Work/infra/akrogon/issues/chart/tasks-panel/forks/, the final shapes in herdr-panels/slots/*-final.md, probes in herdr-panels/INTAKE.md "Probes". Needs-you fixtures: herdr-panels/slots/fixtures/needs-you/. Code: /home/ivan/Work/infra/herdr-setup (registered; checks in issues/config.yaml), /home/ivan/Work/infra/akrogon/src, shipped mods in ~/.config/herdr-app/mods, API in ~/.config/herdr-app/herdr.d.ts and gpui-kit.d.ts.

Read every draft as the implementer who must make it pass. Return only disagreements, each with evidence (path:line or a command you ran): a done-criterion that cannot pass within the leaf's ownership or needs machinery the destination lacks; a criterion naming a test file, assertion or count; a cross-leaf promise with no owner; a binding decision missing or contradicted; a shared interface that differs between leaves; an API or command that does not exist; a missing dependency; anything an implementer would have to guess. If none for a leaf, say "No disagreement" for it.

Write to exactly: /home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/slots/drafts-review-<YOUR LETTER>.md

Then, as your last action, run exactly (with your letter):
hc send t15 "done <YOUR LETTER>: /home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/slots/drafts-review-<YOUR LETTER>.md"
