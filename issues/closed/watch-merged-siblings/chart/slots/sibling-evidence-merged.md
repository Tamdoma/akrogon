# Merged round: sibling-evidence Q1

Opening (both): the operator asked for a more minimal solution than adding sibling evidence to the observe line. Wording-only is possible because the watch may read the tree (SKILL.md:30) and the command-error rule already exists (SKILL.md:41).

Research (B, verified by A): `src/next.ts:525-527,664-672` a merged dispatch returns `completed` and then runs `sweepAll` across every registered repo, so the current per-tick `next` on a merged leaf is not a harmless no-op; it dispatches other work without the operator pushing it. (B) `src/phase.ts:114-126,148` merged state is saved before `completeOwner` runs, and `completeOwner` can throw (existing destination, source closure), so a real completion-retry case exists and `next` is its only retry. (A) `observe.ts:227-230` line has no owner field; (both) owner is the top-level folder under `issues/open`, `src/phase.ts:143-147`.

- **A (recommended) (B, A concurs)** Wording only. Merged still under open: read the state.yaml files beneath the leaf's top-level owner folder. Any not merged: report waiting on siblings, no `next`. All merged: run `akrogon next <slug>` once this fire, re-observe, and use the command-error rule for a failure; remaining under open alone is not an error. Unreadable sibling state is reported as a gap, not treated as complete.
- **B (B)** Keep the `next`, drop only the error sentence. Shortest edit, but keeps the per-tick `next` and its global sweep, and a failure in the sweep may belong to another leaf.
- **C (A)** Add `owner=` to the observe line and group by it. Mechanical grouping, but changes the stable line format, the script and its test for a case that occurs rarely.
- **D (B)** Remove the merged rule. Loses the only retry for a completion that failed after merged state was saved.

Pitfalls (both): group by the top-level folder, not the immediate issue inside an epic. After a `next`, re-observe before any other action, because the call can move the owner and sweep other leaves. Merged plus siblings unmerged happens on every multi-leaf issue, so the tree read is the common path and must stay read-only.

Reply `1-A`, `1-B`, `1-C`, `1-D`, or free text.

Challenge check (both): B is fewer words but keeps an unattended sweep per tick, which the seed asks to remove (INTAKE.md:32); the lock does not forbid it since the call exists today (B rebuttal). C was A's first recommendation; the sweep finding and the operator's request for less make A the smaller correct change. D over-trusts merge-time completion.
