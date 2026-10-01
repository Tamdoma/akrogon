# Design: check-scheduling

## Binding decisions, verbatim

From issues/chart/check-reruns/forks/check-scheduling.md, operator 2026-10-01: "1a - but it needs to be good enough | 2a | 3a |"

### Q1 scope: 1a
Scheduling only; the check-record runner is Off route. Reason: in emdash every logged full run was red or on a new head, so passing-record reuse showed no savings, and safe reuse needs declared inputs akrogon lacks. Foreclosed: 1b runner plus scheduling, 1c runner only. "Good enough" read as: every place the old rules live changes together (implement-issue, worker-protocol, brief-template, skills/AREA.md, docs/guide/phases.md, chart shapes), so no seat or chart is left with a rule that runs a `merge_checks` suite before merge.

### Q2 implement and repair proof: 2a
After implement and after every repair, A supplies passing proof for every done-criterion, runs the changed tests including affected consumers and every `checks` command, reusing unchanged evidence; `merge_checks` run only at merge; a criterion that itself needs a whole run still runs it before review. The undefined "full suite" is replaced. Foreclosed: 2b one full run before first review, keeping the current rule.

### Q3 chart audit: 3a
The chart audit refuses a done-criterion citing a `merge_checks` command or claiming repo health outside the leaf's ownership; a repo-wide `checks` command is allowed only when the chart names the property no smaller test proves; shapes.md:170 "gets it added to `checks` first" is replaced. This supersedes leaf-run-stalls/forks/red-criterion.md Q1 1a on that sentence; its not-rocket-science reason still holds because merge runs `merge_checks` before every push (merge-issue:33). Foreclosed: 3b ban every repo-wide command.

## Standing design

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md

This leaf changes prose only. No vanity tests: do not add tests that assert skill or guide wording (check-issue:45, LESSONS 2026-10-01). Proof is the criterion-1 search output, a read of each changed rule against the binding decisions, and the existing blocking checks. No end-to-end run, chain or live call applies. standing-design.md itself stays unchanged; its line 12 slow-run reuse rule is consistent with 2a.

## Leaf architecture

Owned surfaces:
- `skills/implement-issue/SKILL.md` (lines 34, 42, 48, 52, 62 as needed)
- `skills/implement-issue/worker-protocol.md` (lines 11, 25, 27)
- `skills/implement-issue/brief-template.md` (lines 37, 39)
- `skills/chart-issues/assets/shapes.md` (lines 132, 170)
- `skills/AREA.md` (line 22)
- `docs/guide/phases.md` (line 91), `docs/guide/merge.md` (line 3)

Term: use "every `checks` command" for the pre-review set and "`merge_checks`" for the merge-only set. Do not introduce a new tier name.

Exclusions:
- No check-record runner, CLI verb, record file or phase guard (Q1).
- `skills/merge-issue/SKILL.md` and `skills/check-issue/SKILL.md` keep their current check rules; `skills/init-akrogon/SKILL.md:20` keeps its merge_checks placement advice.
- `src/` and `tests/` unchanged except for a test the existing suite needs to stay green.
- Nothing under `issues/` (leaf branches carry code only); framework config and emdash-conversion C1 are framework operator decisions.

Dependencies: none.
