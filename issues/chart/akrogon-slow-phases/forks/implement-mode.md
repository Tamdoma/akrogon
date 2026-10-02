# Implement mode

## Question
Q1 Set akrogon to repo-wide `implement: inline` (operator edit to `issues/config.yaml`), keep `subagents`, or build a per-leaf small-leaf mode (new mechanism)?

### Carries
- `src/config.ts:34` has one repo setting; `skills/implement-issue/SKILL.md:49` gives even one unit a worker. (B)

## Findings
Round 1 (2026-10-02): blind `../slots/implement-mode-{A,B,C}.md`, merged `../slots/implement-mode-merged.md`, rebuttals `../slots/implement-mode-rebuttal-{B,C}.md`.
- Claude seat: 2 leaves, 4 passes, both prose. Checks 77% of 824 s, four full suites at 79-81 s (B; C 65% and 85%). Workers 22.7 s wait (B), about 62 s with briefs, worktrees and picks on wave-table (C). Not enough to decide a repo-wide mode (A,B,C).
- The fast suite cuts those passes to about 547 s (B). Inline adds at most 40-55 s on wave-table, nothing on proof-order, and serial units can make it slower (B,C).
- The old pi worker share does not carry over: pi workers took 10-29 min per unit, Claude workers 12-22 s (C). A's blind inline view rested on the old share.
- proof-order (1 unit) was edited inline despite `subagents` and "one unit included" at `skills/implement-issue/SKILL.md:49`; nobody flagged it. Under keep-subagents the next one-unit leaf breaks the rule again or pays an unmeasured worker (B,C). Closing it needs an explicit one-unit exception to the "otherwise write one sub-brief per unit" branch, not just deleting the parenthetical (B). No measured saving (C).
- A plan-required separate agent stays in either mode (realistic-review-bar `plan.md:18`); `SKILL.md:51` "Inline has no worker" does not say so (B,C).
- Sources: Anthropic multi-agent research system 2025-06-13, Building effective agents 2024-12-19, Cognition Don't Build Multi-Agents 2025-06-12. None measures one agent against subagents on small edits (B,C).
- Per-leaf small mode: decline (A,B,C).
- Old pi setup: workers 57-59% of implement time (B,C). realistic-review-bar spent 21 of 30 min in a worker; B attributes about 11 min of that to required fresh-agent acceptance proof. Current Claude seat: only 2 leaves measured. C would wait for 5-10 Claude-seat leaves.

## Taken
Operator 2026-10-02, verbatim: "1a | 2a | what about the b slot doing the fixes, is that still on?"

- Q1 1a: keep `implement: subagents` and the one-unit worker rule unchanged; look again once the fast suite has landed. Reason: on the Claude seat workers cost 3-18% and the suite was the cost (B,C). Foreclosed for this chart: one-unit inline exception, repo-wide inline, per-leaf mode. Accepted: the one-unit rule at `skills/implement-issue/SKILL.md:49` was skipped on proof-order and stays as written.
