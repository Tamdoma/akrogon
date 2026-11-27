# Opening map brief, slot B (chart unblocked-runs)

You are a consultant on a chart door in the akrogon repo (/home/ivan/Work/infra/akrogon). Map the territory independently. Do not read any other slot's files under /home/ivan/Work/infra/akrogon/issues/chart/unblocked-runs/slots/ except this brief.

## Task

Read the intake and the live surfaces, then write a territory map for the three handed reports: the material forks (questions whose answer changes what gets built), the options for each with what each could break or invite later, practitioner questions, and pitfalls over the work's lifetime. Ground every claim in an inspected file:line or a named outside source with date. Also propose the leaf split (which outcomes are separate leaves, which bundle) and name any fork you think is already settled by evidence.

## Permitted context

- Intake (operator words and the three reports verbatim): /home/ivan/Work/infra/akrogon/issues/chart/unblocked-runs/INTAKE.md
- Lock (operator decision, taken, not to be re-asked; chart around it): /home/ivan/Work/infra/akrogon/issues/chart/unblocked-runs/forks/approval-decision.md
- Session signposts (answered by A under full autopilot): /home/ivan/Work/infra/akrogon/issues/chart/unblocked-runs/forks/signposts.md. Summary: less code and fewer moving parts first; remove or reuse rather than add; fewest leaves that stay checkable; paid harness runs only when no free proof exists; fix the whole named bug class, no wider.
- Live surfaces: src/direct.ts (probeExactlyOne, directCommand, directLeafPath), src/hc.ts (sessions, terminal, probeTerminal, repoSpace, hcEnv), src/state.ts (slugLeafFolders, readInventory and other walks over issues/open and issues/closed), src/akrogon.ts (seat and notice cases), src/seat.ts (how seats launch per harness), ~/.akrogon/config.yaml (harness recipes), skills/implement-issue/, skills/check-issue/, skills/plan-issue/, skills/chart-issues/lifecycle-rules.md (the shared seat rules file), docs/reference-index.md, src/AREA.md, learnings/LESSONS.md.
- For #161 also: how each harness (claude, codex, pi, agy) behaves when an agent's command would need approval under the recipes' auto flags. Name primary docs or source you found, or the searches that found nothing.

## Reading rule

Read process text by named section for the step you are answering: locate the section before reading it, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once per session. A section you have not read, content that changed since you read it, and content lost to compaction stay readable, and the full source stays allowed when the source is the subject of the work. Name sections, never line ranges, when citing process text. Code files are evidence and may be read as needed.

## Return

Write your map to exactly: /home/ivan/Work/infra/akrogon/issues/chart/unblocked-runs/slots/map-B.md

Then run: hc send t126 "done B: /home/ivan/Work/infra/akrogon/issues/chart/unblocked-runs/slots/map-B.md"

Do not edit any other file.
