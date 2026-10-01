# Check scheduling

## Question

Q1. Build a tool-written check record runner (seed points 1-3), or fix only scheduling (seed points 4-5)?

Q2. After implement and after a repair, which checks must A run before handing to review?

Q3. What does the chart audit refuse in a done-criterion about checks?

### Carries
- No existing locks.
- Related: issues/chart/realistic-fix-bar/forks/test-bar.md (smallest adequate proof), issues/chart/cross-leaf-proof/forks/proof-selection.md (proof timing).
- merge_checks shipped 2026-10-01 in 5375dbe.

## Findings
See ../slots/map-merged.md F1-F6. Research: better-than-training (inspected code, emdash report and review files, framework config history). Practitioner notes on GitHub checks, Bazel, Nx, Turborepo from slot B, read 2026-10-01.

## Taken
Operator 2026-10-01, verbatim: "1a - but it needs to be good enough | 2a | 3a |"

- Q1 1a: scheduling only; the check-record runner is Off route. Reason: in emdash every logged full run was red or on a new head, so passing-record reuse showed no savings, and safe reuse needs declared inputs akrogon lacks. Foreclosed: 1b runner plus scheduling, 1c runner only. "Good enough" read as: every place the old rules live changes together (implement-issue, worker-protocol, brief-template, skills/AREA.md, docs/guide/phases.md, chart shapes), so no seat or chart is left with a rule that runs a `merge_checks` suite before merge; confirmed at handoff review.
- Q2 2a: after implement and after every repair, A supplies passing proof for every done-criterion, runs the changed tests including affected consumers and every `checks` command, reusing unchanged evidence; `merge_checks` run only at merge; a criterion that itself needs a whole run still runs it before review. The undefined "full suite" is replaced. Foreclosed: 2b one full run before first review, keeping the current rule.
- Q3 3a: the chart audit refuses a done-criterion citing a `merge_checks` command or claiming repo health outside the leaf's ownership; a repo-wide `checks` command is allowed only when the chart names the property no smaller test proves; shapes.md:170 "gets it added to `checks` first" is replaced. This supersedes leaf-run-stalls/forks/red-criterion.md Q1 1a (same day) on that sentence; its not-rocket-science reason still holds because merge runs `merge_checks` before every push (merge-issue:33). Foreclosed: 3b ban every repo-wide command.
