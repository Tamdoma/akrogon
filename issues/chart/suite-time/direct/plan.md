# Direct plan: faster-suite-files

Branch faster-suite-files, worktree /home/ivan/.akrogon/worktrees/akrogon/faster-suite-files, base e48585a5d197b50114cafa685a759367dab89973.

Sources: forks/suite-shape.md Taken and refinements (O1a, O1b), forks/load-sensitive-tests.md Taken (slice names, peer-wait budgets, door-reset ordering, status epoch), handoff review "1a". Cause evidence: slots/load-tests-B.md, slots/load-tests-C.md, slots/load-tests-merged.md, slots/s1-logs/.

## Criteria

1. The `test` check is green on the committed head. Proof: `akrogon verify --holder <chart>/direct` in the worktree.
2. Three copies at once of each fixed file pass every case: tests/leaf-slices.test.ts, tests/peer-wait.test.ts, tests/door-reset.test.ts, tests/status.test.ts. Proof: per file, three `bun test --timeout=30000 <file>` started in the same second through `akrogon run-check --holder <chart>/direct`, all exit 0, load recorded. Base comparison: the same three-copy run on base, recorded.
3. tests/peer-wait.test.ts and tests/next.test.ts each finish in less wall time than on base on this host. Proof: alternating base and head single-file runs (base, head, base, head) through run-check, load recorded.
4. No covered outcome is lost: every outcome, status, signal, session, exchange and log assertion in the changed cases is kept; the named-target split runs the same nine owner x directory comparisons as nine tests; whole-suite expect count does not drop (base 11714). Proof: the diff, plus the expect and test counts from criterion 1's log (tests 1167 + 8).

## Units (standalone order: one worker after another in the worktree)

- U1 tests/leaf-slices.test.ts: one unique identity per test process for every real-systemd slice (repo name or slug), used in state, commands, cleanup and expected slices; assert each sdrun exit before polling its marker. Production src/scope.ts unchanged.
- U2 tests/peer-wait.test.ts and tests/door-reset.test.ts: O1a shorter test-supplied budgets, each priced per site above its scripted sleep sequence and subprocess startup and the peer-wait.ts idle-grace branch; the 0.3 s and 1 s cases raised to a per-site floor that survives three copies at once; door-reset changes the session on the fake's second agent-list read instead of a 700 ms sleep.
- U3 tests/status.test.ts and tests/next.test.ts: one captured epoch for the terminal-duration fixtures, exact minute assertion kept; "named target equivalence" split into nine tests over the same owners x directories.

## Excluded

checks.test and any issues/ file (S1, door step on main after landing); per-test timeout raises (operator "2 no"); --retry; test.serial; production code; git-call counts and prebuilt fake herdr (chart git-calls).

## Implementation notes (2026-10-25)

- Criterion 3, peer-wait half, corrected after the U2 mismatch (commit b32f3212). tests/peer-wait.test.ts runs its tests concurrently (bunfig.toml:4 concurrentTestGlob), so file wall equals its longest test, "carried exchange binds the original turn on rerun" (two '11' waits). Its open-turn sites, and those in "claude peer keeps the transcript check", tell open from ended only through the `graceMs < IDLE_GRACE_MS` branch (skills/chart-issues/scripts/peer-wait.ts:89, :317, IDLE_GRACE_MS 10000). A budget under about 10 s lets an ended-turn regression print the expected line. Shortening them breaks criterion 4 (no covered outcome lost), and a product grace override is excluded. The peer-wait half now reads: spin sites drop from 11 s to 4 s, and three copies pinned to 3 CPUs pass where base fails 4 tests per copy (b2-base-x3cpu3 vs b2-x3cpu3 logs). The wall-time half of criterion 3 stays for tests/next.test.ts.
- Criterion 4 count base corrected (2026-10-25). 11714 expect() calls is the main-checkout count (slots/s1-logs base2.log). The same base test files run in the direct worktree give 11674 (check-base-suite-plain-1792965730789-2825426.log). Head in that worktree gives 11676 (check-head-suite-plain-1792965537913-2311380.log, and the verify log check-test-1792965134401-981911.log). The criterion now reads: expect count at or above base on the same checkout. Per-file runtime counts at base and head: leaf-slices 80 to 82, peer-wait 173, door-reset 75, status 367, next 2246.
- Operator decision on review-B-1 F32 (2026-10-25), verbatim: "ok, do o1". O1: accept the peer-wait outcome as restated above (wall unchanged at 22.63 s; gain is load survival and 4 s instead of 11 s spin sites). Asked for after a weekly estimate (106 full runs in 7 days; L1 about 20 s per run, L1 plus S1 about 100 s per run).
