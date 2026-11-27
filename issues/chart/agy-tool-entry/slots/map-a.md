# Map A: #164

Cause confirmed by reading: src/seat.ts startSeat wires claude with CLAUDE_CODE_SHELL, codex/pi with BASH_ENV, agy with `PATH=<home>/tool-entry:$PATH` in the sh hop. src/run-check.ts constructedEnv copies only an allow list (`copied`): CLAUDE_CODE_SHELL and BASH_ENV never reach a check, PATH does. So the check env policy already means "checks run unwired"; agy's PATH is the one hole. verify's pass service forwards PATH (passForwarded) and verify-pass builds checks through the same constructedEnv.

Options:
- (a) test only: tests/tool-entry.test.ts strips the entry dir from the env it spawns. Fixes one test; any other check, in any repo, that runs bash under an agy seat still goes through the host wrapper (placed in a tool cgroup of the seat, killed by the seat's sweep). Symptom fix.
- (b) tests/isolation.ts strips it for the akrogon suite. Same: akrogon-only.
- (c) constructedEnv drops PATH entries that resolve to `<homePath()>/tool-entry` (same test realBash in src/tool-cgroup.ts uses). Removes the class: every checked run (run-check, verify-pass, next setup) sees the same env from any seat kind, matching the claude/codex wiring that the allow list already drops. Breaks nothing known: no check needs the seat wrapper; land runs have no entry dir on PATH anyway.
- (d) change agy wiring (no PATH). agy has no shell setting known to us; BASH_ENV would not reach agy's non-interactive shell? Unknown, larger, risks agy tool-cgroup placement (seat-shell-kill work).

Recommend (c). Proof: a run-check test whose caller PATH starts with `<AKROGON_HOME>/tool-entry` and whose checked command prints PATH; red today (entry dir present), green after. Reuse realBash's matching (resolve + realpath) by exporting one small helper from tool-cgroup.ts rather than writing a second matcher.
