# Review brief: run-ram (slot D)

Your round 1 on the old flat design: slots/review-D-1.md. Redesign decision: forks/design.md "Redesign" (from slots/redesign-B.md; C's redesign-C.md alternative not taken).
Worktree /home/ivan/.akrogon/worktrees/akrogon/run-ram, one commit 20dd30b3 on origin/main c689573b.
- run-check: run root and its record stay under leaf temp; with run_root set and a guard, one mkdtemp folder under run_root becomes TMPDIR (+ bun-cache). Nested runs stay on disk.
- scope: guard ExecStopPost `-chmod -R u+w <folder>` then `rm -rf <folder>`; scope gets After=<run>-guard.service so it stops before the guard (race reproduced without it).
- config: run_root also limited to [A-Za-z0-9._/-]; ensureRunRoot creates it 700 via ensurePrivateDir.
- tests: tests/run-units.test.ts 4 real-unit tests (green/red/nested, refusal, stop-run, SIGKILL; each with a 555 dir), config bad-character refusals. All fail without the change.
Known: guard start failure after mkdtemp leaves one empty folder; with run_root unset, a 555 dir in TMPDIR still makes run-check's own cleanup throw (pre-existing).
Check: your old F1-F5 cannot recur; cleanup covers every end path (incl. cancelled admission, leaf slice stop, user manager restart); ExecStopPost quoting safe; memory/ENOSPC behavior; whether the pre-existing 555 bug should be fixed here (it is the same class: the run root removal). Verdict ready or fix.
