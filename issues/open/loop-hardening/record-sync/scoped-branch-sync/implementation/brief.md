## 1. Goal

Repair review-A F2 at reviewed head 2b9166bcbf2e72b8c2b40302ed92008dc7c6d20b. Remove the quadratic ignored-path collision scan while preserving F1 protection and plan D1–D5.

## 2. Numbered acceptance criteria

1. Replace the ignored × integrated nested scan with Set-based ancestor lookups. Work scales with path counts and path depth, not their Cartesian product. Preserve exact, ancestor, descendant, trailing-slash embedded-repository and literal filename semantics.
2. All existing 34 sync tests continue to pass, including eight collision refusals and harmless ignored sibling success. No new tests are required by F2. Do not alter or weaken existing tests.
3. Keep scoped staging, global/repo locking, validated fetch/rebase and autostash behavior unchanged. No new dependencies or shared interfaces.

## 3. Read-first list

Read ../review-A.md (round 1 recheck F2), ../plan.md, src/sync.ts, and tests/sync.test.ts. Use node:path dirname and Set directly. Read /home/ivan/.codex/skills/implement-issue/ponytail.md. Existing docs remain owned by command-reference.

## 4. Change list and needed interfaces

Only src/sync.ts. Replace nested collisions filter/some/within with sets of integrated files and their ancestor directories, then walk ignored-path ancestors. Normalize paths consistently to preserve current trailing-slash and whitespace/glob behavior. Prefer small file-local functions if that keeps traversal clear. Keep syncCommand(cwd: string): Promise<void> and other interfaces unchanged.

## 5. Do-not, reasons and exceptions

Do not widen into N1/N2 cosmetic changes, tests, docs, init or shared helpers. Do not merely add a ceiling comment to quadratic behavior. Do not weaken collision semantics, remove ignored protection or add fallback/config. Return a mismatch with evidence instead of widening scope or interfaces; only a revised brief from B authorizes that change. These exclusions retain the proven behavior and focus the repair on measured lock duration, with a revised brief the sole scope exception.

## 6. Ordered steps

Read F2's measured 4114 × 564 scan (1854 ms versus 3 ms for Sets) as before evidence. Implement the Set-based scan in src/sync.ts. Run the changed-test command below, fix within scope and fill section 8. One file and one bounded unit. Do not commit. B will measure equivalent results/performance and run full checks and real CLI artifacts.

## 7. Commands

AKROGON_BASE=8eebd88033301dfd7dbe943641d3028bf4b3a041 bun test --changed=8eebd88033301dfd7dbe943641d3028bf4b3a041

Only this changed-test command. B owns full suite, formatting and typecheck.

## 8. Done-when, evidence and report

F2 is removed with existing 34 sync tests passing and no scope expansion. No new tests are needed for this performance repair per review A. Use isolated existing fixtures only. B owns performance comparison and refreshed real CLI artifacts. Remove iteration-created helpers and leave source uncommitted for B.

Changed files and reasons: src/sync.ts replaces the ignored × integrated scan with a Set of normalized integrated file paths and a Set of their ancestor directories. Each ignored path checks the directory Set, then walks its ancestors against the file Set. Traversal stops at the registered repository root. This preserves exact and both ancestor directions without pairwise path.relative calls. Existing tests unchanged. No commit made.
Tests run: AKROGON_BASE=8eebd88033301dfd7dbe943641d3028bf4b3a041 bun test --changed=8eebd88033301dfd7dbe943641d3028bf4b3a041: 34 pass, 0 fail, 260 assertions, exit 0. Before evidence is review-A F2: 4114 ignored × 564 tracked paths took 1854 ms using the old scan versus 3 ms in the reviewer Set comparison. B owns independent final equivalence/performance measurement.
Known limitations: plan R1–R3.
Unverified criteria: none in the bounded source repair and existing tests. B owns final performance comparison, full checks and refreshed CLI artifacts. No temporary helpers created.
