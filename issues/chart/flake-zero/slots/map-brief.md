# Map brief: flake-zero (slots B and C, independent)

Read INTAKE.md and slots/flaky-list.txt in this chart folder. Repo /home/ivan/Work/infra/akrogon at origin/main 814a2387; read code there. Operator signposts for this session: simplest, native, low-maintenance; agents decide budgets; "no failures because of the budget".

Write your map with file:line evidence:
1. Group every test in flaky-list.txt (plus the intake's five) by root cause class (e.g. live host hc server or HC_TERMINAL_ID leaking in, shared user systemd units/slices, fixed sleeps or poll timeouts under load, shared temp or state paths, test order). Per group: the cause with file:line, how many tests, whether it still reproduces on main (a cheap check is fine: run the file a few times in parallel), and the smallest root fix.
2. Prevention: options to keep new or changed tests from being flaky, with what each could break or cost later. Consider what akrogon already has (`akrogon flaky`, known-red, phase test freeze) before proposing anything new. Recommend one.
3. Anything that should be a separate chart.

Do not edit code. Write slots/map-<your letter>.md.
