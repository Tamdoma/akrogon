# Brief for slot B: cross-leaf kill (blind, write before reading other slots)
Write /home/ivan/Work/infra/akrogon/issues/chart/permit-bypass/slots/kill-B.md, under 50 lines, file:line or source per claim. Read-only; do not signal any process.
Question and evidence: /home/ivan/Work/infra/akrogon/issues/chart/permit-bypass/forks/cross-leaf-kill.md and slots/sweep-results.md. Taken so far: forks/guarantee.md, forks/load-guard.md.
Operator intent, verbatim: "make sure there's no clogging and everything's going fast".
1. Inspect how seats are boxed (src/scope.ts, src/run-check.ts, src/permit.ts, leaf stop path) and what a seat can already use to stop only its own runs (scope/cgroup kill, process group, run-check pid record).
2. Why did a killed test:changed leave 155 Chrome alive (process groups, detached browsers, bun --parallel/--sequential signal handling)?
3. Options: skill rule only; an akrogon command "stop my run" (scoped); run-check owns the run in its own transient scope and kills the whole scope on exit/signal; deny pkill in seat tools. What each breaks later. Your pick.
4. Which skill/protocol lines must change (implement-issue, worker-protocol, check-issue).
