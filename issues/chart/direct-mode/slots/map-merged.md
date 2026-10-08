# Merged opening map: direct mode

Sources: map-A.md, map-B.md, map-C.md in this directory. Tags name slots that wrote the point.

## Agreed
- Repo setting in `repoSchema` (strict, src/config.ts:38-60), default off, printed by `akrogon config`, acted on only by the door. (A,B,C)
- Setting permits the door to offer direct; operator chooses per chart at handoff review; recommendation or silence never selects it. (A,B,C)
- Gates stay: forks taken, fog empty, needs, proofs, grants, prerequisites, destination refresh. (A,B,C)
- Code in a branch worktree from `<remote>/<default_branch>`, not root main: root main breaks `test_changed` (needs AKROGON_BASE, src/config.ts:270), mixes with dirty operator work, and gives B no fixed range. (A,B,C)
- A implements and repairs, B reviews with the check-issue Fix/Nit bar, re-checks repair diffs, bound by repo `fix_rounds`; C stops after charting. (A,B,C)
- Review bar lives in check-issue (new standalone-review section), not restated in chart-issues. (B,C) A agreed in principle (reuse skills).
- B verdict binds to a committed head; door lands only on ready/nits read from B's return file. (B,C)
- B absent means no direct option. (A,B,C)
- Escape hatch: if the item grows, stop and hand off as a normal leaf. (B,C)

## Fork 1: container (reshapes all others)
- 1a No state.yaml. Chart folder holds brief/design/readiness, review files, and `Closed <date>` marker with delivering sha. (B,C) Cost: phase guards (src/phase.ts:273-277) run by hand or by calling the same functions; nothing in `akrogon status` while in flight.
- 1b Leaf with `hand_built: true`, door calls `akrogon phase`. (A initially) Dead end: `mergeQueue` excludes hand-built leaves (src/turn.ts:9-10) so `merged` is refused and nothing pushes. (C) A withdraws 1b.
- 1c Ordinary leaf, seats do implement/check by hand, `akrogon next` merges. (B O2, C 2c) Cost: merge allocates a fresh tab with new panes (src/next.ts:337-438); merge tab close could hit the door pane (B); close to just using the lifecycle.

## Later forks (after fork 1)
- Eligibility: hard refusals for grants/inputs/produces/blocked-by (C) vs conceptual eligibility with recorded reasons, no categorical ban on live ops while all gates hold (B). A leans C (one leaf, no blocked-by, no live mutation).
- Landing: door rebases, runs checks + merge_checks, fast-forward pushes (C 6a) vs stop at reviewed commit and operator pushes (C 6b). Door pushing is new; merge-issue says seats never push. (C)
- Completion: close delivered GitHub sources with `akrogon close --by <sha>` (B,C). Broadcast: match lifecycle (B O15) vs off route (C).
- May direct work touch `issues/` paths? (C)
- In-flight visibility: chart footer and CHART.md pointer to worktree/branch/review file; status unchanged. (B,C)
- Worktree cleanup is the door's job; sweeps only remove merged leaves' worktrees (src/next.ts:691-700). (C)

## Points where slots differ
- Eligibility hard vs conceptual (B vs C).
- Broadcast in or out (B vs C).

## Outside practice
- Google eng-practices "Small CLs" (B, fetched 2026-10-08): size is reviewer judgment, not line counts.
- Trunk Based Development, short-lived feature branches (B, fetched 2026-10-08): brief branch, review, rebase before land.
- Rouan Wilsenach "Ship/Show/Ask" (C, model-knowledge): author merges with lightweight review only with blocking checks.
