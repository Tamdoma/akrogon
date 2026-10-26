# Direct report: faster-suite-files

Worktree /home/ivan/.akrogon/worktrees/akrogon/faster-suite-files, branch faster-suite-files.
Base e48585a5d197b50114cafa685a759367dab89973. Head 2ee7cf7654c7a50851dc2f529df09074d9fc060a.

## Commits

1. e0136189 tests/leaf-slices.test.ts. Every real-systemd slug carries a per-process suffix (`unique(slug)` = `${slug}-${process.pid}`), and each sdrun before a marker poll asserts its exit with stdout/stderr. Brief 1.
2. b32f3212 tests/peer-wait.test.ts and tests/door-reset.test.ts.
   - peer-wait: unproven-wait budgets go from 11 to 4 s at :211, :230, :317, :438, :460, :635, :658 and :679. The harness-session-change budget at :588/:599 goes from 1 to 4 s, and the last-status budget at :902 from 0.3 to 2 s. The proven-open sites (:488, :740, :757) stay at 11 s, because the grace branch at skills/chart-issues/scripts/peer-wait.ts:317 is their only ended-vs-open discrimination.
   - door-reset: a test-local herdr wrapper changes the session on the third agent-list read, the turn wait's first read. This replaces the 700 ms sleep. The shared fake is unchanged.
   - Brief 2.
3. 2ee7cf76 tests/status.test.ts and tests/next.test.ts.
   - status: the fixture helpers take one `at` per test for the two exact-TIME tests.
   - next: the named-target loop becomes nine test() calls, each with a 15000 ms timeout (was 60000). The slowest case alone took 4.49 s.
   - Brief 3.

Each commit carries one Test-Change trailer per changed test file.

## Criteria

1. Green check set. `akrogon verify --holder <this folder>` on 2ee7cf76 gave test 0 (check-test-1792965134401-981911.log: 1175 pass, 0 fail, 168.37 s) and typecheck 0 (check-typecheck-1792965137162-981911.log). Merge receipt green. Wall 174 s.
2. Three copies at once on 2ee7cf76, all exit 0 (head-x3.lines, head-x3-*.log):
   - leaf-slices 3.1 s
   - peer-wait 23.5 s
   - door-reset 0.8 s
   - status 1.4 s

   Base, from base-x3.lines: leaf-slices failed 2 of 3, status failed 1 of 3, and peer-wait and door-reset passed.

   Extra, from the U2 worker: pinned to 3 CPUs with three copies, base peer-wait fails 4 tests per copy and head passes (b2-base-x3cpu3-*, b2-x3cpu3-*).
3. Faster files.
   - next.test.ts, alternating single runs: base 66.66 / 45.65 / 46.79 s, head 26.59 / 26.42 / 26.76 s (check-alt-next-*.log). Head is about 43% faster.
   - peer-wait.test.ts wall is unchanged: 22.63 s solo at base and head. The criterion was corrected in plan.md "Implementation notes": file wall is bounded by proven-open sites that cannot drop below the 10 s grace without losing ended-vs-open coverage. The gain there is load survival and fewer spin seconds.
   - door-reset target test 765 ms to 118 ms.
4. No covered outcome lost.
   - Static expect( counts: leaf-slices 67 to 69, peer-wait 27, door-reset 60, status 232, next 1522.
   - Runtime counts per file: leaf-slices 80 to 82, others equal.
   - Full suite on the same worktree: base files 11674 (check-base-suite-plain-1792965730789-2825426.log), head 11676 (check-head-suite-plain-1792965537913-2311380.log). The plan's 11714 was a main-checkout count; corrected in plan.md.
   - Tests 1167 to 1175.

## Known limitations

- Two copies of next.test.ts at once still failed 3 tests in one probe. That is the cap group (38 names in next.test.ts and batch-dispatch.test.ts), which is S1's work, not this attempt's.
- peer-wait sites outside brief 2 still expire on 2 CPUs with three copies, in base and head alike: the '1' carried-codex budgets at :797/:812/:824, the 0.5 s clamp test and the '12' failure sites. None failed in S1.
- The status fix is shown by 3+3 green concurrent runs, not by a failure-rate measurement.

## Unverified criteria

None. Criteria 3 (peer-wait half) and 4 (count base) were restated with evidence in plan.md.

## Round 1 repair and landing

- review-B-1: fix with F32 and F33.
  - F33 was fixed at 51ee341c: quote() on the fake-herdr path. Proofs: f33-space-root (17 pass from a "checkout with spaces" worktree) and f33-solo (17 pass).
  - F32 was resolved by the operator, "ok, do o1".
- review-B-2: ready.
- Landing on 51ee341c54fdd0e9b1805306b69d211bce8654d6:
  - origin/main had not moved, so there was no rebase.
  - verify receipt 113fcf0e-84da-411b-a8a0-dd53d1047cd4: format 0, test 0 (1175 pass, 0 fail, 11676 expects, 165.99 s), typecheck 0.
  - direct-guards passed.
  - Pushed e48585a5..51ee341c on the first attempt.
