# Slot D direct re-check

Verdict `fix`. F2 still needs a regression test. The code passes the original concurrency reproduction.

Base `fdc5acdd4ea42ca49fd5b5e3b8c04829cc6aeea8`. Prior head `6690a8a3b1de74d559454a26d75728b15f1ac3aa`. Reviewed head `66e98364c0d655eebe303beeebb80e758aa1eb34`.

## Findings

- **F1 resolved.** Only the live `land: true` record holds its repo. The test keeps a check with the same attempt alive after killing the hold, sees the waiting leaf check finish, and only then releases the surviving attempt's check.
- **F2 open.** `src/admission.ts:186` now preserves started listed runs, and the original slice-lock reproduction passed. The cited test at `tests/run-permit.test.ts:872` starts its leaf check before land requests admission. The actual race requires land to timestamp its request first and block on its slice lock, then the leaf check to start through a separate slice lock before land goes live. I restored the old queue filter in a temporary copy and the cited test still passed. Add that ordering to a committed regression test and show it fails with the old filter and passes with the repaired filter. This protects `full: [test]` serialization under Taken 2 and correction 2'.
- **F3 resolved.** The exact-range citation gate passed. Both changed test files and `tests/fake-systemd-run.sh` have trailers in `66e98364`. Their sources match the added cases, the D-1 findings and the fixture's launch observation.
- **F4 resolved.** The cross-repo case starts a checked command while another repo's hold is live. The exit test observes zero hold files when the next land is launched. Moving the exit inside `withAdmission` in a temporary copy reproduced the expected `holds=1` failure. The kept logs below establish both cases on the current test files and the exit-order reversal. A's earlier base-red and nesting-break runs are reported without kept output.

## Evidence

- `akrogon run-check --holder <chart>/direct --name review-d2-configured-targeted -- bun test --timeout=30000 --parallel=4 --no-isolate tests/run-permit.test.ts tests/merge-red-exit.test.ts` passed 47 tests. Log `direct/check-review-d2-configured-targeted-1795363655600-3061544.log`.
- The same two files first ran twice under Bun's default 5-second timeout. The runs ended with three and two existing tests timing out. The configured flags kept the same 47 tests, used the repo's 30-second timeout and passed every timed-out case. Logs `direct/check-review-d2-targeted-1795363524620-2842314.log` and `direct/check-review-d2-targeted-retry-1795363597029-2952498.log`.
- `review-d2-line-overlap` replayed the original slice-lock order and returned `landFullCheckStartedWhileLeafFullCheckWasLive: false`. The round 1 replay returned `true`. Log `direct/check-review-d2-line-overlap-1795363507803-2912509.log`.
- `review-d2-proof-breaks` restored the old queue filter and ran `bun test tests/run-permit.test.ts -t 'a listed run of the holding attempt'` (1 pass). It then moved the exit inside the hold and ran `bun test tests/merge-red-exit.test.ts -t 'a land run holds its repo'` (1 fail with `holds=1`). Log `direct/check-review-d2-proof-breaks-1795363588450-3000902.log`.
- `review-d2-citations` ran the direct guard's `requireTestChangeCitations` check for the full reviewed range. Log `direct/check-review-d2-citations-1795363505628-2912510.log`.
- Read the kept evidence with `akrogon log`. `git diff --check` passed and the reviewed worktree was clean. Slot A reports 1,321 full-suite passes and owns the landing verification.
