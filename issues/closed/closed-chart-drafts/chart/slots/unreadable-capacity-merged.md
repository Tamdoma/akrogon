# unreadable-capacity: merged round (A,B)

Correction to Carries (B): foreign leaves are not unreadable. They enter `foreign` and reserve zero (src/next.ts:99-104,130-143). Unreadable = malformed state.yaml, bad depth, or each path of a duplicate slug.

## Q1. When a repo has an unreadable entry, what does each leaf reserve?
- 1a (recommended, A,B): readable leaves count by the normal rule (not merged, not failed, has a live pane in its tab or worktree), plus one per unreadable entry. Unknown-population holds (full max_active) and foreign exclusion unchanged. A broken neighbor gives no reason to discard what we know about readable leaves. Supersedes loop-hardening dispatch-error-report.md:13 "counts all its leaves as active". Example: max_active 3, one unreadable, 20 merged, 2 waiting leaves: both waiting leaves start. Today none do.
- 1b (A,B): exclude merged only, keep counting every readable waiting leaf. Removes the #39 multiplier but a queue still blocks itself: one unreadable plus one waiting leaf at max_active 2 starts nothing (tests/next.test.ts:1353-1373).
- 1c (A,B): unreadable reserves zero. Most throughput, but a broken file may belong to a running leaf, so akrogon could exceed max_active. Prior chart rejected this (dispatch-error-report.md:10).
Pitfalls (A,B): 1a still blocks at max_active 1 with one unreadable entry. Tests at tests/next.test.ts:699-715, 1111-1134, 1353-1373 encode the old rule and must change. Keep error reports and nonzero exit.

## Q2. Should `akrogon phase` and `akrogon status <slug>` keep refusing when any leaf in the repo is unreadable? (A)
`findLeaf` -> `allLeaves` (src/state.ts:104-135) throws on the first bad leaf, used by src/phase.ts:283 and src/status.ts:292. After archive-boundary, chart drafts no longer trigger this.
- 2a (recommended, A): keep refusing. The error names the bad path, and an unreadable file might hold the same slug as the target, so acting could hit the wrong leaf.
- 2b (A): skip unreadable leaves and act on the readable match. Keeps other leaves moving, at the risk above.
