# Direct report: dispatch-flake

Written by A on 2026-11-10. Worktree /home/ivan/.akrogon/worktrees/akrogon/fixture-start-window, branch fixture-start-window.

- base: 6352653739fcd32727c809c42a0955811071d98d
- head: a33d967b5dd07829b81b9dd87802c8a72f8effbd
- commits: 99b6137837dc1d0770173b414f252b35cfca299e (reproduction, first), a33d967b5dd07829b81b9dd87802c8a72f8effbd (fix)
- run: serial-solo, no worker, no paid call, nothing under src/ changed.

## Changed files

- tests/stand-in.sh: a `delay-<folder name>` file in `$STANDIN_DIR` holds the seconds the stand-in sleeps before its first status.
- tests/next.test.ts: new test `a dependent whose seat start takes longer than 3 s is counted once`.
- tests/hc-fixture.ts: `AKROGON_START_PROOF_MS: '3000'` removed from `hcCore`'s env; `shortStartProof` exported.
- tests/hc-start.test.ts, tests/hc-delivery.test.ts, tests/session-reads.test.ts, tests/session-routing.test.ts: the starting calls of the four unproven-start tests spread `shortStartProof`.

No doc changed: tests/AREA.md does not name the window.

## Criteria and evidence

All logs are under this folder and read with `akrogon log <path>`.

1. Late dependent start is counted once. Command: `bun test ./tests/next.test.ts -t "takes longer than 3 s" --timeout=30000`.
   - Before the fix, on 99b61378: exit 1, `attempts.A` received 0 after the merged move, 3.46 s. check-repro-before-1794321357350-3351511.log.
   - After the fix, on a33d967b, with the original test in the same run: exit 0, 2 pass, the new test 4.21 s, the original 0.93 s. check-repro-after-1794321395067-3388928.log.
2. The four unproven-start tests keep their outcome inside their existing limits, each with its own window. Command: `bun test ./tests/hc-start.test.ts ./tests/hc-delivery.test.ts ./tests/session-reads.test.ts ./tests/session-routing.test.ts -t "<the four names>" --timeout=30000`: exit 0, 4 pass. check-four-unproven-1794321423621-3394623.log. No per-test limit changed in the diff.
   - Durations in the full run on the head against the base run named under 3: `a working seat gets no send ...` 14.9 s here (targeted run) against 16.3 s; `a manual next ignores ...` 6.7 s against 7.0 s; `the busy notice lands ...` 3.7 s against 3.5 s; `a seat that never works ...` 3.5 s on the base.
3. `test` green on the head with wall times on this host. `akrogon verify --holder <this folder>` on a33d967b: `verify merge a33d967b…: green`; format, typecheck and test exit 0.
   - After: 1,152 pass, 0 fail, 60.20 s. check-test-1794321516786-3452058.log.
   - Before: the recorded verify row on the base sha 63526537 (run c3116c8f-8443-4e79-9412-5b916c8710aa, issues/verify-runs.jsonl): 1,151 pass, 0 fail, 58.18 s. issues/open/known-red-nameless/nameless-base-red/implementation/check-test-1794254822457-2177601.log.
   - The 2 s difference includes the new test's 3.5 s forced delay on one of four parallel workers; one run each, so the pair does not bound run-to-run spread.

## Exclusions held

- `git diff 63526537..a33d967b -- src` is empty.
- tests/e2e/watch-tier.ts untouched; `AKROGON_PANE_WAIT_MS` untouched.
- No retry, serial run or counter poll. The only sleep added is the reproduction's forced start delay in the stand-in, which criterion 1 requires.

## Limits

- The reproduction forces the delay; the 2026-11-09 trigger stays inferred (forks/fix-shape.md).
- A start that never proves in a test without `shortStartProof` now ends at the bun per-test limit, not as a 3 s unproven result.

## Landing, 2026-11-10

- B review round 1: ready, no Fixes or Nits (slots/review-B-1.md).
- Fetch and rebase onto origin/main: no-op, origin/main was still 63526537, head stayed a33d967b (tree 6f733906). The verify receipt ba789c4c-84f3-446c-a8b1-634a977ce429 on that exact head was kept; verify was not run a second time.
- `direct-guards.ts`: `direct guards passed`, exit 0.
- `git push origin a33d967b…:refs/heads/main`: `63526537..a33d967b`, attempt 1 of 2, no force.
- No GitHub source to close.
- Broadcast: delivered to DISCORD_WEBHOOK_URL and DISCORD_WEBHOOK_URL_2, sender exit 0.
- Cleanup: worktree and branch fixture-start-window removed and checked absent; local main fast-forwarded to a33d967b; `akrogon pack` 7 logs into direct/evidence.tar.zst.
