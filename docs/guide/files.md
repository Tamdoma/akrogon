# Files

The leaf branch carries code. The checkout carries issues. Two writers, two folders, one remote. The branch never touches issues/. Say that when you're confused — it fixes most confusion.

What it's: the split between where code lives and where plans live. Why it exists: before it, plans and reviews were committed on the leaf branch and also in the checkout. Every merge produced rebase conflicts on the same review file. Now each folder has exactly one writer, and conflicts in issues/ can't happen. How it works: the phase command checks on every move and refuses if it finds issues/ files on the branch or a dirty worktree. The file that makes it so is the branch diff itself, checked against the registered checkout.

Two places write to the repo at the same time. Agents build on the leaf branch inside the worktree. Akrogon and the skills write plans, reviews, state, and the log inside your registered checkout, on main.

The rule that keeps them from colliding: nothing under issues/ is ever committed on a leaf branch. The phase command checks this on every move and refuses if it finds one.

So after a merge, main on the remote has the new code, and your checkout has new issue files that are not pushed yet. One command reconciles the two:

    akrogon sync

It stages only eligible issue records in the checkout — issues/ minus seeds, lock files, and the worktree root — commits as sync issues if anything is staged, fetches, rebases with autostash, and pushes. It refuses the wrong branch, detached HEAD, and any already-staged paths outside those records. Your unrelated half-done code is left alone, not swept in. Agent work is never overwritten. Your issue files ride on top of it.

A concrete use: export-csv just merged. Origin main has the new widgets export code. Your ~/Work/widgets checkout on main has updated state.yaml, review-A.md, log.jsonl, and the closed folder move. You run akrogon sync from ~/Work/widgets. It commits the issue files, rebases onto the new main, pushes. Now checkout and remote agree.

## What each artifact is

brief.md, written by you. What and why. The done criteria. Ours says CSV header plus rows, JSON still works, tests cover both.

design.md, written by you via chart-issues. Locked decisions. Agents don't reopen them.

positions-A.md and positions-B.md, written by A and B. Independent plans, debate mode only. Export-csv with debate no doesn't have these.

rebuttal-A.md and rebuttal-B.md, A and B. One reply each, debate mode only.

plan.md, written by B. The final plan. Settled decisions, read-first paths, ordered checklist, acceptance criteria.

implementation/report.md, written by B. What was built, check output, the commit. Before and after heads for repairs.

review-A.md and review-B.md, written by A and B. Findings, evidence, verdict. A appends re-checks and merge evidence here — rebase target, pushed head, conflict resolutions.

issues/chart/<issue>/, written by you via chart-issues. The chart and its fork files. When the issue closes, the whole folder moves to issues/closed/<issue>/chart/.

issues/log.jsonl, written by akrogon. One line per phase change: time, slot, commit, diff size. Tail it when status is not enough.

I read plan.md first when I open a leaf, then the reviews. Brief tells me what they wanted, plan tells me what they decided, reviews tell me what broke. Everything else is backup.

Previous: [Phases](phases.md) · Next: [gacp](gacp.md) · [Home](../../README.md)
