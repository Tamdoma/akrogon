# Base red rule

## Question
Q1. What must a base run show before "red on base" stops a leaf? Today any red base run stops it. Candidates: the base run completed (its own exit status, not killed by a seat or harness time limit), with the same command, args, scope and dependency install, and a failure judged to share a cause with the leaf run (not required to share test names).
Q2. What does a seat do when its base run does not complete (killed by a time limit, crashed runner, interrupted)? Candidates: run it again to completion under the existing wait-on-exit rule, or stop the leaf as failed with an "incomplete base run" reason, or take the repair path.

### Carries
- F2: one base run, stop on any red, no comparison (skills/implement-issue/SKILL.md:38, skills/check-issue/SKILL.md:59). Introduced 6c29639 (2026-10-01).
- Slow-run wait-on-exit rule: skills/implement-issue/SKILL.md:40-43.
- [Timeout cause](timeout-cause.md) Taken, operator verbatim "1a | 2a |": #53's timeouts were the capture race fixed in framework 2cb00d537, not load; base ab700d4cc did carry the defect; the first base run was killed after ~25 min without final counts and did not establish a valid completed base-red verdict (B rebuttal).
- [Heavy run slot](heavy-run-slot.md): ruled out.
- Locks: no new clock, poll or watchdog (charts leaf-run-stalls, stuck-seat-recovery). Failed checks and named criteria always block. No retry-until-green (map, A,B).
- B map rebuttal: a timeout can expose a real defect; require completed comparable execution and causal judgment, not an assertion-only rule.

## Findings
Exchange 2026-10-02: slots/base-red-rule-B.md, slots/base-red-rule-merged.md, slots/base-red-rule-rebuttal-B.md.
- (A,B) The first base run was killed by the seat's own launcher: Claude Code Bash `run_in_background: true, timeout: 1500000` (25 min incl. install), transcript ~/.claude/projects/-home-ivan-Work-infra-tamdoma-framework-issues-worktrees-emdash-fleet-backup/adc47027-….jsonl line 2335; killed 13:18:00 UTC line 2395; "red on base" still recorded line 2402.
- (A) Claude Code's Bash tool documents background runs at default 1800000 ms, max 7200000 ms (tool definition in this session, 2026-10-02). (B) Other harnesses differ; a finite maximum still can kill an hours-long run, so raising it is mitigation, not removal.
- (B) The leaf run's "exit 0" was the trailing `echo`/`grep | head` status, not the test command (transcript 2308/2322, report:183).
- (A,B) Later completed whole-file leaf and base runs both failed (238/1) on different fixtures from one shared capture race: names differ, cause matches.
- practitioner · Chromium infra team, CQ docs (chromium.googlesource.com/chromium/src/+/HEAD/docs/infra/cq.md, read 2026-10-02) · failing suites are retried with patch, then rerun without patch, and the CL is blamed only for tests failing with patch and passing without · supports comparing like with like; their ignore-if-red-on-base policy conflicts with "failed checks always block".
- better-than-training · LUCI buildbucket common.proto:41-53 (B) · infra failure and cancellation are separate from test failure; GitLab unit test reports (B) compare base and head and show head failures when base data is missing.

## Taken
Operator 2026-10-02, verbatim: "1a | 2a | 3a |"
- Q1 1a: red on base stops a leaf only when both runs completed (the checked command's own exit status and terminal result), with the same command, args, scope, install and material conditions, and the seat records why the base failure explains the leaf failure. Test names need not match. Otherwise the leaf failure takes the existing repair path. Reason: #53's killed run was called red, and later completed runs failed on different fixtures from one cause. Foreclosed: 1b matching names, 1c any red base.
- Q2 2a: a killed, interrupted or crashed run is incomplete: stop with `akrogon phase <slug> failed --reason "<command> incomplete base run <sha>: <cause>"`, keep logs, no automatic rerun, no base-defect claim. Foreclosed: 2b one corrected rerun, 2c leaf repair.
- Q3 3a: one line: a base run uses the harness's longest run mode, and a run killed before its terminal result is still incomplete under Q2. Mitigation, not a guarantee (B rebuttal). Foreclosed: 3b.
- No question (A,B): preserve the checked command's own exit status before any reporting pipeline.
- Scope (A,B): the base-run paragraphs at skills/implement-issue/SKILL.md:38 and skills/check-issue/SKILL.md:59 only. No merge-issue change, no new state, slot, clock or retry.
