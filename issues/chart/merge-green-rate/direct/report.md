# Report: merge-green-rate (akrogon, direct)

base ff8f6e11b766a1422d2f9048f0f7a161728fef19, head fb236ec070366b16ccae5f45ac3857615a0574aa

## Changes
- L1: standing-design.md, the spine runs in the consumer's own suite inside the full verify. shapes.md, a leaf proof never adds its command to `checks`. New standing-design line: tests read the source they check, never a hand-copied list of its entries.
- L2a: src/phase.ts, the `check.repair` -> `merge` move needs a green leaf receipt for HEAD. check-issue :91, B runs `akrogon verify` after repairs. Documented in README, src/AREA.md, setup.md.
- L2b: "replays the exact rejected command" becomes "reruns the reproducing command of the rejected run" in implement-issue :65 :80 :86, check-issue :69 :91, plan-issue :63, setup.md :54, phases.md :94, skills/AREA.md :24, init-akrogon :20. implement-issue :80 defines it: the narrowest command using the recorded runner that is red on the rejected head, else the whole recorded command; report.md records it red before and green after.
- L3: src/flaky.ts + `akrogon flaky`, README row, docs/guide/files.md section, chart-issues Open runs it beside LESSONS.md.

## Proof
- tests/receipt-gates.test.ts "a repair move into merge needs a green leaf receipt for HEAD": green; red with src/phase.ts reverted (1 fail).
- tests/flaky.test.ts: listed pair plus red-red, green-only, other command, setup-failed and unfinished cases not listed; prefixed `script | (fail)` lines parsed.
- Real data, framework: `akrogon flaky` prints
  `1 2026-10-14T19:50:12.101Z verify (unnamed)`
  `1 2026-10-14T17:49:23.309Z cheap SIGTERM and a normal exit that skipped closeBrowser leave no browser and no runtime dir`
- Gates: prettier check clean, tsc clean, `bun test --timeout=30000` 828 pass 0 fail (98 s).

## Limits
- Logs of runs whose leaf folder moved anywhere but issues/closed show `(log gone)`.

## Repair round 1 (slots/review-B-1.md)
- F1: commit dba0c5c carries Test-Change trailers for tests/command-reference.test.ts and tests/receipt-gates.test.ts. direct-guards now passes the citation check and stops only at the missing merge receipt, which landing writes.
- N1: docs/guide/files.md says a flip shows inconsistency and names no cause.
