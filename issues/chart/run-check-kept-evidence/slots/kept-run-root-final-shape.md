# Proposed final shape: kept-run-root (A's pick, autopilot round 1)

Corrections against the merged notes are marked [changed].

1. `checkedRun` (src/run-check.ts): when the command exits nonzero and the run was not refused, write an empty `.akrogon-kept` file in the run root and skip the final `rmSync(runRoot)`. `.owner` stays as written [changed: no `.owner` removal, B D1]. A thrown error, a refusal and a zero exit behave as today.
2. `reconcile` (src/reconcile.ts) run-root loop: after the `refusal.json` check, a root holding `.akrogon-kept` is skipped with no `keep` and no `drop`, before any `.owner` read [changed: marker read before `.owner`, so a stale pid is never read]. `ownerKeeps`: a `run-*` directory holding `.akrogon-kept` returns no entry and is not recursed into, checked before its `.owner`.
3. Every `checkedRun` caller (run-check and verify), no parameter.
4. Lifetime: the leaf temp's existing release; `checkout`/`self-update` holder runs until the existing idle `dropUnowned` sweep (no timer).
5. Silent: no new stderr, status or leftovers output.
6. Docs: `docs/reference/checks.md` (private TMPDIR sentence) and `src/AREA.md` run-check and reconcile lines state that a red run's TMPDIR is kept until the leaf temp is released, a holder run's until the idle sweep [changed: AREA run-check line added, B].
7. Lessons: both LESSONS.md lines stay (killed wrapper and holder idle sweep still lose evidence; lesson rule Retire clause); rewording is /learn-issues work after landing, recorded Off route [changed: new, from B D5].
8. Tests that flip by design: tests/run-check.test.ts "... removed on success and failure" (failure half), tests/verify.test.ts "verify removes each command TMPDIR on success and failure" (failure half). Must stay green: reconcile dead-owner, young ownerless, refusal and durable-capture SIGKILL cases.

Held dissent (C): 2 non-empty only, 3 run-check only, 4 holder 60-minute window, chmod guard; A's reasons in forks/kept-run-root.md.
