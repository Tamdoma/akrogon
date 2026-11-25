# Leaf review brief, slot C: tool-cgroup-kill

You are slot C. Review the draft leaf as the implementer who must build it from these files alone.

## Reading rule

Read process text by named section: locate the section before reading it and name sections, never line ranges. Read content you already hold at most once per session.

## Inputs

- Draft: /tmp/claude-1000/-home-ivan-Work-infra-akrogon/c50ea560-71af-4450-8734-dc2cd89a61d7/scratchpad/leaf/tool-cgroup-kill/brief.md, /tmp/claude-1000/-home-ivan-Work-infra-akrogon/c50ea560-71af-4450-8734-dc2cd89a61d7/scratchpad/leaf/tool-cgroup-kill/design.md, /tmp/claude-1000/-home-ivan-Work-infra-akrogon/c50ea560-71af-4450-8734-dc2cd89a61d7/scratchpad/leaf/tool-cgroup-kill/readiness.yaml
- Its source: /home/ivan/Work/infra/akrogon/issues/chart/seat-shell-kill/forks/tool-cgroup.md (`## Taken`, `## Charting proofs`), /home/ivan/Work/infra/akrogon/issues/chart/seat-shell-kill/forks/seed-decision.md.
- Code: /home/ivan/Work/infra/akrogon/src (inspect what you need).

## Task

Return disagreements only, each with evidence (file and function, or a recorded observation) and the concrete change you want:
- a done-criterion that cannot be met within the owned surfaces, or whose proof cannot fail on the base;
- a design line that contradicts Taken or the code, or names a function that does not exist;
- a missing owned surface, consumer or `Open for the plan:` question an implementer would have to guess;
- a readiness proof that does not reach the key part it is cited for.
Write "no disagreement" if none. Do not reargue Taken picks.

## Return

Write to /home/ivan/Work/infra/akrogon/issues/chart/seat-shell-kill/slots/leaf-review-C.md, then run:

```bash
hc send t126 "done C: /home/ivan/Work/infra/akrogon/issues/chart/seat-shell-kill/slots/leaf-review-C.md"
```
