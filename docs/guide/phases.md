# Phases

Nine phases, in the order they happen. Every phase names who works, what skill they follow, and what moves it forward. A leaf with debate no skips the first two — which is us, export-csv runs debate no and starts at synthesis.

1. plan.positions, A plus B, plan-issue. Each writes a plan alone, not reading the other. Then to plan.rebuttal, or straight to synthesis if rebuttal is false in repo config. Debate mode only. I rarely use debate for small things. It's good for gnarly ones.

2. plan.rebuttal, A plus B, plan-issue. Each reads the other plan and replies once. Then to plan.synthesis. Debate mode only.

3. plan.synthesis, B, plan-issue. Writes the final plan.md, or the only plan when debate is off. Then to implement. For export-csv this is the start: B reads brief.md, the grounding index, lessons, and writes the plan with checklist and acceptance criteria.

4. implement, B, implement-issue. Builds it in the worktree, runs every check, writes implementation/report.md, commits the code on the branch. Then to check.review. The move is refused if the worktree is dirty or if any file under issues/ is on the branch. Also refused if the branch is empty when moving into review — no empty leaves.

5. check.review, A plus B first time, then A only after fixes. check-issue. Each reviews the diff and writes review-A.md or review-B.md with a verdict: ready, nits, or fix. If nobody said fix, go to merge. Otherwise to check.fix. Verdicts are required here; other phases forbid them.

6. check.fix, B, implement-issue. Repairs the listed defects. Then to check.review, but only A reviews this time. Each review to fix loop adds one to fix_rounds. Past the cap, go to failed. The cap is fix_rounds in repo config, default 3.

7. merge, A, merge-issue. Rebases the branch on origin/main, runs every check, pushes the branch as the new main, records lessons. Then to merged. A rebase conflict is resolved by A and recorded in review-A.md. A red check goes to check.fix instead, and the repair is re-reviewed.

8. merged, nobody. Terminal. When every leaf in the issue is merged, the issue folder moves to issues/closed/, linked GitHub issues are closed, and the broadcast goes out if configured. The tab closes itself — A closes it as its very last act. The worktree and branch are removed at the next hand-typed next or startup sweep, not by the hook.

9. failed, you. Waits. Read the reviews, fix the brief if the brief was the problem, then send it back with akrogon phase <slug> <phase>. From failed you can go to any active phase listed in routing — positions, rebuttal, synthesis, implement, review, fix, merge — not just implement. Pick where it should resume. The command resets fix_rounds when leaving failed, and clears attempts, done, verdict, prompted. It also records a failure entry with cause, phase, slot, reason.

## How a phase moves

An agent ends its phase by running one command. This is the only way a phase changes.

    akrogon phase export-csv check.review --slot B
    akrogon phase export-csv merge --slot A --verdict nits

The command refuses illegal moves, refuses a slot that already reported, and moves the phase only when every required slot has reported. Until then it prints recorded and waits for the other slot. That's why you sometimes see transition refused in a pane: the agent tried twice, the second was rejected, and that's correct. Don't panic.

Why re-review after a fix uses only A: B just wrote the fix. B reviewing its own fix costs tokens and adds little. A checks the repair diff only. If A says fix again, B goes another round, up to fix_rounds.

Concrete use: export-csv in widgets at implement, B finishes, runs phase export-csv check.review --slot B. Both seats review. A says nits, B says ready. No fix, so next is merge. A merges, pushes, runs phase export-csv merged --slot A. If that was the last leaf, the command prints issue complete and moves issues/open/export-csv to issues/closed/export-csv. Done.

Previous: [Next](next.md) · Next: [Files](files.md) · [Home](../../README.md)
