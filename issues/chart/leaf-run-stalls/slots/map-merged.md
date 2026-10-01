# Merged territory map: #45 #46 #47 (A, B, C)

## M0 Where the 8.5h went (A, C)
- 20:23-00:08 CEST: U1-U10 plus U6r/U7/U8r landed. 3h45 for 10 units, normal for framework leaves.
- 00:31-00:38: U11 and U11r die on meta 503. The operator stops and switches workers to devin (stop-note.md).
- 01:13-04:05: U11r on devin, about 3h for one hard unit (render-parity, broken fixture `astro build`).
- 04:51 handoff. Review 9 min. Fix briefs written in 3 min, not the "about 2 hours" #45 claims (A). fix-A/B/C committed 06:10. fix-D was still open at 06:30.
- Framework log, 50 leaves (A): implement hours barely track insertions. 20-34k-line leaves finished in 2.4-5.4h, and fix rounds do not track size. Size did not cause most of the overnight loss. Provider deaths, one hard unit and the unmeetable C1 did (A, C F3c; B F2 agrees duration is not a split threshold).

## M1 Three mechanisms, no shared controller (A, B, C)
No new phase, state field, command, clock or watchdog is needed (A, B, C). C frames #45 and #47 as one shared gap: the handoff audit only reads and runs nothing.

## M2 #47: red criterion crossed the handoff (A, B, C)
- C1 cites `bun run framework:verify` (brief.md:26). Framework blocking `checks` are parity, contracts and selftest only, and merge runs only `checks` (merge-issue SKILL.md:33). Siblings emdash-access-gate and emdash-deploy-profile merged the 2 skills:typecheck errors (A). Base stays red with no owner (A, C).
- Third recurrence (C F13): framework LESSONS.md:38 (2026-09-13) names the class. emdash-kit AC8 hit it, went `failed`, and the operator ruled by hand. `emdash-launch/brief.md:84` carries the same criterion.
- Part of the red was the leaf's own residue in fixture node_modules (B F14, C F15), so "all base" was wrong.
- implement-issue SKILL.md:31-32 already has the exit (`failed` naming a locked decision), but it is worded for fixes. A handed off "modulo base red", then wrote "Documented, not repaired" in check.fix (plan.md:133). B will re-file F1 under the fix-bar lock, so the leaf loops (A, B, C).
- Agreed fix shape (A, B, C): (1) implement and check.fix end `failed` naming the criterion when A cannot green it in scope, (2) charting proves each criterion command is achievable on the destination base before handoff. C extends the Take operation-proof rule to criterion commands. B: run the cheapest sufficient proof on base, and a red base means a prerequisite baseline leaf or a scoped criterion. A: cite only blocking checks or the leaf's own surface.
- Framework (A, C): green the base once, then add `framework:verify` to `checks` so merges keep it green. B: framework owns baseline defects. Operator/framework, not akrogon.

## M3 #46: workers die on 503 (A, B, C)
- Verified (A): U11 session shows 4 x 503 at 22:30:59/:05/:12/:22, then stopReason=error. pi default `retry.maxRetries` 3 with 2s base (pi docs/settings.md:123-129, settings-manager.js:592-597, B F10, C F6). Children use the same settings (child-session.ts:583). About 20s of cover against an overload that lasted 8+ minutes. `~/.pi/agent/settings.json` sets no `retry`. Seat A runs the same harness and provider.
- The parent gets failed + 503 text + transcript path, but no authored report and no way to continue the child (B F8-F9, C F5, F7).
- worker-protocol.md:17 makes A author a new remainder brief (A, B, C). For a provider death the original brief is still correct (B D3, C F8).
- U6/U8 remainders are normal mismatch handling, not a defect (A, B F7, C F9).
- Fix candidates:
  - (a) raise the pi retry budget in settings.json (A, C O3). An operator step on machine config.
  - (b) rerun the original brief in the retained worktree, told to start from `git status` and finish what remains (A, B D3, C O2).
  - (c) pi-extensions resumes a failed child from its transcript (C O1). B prefers a fresh child first.
  - (d) workers commit as steps land (C Q7).
  - (e) a second provider death of the same unit ends the pass `failed` (C Q6).
- Seat-level recovery exists already: an idle seat whose phase did not move is re-prompted after the 2-minute grace (src/next.ts:183, 410-416) (A).

## M4 #45: leaf size (A, B, C partly disagree)
- No size rule exists. The split rule is independence and destination only (chart-issues SKILL.md:41) (A, B, C). The worker brief template has a unit-size rule, but nothing applies at leaf level (C F3).
- B, C: add a chart audit question. Is each separately provable producer mergeable on its own with a stable output, and does a dependent consume only part of it? Split when yes, record the reason when no. No numeric gate (A, B, C). C adds a soft prompt number (more than ~8 criteria raises the split question).
- A: the data shows size is a weak cause. Prefer the dependency-driven split question only.
- C: `emdash-content-fixes` and `emdash-offer-join` need only parts of conversion. `emdash-launch` has 16 criteria plus the same red criterion. Re-chart it before it leaves plan.synthesis.

## M5 Live leaf (outside chart leaves) (A, B, C)
Let fix-D finish. Do not split the leaf now. Settle C1 before A hands back to B, by greening framework main (lint + 2 type errors) and rebasing, or by an operator edit to criterion 1. Remove the leaf's own node_modules residue. Set pi retry now. Re-chart or patch emdash-launch's criterion before it starts.

## Proposed chart
One destination: akrogon skills (chart-issues, implement-issue, worker-protocol). Operator steps: pi settings, framework base and `checks`, the live leaf, emdash-launch. pi-extensions only if (c) is taken.
Fork order: red-criterion (live trap, recurring), provider-death recovery, leaf-size.
