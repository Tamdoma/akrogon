# Direct plan: codex-seat-scope

Task: fork forks/seat-root.md `## Taken` items 1 and 2 with their binding avoidance mechanisms. One unit, serial-solo, A implements.

1. Tests first, committed, red on base (tests/tool-entry.test.ts):
   - entry scope case s: a bash launcher through the `sh -c 'export AKROGON_SEAT_PID=$$; exec "$0" "$@"'` hop stays at the scope root, and its forked bash is placed. Case u: a marker naming another pid places. The existing case a covers an unset marker.
   - argv case: every kind carries the hop with the marker export and `exec "$0" "$@"`. systemd-run stays first after `--`.
   - new real-core case: a codex seat whose launcher is a `#!/bin/bash` script execing the stand-in. It asserts placement state (the seat at the scope root, no `t-` under tools/), not start success.
2. Code: src/seat.ts seatWrap replaces agyWrap for every kind. src/tool-cgroup.ts placementShell skips `$$ = AKROGON_SEAT_PID`. spawnHelper scrubs AKROGON_SEAT_PID.
3. Docs: src/AREA.md seat.ts and tool-cgroup.ts lines. No docs/ or skills/ text names the entry.
4. Proof: targeted run-check (typecheck, tool-entry, tool-entry-tracing, tool-kill, hc-start), then `akrogon verify --holder <chart>/direct`.
