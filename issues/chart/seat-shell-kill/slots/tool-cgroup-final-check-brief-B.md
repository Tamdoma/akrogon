# Final-shape check brief, slot B: tool-cgroup (round: autopilot pick 2026-11-25)

You are slot B. A answered the tool-cgroup round under autopilot. The proposed final shape is /home/ivan/Work/infra/akrogon/issues/chart/seat-shell-kill/forks/tool-cgroup.md section `## Taken`, with its evidence in `## Findings`.

Marked correction, the one mechanism added beyond the options you saw: **Q1 deferred caller kill**. The caller's own `t-` is not spared forever. The relocated akrogon process spawns one detached helper in `<seat scope>/akrogon/` (no systemd unit, no bus call) that waits, with no timeout, for the caller tool shell's pid plus start time to end, then writes that `t-`'s `cgroup.kill`. Everything else in Taken restates positions from the merged notes and rebuttals.

## Reading rule

Read process text by named section: locate the section before reading it and name sections, never line ranges.

## Task

One focused check of the proposed final shape. Report only:
1. A defect: a contract line that is wrong, contradicts a Finding or lock, or cannot be built as written. Give the line and the concrete failure.
2. A missing obligation the leaf needs that Taken does not state.
Write "no defect" if none. Do not reargue picks you already argued in your rebuttal.

## Return

Write to /home/ivan/Work/infra/akrogon/issues/chart/seat-shell-kill/slots/tool-cgroup-final-check-B.md, then run:

```bash
hc send t126 "done B: /home/ivan/Work/infra/akrogon/issues/chart/seat-shell-kill/slots/tool-cgroup-final-check-B.md"
```
