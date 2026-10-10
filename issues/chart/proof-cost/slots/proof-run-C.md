# proof-run, slot C notes

## Q1. Long live proof seen and agreed before it runs

### Pick: (b), narrowed to arithmetic the door already has, plus one brief line

At the handoff review, for each done-criterion that standing-design.md:10 allows as a live run, the door shows one line: number of sessions, whether they run side by side or serially (and the shared resource that forces serial), and the total as `sessions x per-session ceiling / parallelism`, where the ceiling is the harness's session timeout (framework session-trace.ts:12, 30 min) unless one case was measured. Information only, operator approves or narrows scope. The brief's live-run criterion names the parallelism and the shared resource, so the seat does not default to serial. No plan-side change, no number in Size, no enforced budget.

Reason. The thing that went wrong in #75 was not the absence of a number but that nobody saw 13 sessions x 30 min ceiling x serial before the seat started. Both factors already exist at charting: the brief lists the paths to dispatch (criterion 1 "every blueprint path"), and the consumer's timeout is a fixed file. Multiplying them is a sentence, not a model. The operator already attends the handoff review (SKILL.md:69), so nothing new is asked of them. The steering fix that worked (parallel pool, commit 88adda0fc) is exactly the "parallelism" word the brief line forces.

Cost. One line per live-run leaf in the review, written by the door. One sentence in shapes.md's audit paragraph (near :286) and one in the brief shape. Nothing in the command, the plan skill or seat prompts.

### Rejected

(a) close #75 with no rule. Measured against this pick: 85 of 343 closed framework leaves (25%) carry live-run proof text in plan or brief, and their implement phase has median 103 min, p90 232, versus 26 and 158 for the other 258 (framework issues/log.jsonl, briefs under issues/closed, pattern on "live run|real session|launchSkillSession|run-*-proof|dispatch session"). The class is a quarter of all leaves and four times the median implement time. Whether that time is proof runtime or bigger work cannot be split from the log, so the number argues for visibility, not for a gate. A second case is near certain; the only question is whether the review line is cheaper than the next steering. It is.

(c) minute numbers in plan-issue Size instead of words. The plan is written after handoff by the seat (plan-issue SKILL.md:61) and the operator never reads it before implement starts, so a number there is seen by nobody who can narrow scope. The seat's own estimate for #75 was "30-60 min", the timeout ceiling, not a measurement, so a number without a measured case is a guess with more digits. Size words also already allow "hours" and plans use it (15 rows across closed plans) without anyone acting on it. The longest live-run leaves (live-replay 1699 min, satellite-review 568, portal-activation 437) have no Size table at all; a column rule reaches none of them.

Enforced budget, stall compare, numeric split trigger: locked out (leaf-run-stalls Off route "any clock, watchdog, elapsed trigger or numeric size gate", shapes.md:286 "no count, size or duration trigger"). An estimate shown is not a gate (B, intake). Not reopened.

Measuring one case at charting as a rule: the door has no worktree, accounts or consumer roots at charting. Keep it optional under questions.md "Optional measurement", which already offers a time-boxed prototype for a named uncertainty with estimated minutes; the review line names the uncertainty.

### Evidence

- Measured 2026-10-10, framework log and closed briefs: live-run leaves 85/343, implement median 103 vs 26 min; Size words across closed plans: seconds 391, minutes 244, hours 15, unknown 1; top live-run leaves have no Size table.
- Primary: standing-design.md:10 (a live run "names what no smaller test could prove", no cost rule); shapes.md audit paragraph (no duration trigger); plan-issue SKILL.md:61 (Size words); chart-issues SKILL.md:69 (attended handoff review); questions.md "Optional measurement".
- Primary, consumer: framework session-trace.ts:12 `SESSION_TIMEOUT_MS = 1_800_000`; formspark-build-wiring runner now parallel, pool of 10 (intake agent findings).
- Operator material: #75 observation (13 cases, "30-60 min" each, operator rejected a multi-hour run, steered to concurrency and measure-one-first). Operator 2026-10-10: no new mental model.
- Model knowledge, no stronger source: a ceiling-times-count estimate is the standard pre-run cost check for batch jobs. No practitioner named.

### Pitfalls and what removes each

- P1 the line becomes a padded guess. Removed by defining it as `count x ceiling / parallelism`, with the ceiling taken from the named timeout file, not the seat's judgement. A measured case replaces the ceiling only when recorded in the chart.
- P2 the door forgets the line. Removed by the audit paragraph refusing a live-run criterion that lacks session count and parallelism; the review line follows from the brief.
- P3 the ceiling is the failure cost, not the success cost: a healthy session ends in minutes, a hung one in 30. Say both in the line (`13 x up to 30 min, serial 6.5 h, 10 wide 40 min`) so the operator sees that serial plus timeouts is the risk, and parallelism is the fix.
- P4 rerun triggers "every change" rerun the whole set after each harness fix (intake). Removed by the brief line naming per-case rerun when cases are independent; the plan's rerun-trigger column already exists to hold it.
- P5 proof breadth grows with blueprint paths (criterion "every path"). Removed by the operator seeing the count at review and narrowing to representative paths when the count is large; that is the "approve or narrow" step and needs no rule.

### Questions the fork does not ask

- Q-a Is the 30 min `SESSION_TIMEOUT_MS` itself right for proof sessions? A hung case costs 30 min each; a 10 min timeout would cap the worst case at a third with no akrogon change. Consumer-side, out of this chart, worth one seed to framework.
- Q-b Should the brief shape require the live proof's cases to be independent by default (own root, own log) so parallel is the norm, with serial needing a named shared resource? That is the real fix from 88adda0fc generalized, and it is a brief rule, not a gate.
- Q-c Does the handoff review's `chart-usage.ts` line (SKILL.md:69) have room for the proof estimate, or is a second line cleaner? Formatting, decide at implement.
