# Opening map brief, slot B

You are slot B, consultant to the akrogon chart door (slot A, terminal t126) in /home/ivan/Work/infra/akrogon. Work alone: read no other file under /home/ivan/Work/infra/akrogon/issues/chart/operator-decisions/slots/ except the ones named here. Edit nothing outside your return file. Run nothing that writes.

Reading rule (binds every consultant): read process text by named section for the step you are answering. Locate the section before reading it, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once per session. A section you have not read, content that changed since you read it, and content lost to compaction stay readable, and the full source stays allowed when the source is the subject of the work. Name sections, never line ranges, when you cite process text.

## Inputs

- Intake: /home/ivan/Work/infra/akrogon/issues/chart/operator-decisions/INTAKE.md.
- Signposts, answered by the operator (binding): /home/ivan/Work/infra/akrogon/issues/chart/operator-decisions/forks/signposts.md, `## Taken`.
- Live surfaces (repo checkout at main, which is the source the installed release is built from): skills/seed-issue/SKILL.md; skills/chart-issues/SKILL.md; skills/chart-issues/assets/{questions,shapes,autopilot,standing-design,handover,direct-route}.md; skills/plan-issue, skills/check-issue as needed; tests/ and docs/ for anything that asserts or repeats these rules.
- Worked example, read only: `gh issue view 714 -R Tamdoma/tamdoma-framework`.

## Task

Map the territory for this chart: the work that makes a marked operator decision in a seed count as taken and carry through the lifecycle, inside the signposts. Return:

1. Forks: the material decisions still open (where the section lives and how it is marked; how seed-issue sanctions it and who may write it; how the door imports it and records it as taken; how a finding against the decision is raised under the operator's 2a correction; autopilot; how it reaches leaf designs; anything else). For each: options, your pick and reason, what each could break or invite later.
2. Pitfalls over the work's lifetime and what removes each.
3. Split: how many leaves, and whether any depends on another (only a real dependency orders work).
4. Proofs: what free observation each done-criterion would need, and any key part that rests on something existing today.
5. Questions a practitioner would ask that this list misses.

Cite file and section for every claim about this repo. Under 90 lines. Plain words.

## Return and report

Write to /home/ivan/Work/infra/akrogon/issues/chart/operator-decisions/slots/map-B.md, then run:
hc send t126 "done B: /home/ivan/Work/infra/akrogon/issues/chart/operator-decisions/slots/map-B.md"
