# Final-shape check: shell-sweep, slot D

You are slot D. Read /home/ivan/Work/infra/akrogon/issues/chart/seat-turn-idle/forks/shell-sweep.md section "Taken" (A's autopilot pick) and /home/ivan/Work/infra/akrogon/issues/chart/seat-turn-idle/forks/seed-decision.md section "Findings" item F1. These corrections were made at the pick, beyond the merged notes:

- K1 Q1: SIGKILL with no wait under the global lock (replaces TERM, wait, KILL).
- K2 Q2: roots are scope shells whose parent is the harness pid or a pid outside the seat scope. Subtrees holding a live run-check process are spared. The sweep is never skipped as a whole.
- K3 Q3: two evidence shapes. Parked: pid null, reason set and not spawn_pending. Spawned: foreground.name a shell and argv[0] not systemd-run. terminalSchema gains argv, reason and foreground.name. The predicate is used only in dispatchSlot's lost branch.
- K4: keep-off rejected because herdr-app turns keep on when it adopts a terminal into a tab (~/.config/herdr-app/AGENTS.md, terminal panes section).

Run one focused check: does any of K1 to K4 break a mechanism or contract in akrogon or hc as they exist? Cite file:function or a probe with its date for each defect. Do not reopen the picks themselves; dissent on the picks is already recorded. Answer "no defect" if none.

Rules: read only; change no file except your return file; no paid model launch; kill nothing you did not start. Reading rule: read process text by named section; locate the section first, batch reads, bound output, read held content at most once; unread, changed or compacted content stays readable; name sections, never line ranges.

Write /home/ivan/Work/infra/akrogon/issues/chart/seat-turn-idle/slots/fork-shell-sweep-final-check-D.md, then run:

hc send t126 "done D: /home/ivan/Work/infra/akrogon/issues/chart/seat-turn-idle/slots/fork-shell-sweep-final-check-D.md"
