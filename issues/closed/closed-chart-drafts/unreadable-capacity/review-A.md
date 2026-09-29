# Review A: unreadable-capacity

Base: 53508e807128de2a77b22cf4874e266224cf4f0e
Reviewed head: 0a55e38 (branch unreadable-capacity; 60ab468 implementation + 0a55e38 format)
Verdict: ready

## Verification

- `bun test tests/next.test.ts` rerun in worktree: 136 pass, 0 fail.
- Report's blocking runs present: typecheck clean, format applied as 0a55e38, full suite 328 pass / 0 fail; retained real CLI run at /tmp/unreadable-capacity-next-20260929.log confirmed on disk (136 pass, exit 0).
- Red-run claims in report trace-checked against old code: with one unreadable entry the old branch counted every non-failed leaf, so the new merged-leaf test, the capacity-2 tab expectation, the capacity-4 allocation, and the foreign-healthy allocation all fail pre-fix as recorded. The max_active 1 negative passes pre-fix, consistent with the report.

## Criteria check

- C1: `activeCount` now computes `inventory.unknown ? global.max_active : inventory.leaves.filter(active).length + inventory.unreadable` where `active` is phase not merged, not failed, plus live pane on recorded tab or inside recorded worktree. Unknown hold, foreign exclusion, discover/report, and stderr/exit behavior untouched (D3).
- C2: malformed + two waiting at max_active 2 now expects 1 tab, retry at 4 allocates both.
- C3: capacity loop splits 3 vs 4 (1 tab/prompt vs 2), with the max_active 5 explicit-dispatch escape kept only in the 3 arm.
- C4: healthy leaf now allocates (1 tab, 1 prompt) alongside the malformed skip and foreign count 2 summary.
- C5: new two-repo regression test allocates `other` then `first`, blocks `second`, asserts malformed skip line and nonzero exit; trace on old code shows `other` is blocked (non-failed count 3 >= capacity 3), so it fails pre-fix.
- C6: max_active 1 negative asserts zero tabs, zero prompts, one skip, exit 1.
- C7: failed, existing-tab, duplicate-slug, foreign-summary, unknown-population tests untouched and passing.
- C8: stderr structured lines and nonzero exit asserted in every touched test.
- C9: checks verified above.

## Docs and areas

- No AREA.md in the diff; all paths named by src/AREA.md and tests/AREA.md exist.
- Changed behavior is capacity counting; docs/guide (next.md, limits.md, install.md, in-practice.md) describe max_active generically and never state the old unreadable rule. No documented behavior changed.

## Findings

None.

## Merge evidence (slot A)

- Rebase: reviewed head 0a55e38 rebased cleanly onto origin/main 838acf1 (keep-chart-in-place landed meanwhile); no conflicts. New head 8bf4af3.
- AKROGON_BASE refreshed: 838acf14bd4a04193b365a339dd636004ad2d963.
- bun run format: clean, all files unchanged.
- bun run typecheck: clean, exit 0.
- bun test --changed=$AKROGON_BASE: 136 pass, 0 fail.
- bun test (full): 333 pass, 0 fail, 15 files.
