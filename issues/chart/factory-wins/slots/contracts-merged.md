# Contracts of the quick fixes, merged (2026-11-10)

Merged by A from slots/contracts-A.md and slots/contracts-B.md, written blind to each other. Picks agree on all three questions.

## Question 1: help and mistyped flags

- 1a (A,B) Help and the unknown-flag error are built from the option data the parser already declares, plus existing usage lines. Reason: one fix for the whole class with no second hand-kept description. Cost: one handler at the argument boundary.
- 1b (A,B) rejected: a verb list does not give the flags of `run-check`, `phase`, `verify` or `seat`, the verbs asked most, and other unknown flags keep the stack trace.
- 1c (A,B) rejected: a hand-written line per verb is a new maintained copy.
- Evidence:
  - (A,B) src/akrogon.ts: one strict `parseArgs`, options per verb, no help option; `akrogon <verb> --help` fails as an undeclared option; root `--help` becomes the verb and reaches the default usage error, exit 1.
  - (A) Transcript files holding `Unknown option '--help'` since 2026-10-25: 116 of 676 pi sessions, 19 of 482 codex, 39 of 912 claude; 469 files all time that also name akrogon. Most asked: `run-check --help` 359 occurrences, `phase` 89, `verify` 70, `config` 30, `log` 29 (text occurrences; file counts are firmer).
  - (B) 2026-11-08 to 2026-11-10, this survey excluded: 23 distinct tool results with 25 failed `--help` diagnostics (15 on 11-08, 8 on 11-09); one result is 14 lines, 746 characters. No time or dollar saving inferred.
  - (A) Other guessed flags with the same trace: `--compare` 25, `--leaf` 16, `--flow` 16, `--done` 12, `--base` 11 occurrences.
  - (A,B) `timing --since`: flow takes `<YYYY-MM-DD>` and cohort `<iso>` by design (issue-flow-report brief); both forms stay. The defect is the ZodError dump where the existing usage line should print. (B) found no bad flow date outside this survey, so no recurring cost is claimed for that subcase.
  - (B) practitioner: Command Line Interface Guidelines, https://clig.dev/#help (Docker Compose co-creators and others): subcommand help, meaningful exit codes, separate output and error streams. Node `util.parseArgs` documentation: strict parsing owns unknown-option rejection. Not read by A.
- Pitfalls and what removes each:
  - (A,B) A catch-all that turns product failures into usage text: only the known argument errors (unknown option, `--since` form) are formatted at that boundary; every other error propagates unchanged (done-criterion).
  - (B) Streams and codes: help on stdout with exit 0; argument errors on stderr with exit 1 (done-criterion).
  - (B) `--` ownership: in `akrogon run-check --name proof -- tool --help` the last flag belongs to the child command and is not taken as akrogon's help (done-criterion).
  - (B) Help that does work: `migrateStateHome()` runs before argument handling today; the help and argument-error path finishes before it and needs no registered repo or live session (done-criterion). (A) `akrogon stop --help` stops nothing.
  - (B) `--help` together with an unknown flag: settled explicitly so strict rejection is not weakened (open for the round: A proposes the unknown flag wins, exit 1).
  - (A) Help drifting from the real flags: both come from the same declaration.
  - (A) The verb list omits `verify-pass`: an `Open for the plan` line, public verb membership is kept as it is (B).
- Open questions: none beyond the mixed case above. No `-h`, no `help` verb, no descriptions or examples (A,B).

## Question 2: the transcript-read change (W4)

- 2a (A,B) Drop it from this chart. Reason: the measured cost is too small to notice, and the suffix read adds handling at the operator-input safety boundary.
- 2b (A,B) rejected for now: the right first step if a cost ever shows, one metadata call.
- 2c (A,B) rejected: positioned-read and short-read handling for a fraction of a millisecond.
- Evidence:
  - (A) Largest transcript on the host, 60,441,186 bytes: `readFileSync` 14.3 ms average over 5 runs, `statSync` 0.005 ms.
  - (B) A real reset transcript, 4,328,919 bytes, 200 warm runs: `transcriptEnd` median 0.163 ms, 95th percentile 1.050 ms; `transcriptRecords` at its recorded boundary median 0.211 ms.
  - (B) 13 distinct real reset boundary records between 2026-11-08 and 2026-11-10 (31,223,780 boundary bytes), one boundary read and one suffix check per reset. (A) had found no `door-reset.log` under this repo's charts and read that as no recorded handover; B's count across repos corrects it.
  - (A,B) Only caller: skills/chart-issues/scripts/door-reset.ts.
- Pitfall: a cost that grows later or shows only on a cold cache. Removed by keeping both measurements and their limits in the fork; revisit on a recorded slow or failed reset, 2b first (B).

## Question 3: the implement-issue reference change (W5)

- 3a (A,B) `shared-rules` owns it. Reason: it edits the opening re-read sentence that chart rewrites, so one owner and one edit.
- 3b (A,B) rejected: lands sooner but edits the same sentence twice.
- Evidence:
  - (A) skills/implement-issue/SKILL.md line 6 requires re-reading the file and its references at every phase prompt; line 14 already makes brief-template.md and worker-protocol.md conditional. The contradiction is between two rule sentences.
  - (B) 27 implement and check.fix prompts between 2026-11-08 and 2026-11-10; in the 8 available sessions, four reference-read calls, one demonstrably unneeded: watcher-on-hc read worker-protocol.md (1,104 words) although its plan is serial-solo. The full 2,035 words per prompt is not an observed cost.
  - (B) practitioner: Fowler on Beck's design rules, https://martinfowler.com/bliki/BeckDesignRules.html. Not read by A.
- Pitfall: the correction lost in the move. Removed by naming the transfer in this fork's Taken and in `shared-rules` INTAKE and Fog: the contradiction between the opening blanket re-read and the conditional reference reads, with the delegation-point read kept, repairs that delegate included; not a broad exemption from fresh phase reads (B).

## Result

Two leaves, parallel, no dependency: the CLI help and argument-error fix (W1) and the verify-survival test wait (W2). W2 carries no question (verify-lifetime Taken point 4).

## Where the slots differ

Nowhere on the picks. One point is open between them only because B raised it and A answered after merging: the mixed `--help` plus unknown flag case.
