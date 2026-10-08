# Leaf split

## Question
Q1. One leaf, or two parallel leaves (name selection; blocked diagnostics)?

### Carries
- Opening map: B proposes two parallel leaves, A one leaf.

## Findings
Merged notes: [slots/leaf-split-merged.md](../slots/leaf-split-merged.md). Rebuttal: [slots/leaf-split-rebuttal-B.md](../slots/leaf-split-rebuttal-B.md).
- operator · door rule · independently checkable outcomes in one destination can be parallel leaves, only a real dependency orders work · favors two leaves.
- better-than-training · src/next.ts:1167-1207 selection versus :593-660, :698-717, :1231-1270 dispatch (read 2026-10-08) · Names Taken lives at selection, Blocked report Taken lives at dispatch and routing · no dependency between them. A changed from one leaf to two.
- better-than-training · tests/next.test.ts:1204-1217 · waits already testable through --all and paths · the report leaf can be proven without owner names.
- B rebuttal · selection meets dispatch at src/next.ts:1247-1257, so neither leaf alone proves `next <epic>` feeds the report · proposed a combined check run by whichever leaf merges second.
- No outside research applies. This is a split of this repo's own work.

## Taken
Operator answer 2026-10-08: `1a`. B final-shape check: [slots/leaf-split-final-check-B.md](../slots/leaf-split-final-check-B.md), no problem.
- Leaves `named-targets` and `blocked-report` in one standalone issue, no blocked-by. Reason: each outcome is checkable alone and parallel is fastest.
- Composition proven by two criteria, not a combined test. named-targets: for an epic and a nested issue, `next <name>` from the repo root gives the same Selection (repo and leaf set) as `next <its repo-relative folder path>`. blocked-report: reporting subjects are the Selection's leaves (or the --all inventory), independent of input form; a one-leaf folder target and that leaf's slug give the same report, and a multi-leaf folder target reports each subject.
- Docs: named-targets owns target forms and the same-name path example (docs/guide/parts.md, target text in docs/guide/next.md). blocked-report owns report and automatic-silence text in docs/guide/next.md.
- Whichever merges second resolves the overlap in src/next.ts, tests/next.test.ts and docs/guide/next.md.
