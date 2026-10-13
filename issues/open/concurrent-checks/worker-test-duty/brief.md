# Brief: worker-test-duty

## What
Skill text so workers run only the targeted tests their sub-brief names, A runs the changed-tests command after each pick and every check at phase ends, seats run any long check as one background whole-command run with a log and exit file under $TMPDIR, and check-issue states what non-printed runs can prove.

## Why
Each worker runs the full changed-tests command today (brief-template.md:37, worker-protocol.md:27), which for framework selects ~100 scripts and 12-14 min per run, multiplying heavy runs per leaf 3-4x (GitHub Tamdoma/akrogon#90). Seats under a 120-600 s tool limit wrap checks in `timeout` or kill and retry them, losing their place and leaving browsers behind (Tamdoma/akrogon#89).

## Done-criteria
1. The worker sub-brief template's Commands section names the unit's targeted test commands from A's plan, and says that when none are named the worker runs no changed-tests command; it no longer supplies the resolved `test_changed` command.
2. worker-protocol and implement-issue say A runs the resolved changed-tests command after each cherry-pick and every `checks` command at phase ends, and workers never run the full changed-tests command.
3. implement-issue's wait-on-exit rule (SKILL.md:45) names the background form: one fresh `mktemp -d` directory under `$TMPDIR` per run, created before launch; the exact printed command started once there with `nohup`, output to `log`, its exit status written to `exit`, the wrapper PID recorded beside them; across tool calls, no `exit` with the PID alive means running, no `exit` with the PID gone means incomplete; never `timeout`, never a second start for that directory. (B,C)
4. check-issue says output from a run outside the printed `checks` command can prove the specific done outcome it exercises but never replaces a required `checks` result.
5. The repo's `test` check passes.
