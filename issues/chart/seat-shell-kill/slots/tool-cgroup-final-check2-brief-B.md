# Second final-shape check brief, slot B: tool-cgroup (round: autopilot pick 2026-11-25, revision after check 1)

You are slot B. A folded the first final-shape checks (slots/tool-cgroup-final-check-{B,C,D}.md) into /home/ivan/Work/infra/akrogon/issues/chart/seat-shell-kill/forks/tool-cgroup.md `## Taken`. Revised lines are marked [R].

The one contract change: the caller is no longer special. Every relocated akrogon process lives in `<seat scope>/akrogon/<t-name>/`. commitMove kills each `t-` of the moved leaf now, unless its `akrogon/<t-name>` is populated. In that case it spawns at most one detached helper in `akrogon/<t-name>/helper/` that waits for the tool shell to end (absent, start time changed, or state Z/X), then kills that `t-`. The other [R] lines adopt findings from check 1 as you wrote them.

## Reading rule

Read process text by named section: locate the section before reading it and name sections, never line ranges.

## Task

One focused check of the [R] lines only. Report a defect (line, concrete failure) or a missing obligation, or write "no defect". Do not reargue earlier picks.

## Return

Write to /home/ivan/Work/infra/akrogon/issues/chart/seat-shell-kill/slots/tool-cgroup-final-check2-B.md, then run:

```bash
hc send t126 "done B: /home/ivan/Work/infra/akrogon/issues/chart/seat-shell-kill/slots/tool-cgroup-final-check2-B.md"
```
