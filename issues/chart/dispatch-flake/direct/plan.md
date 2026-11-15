# Direct plan: dispatch-flake

Task: forks/contracts.md (job, done-criteria, exclusions) and forks/fix-shape.md (Taken 1a), read in place.
Worktree: /home/ivan/.akrogon/worktrees/akrogon/fixture-start-window, branch fixture-start-window, base 6352653739fcd32727c809c42a0955811071d98d.
Run: serial-solo, two waves of one unit, A implements both.

## Wave 1, unit 1: the reproduction, committed before the fix

- tests/stand-in.sh: a `delay-<folder name>` file in `$STANDIN_DIR` holds the seconds the stand-in sleeps before its first status. No file, no change.
- tests/next.test.ts: one test, `a dependent whose seat start takes longer than 3 s is counted once`. Same steps as `merged phase closes tab on typed next and starts the dependent`, with `delay-second` set to 3.5. Asserts the merged move exits 0, `attempts.A` is 1 after the move and after a later pass, and the dependent received one task.
- Proof: `bun test ./tests/next.test.ts -t "takes longer than 3 s" --timeout=30000`, red on this commit (criterion 1, before).

## Wave 2, unit 2: the fix

- tests/hc-fixture.ts: delete `AKROGON_START_PROOF_MS: '3000'` from `hcCore`'s env; export `shortStartProof`, the one named short window.
- Spread `shortStartProof` into the starting calls of the four unproven-start tests: tests/hc-start.test.ts (`a seat that never works ...`), tests/hc-delivery.test.ts (`a working seat gets no send ...`), tests/session-reads.test.ts (`a manual next ignores an inherited HC_TERMINAL_ID`), tests/session-routing.test.ts (`the busy notice lands ...`).
- Proofs: the wave 1 command, green (criterion 1, after); the four tests by name, green inside their limits (criterion 2); `akrogon verify` on the head, wall time against the base run on this host (criterion 3).

## Docs

tests/AREA.md does not name the window; no doc line goes stale.
