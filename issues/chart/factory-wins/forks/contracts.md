# Contracts of the quick fixes

## Question

1. What do `akrogon <verb> --help`, `akrogon --help` and a mistyped flag print?
   - 1a Help built from what the code already declares: `akrogon --help` prints the verb list and exits 0; `akrogon <verb> --help` prints that verb's declared flags (and its usage line where one exists) and exits 0; an unknown flag prints one line naming the flag and the verb's declared flags and exits 1; a bad `timing --since` value prints the existing timing usage line and exits 1. No stack trace in any of these. No hand-written help text is added.
   - 1b Only `--help` is handled: it prints the verb list and exits 0. An unknown flag keeps today's stack trace.
   - 1c A hand-written usage line per verb.

2. Is the transcript-read change (W4) built?
   - 2a No. It is dropped from this chart.
   - 2b Only `transcriptEnd` changes, to file-size metadata.
   - 2c Both `transcriptEnd` (size metadata) and `transcriptRecords` (suffix read), as slot B's map proposed.

3. Where is the implement-issue reference change (W5) built?
   - 3a In the `shared-rules` chart, with the re-read rule it edits.
   - 3b Here, now, as its own small fix.

### Carries

- Signposts (forks/signposts.md): 1a 2c 3a 4a 5b 6a 7a.
- Split (forks/split.md, Taken 2026-11-10): this chart holds W1, W2, W4 and W5 of slots/map-merged.md; W3 is `dispatch-flake`; W7 and W8 are `shared-rules`, which the split places next and which rewrites the shared lifecycle rules, the re-read rule among them.
- Earlier decisions in reach: `issues/chart/verify-lifetime/forks/run-lifetime.md` Taken point 4 (the waiter waits for the pass service to exit; checkout removal can follow the receipt); `issues/closed/issue-flow/issue-flow-report/brief.md` (`timing --flow --since <YYYY-MM-DD>` is the designed form; `--cohort --since <iso>` the other). Under 7a both stay.
- W2 (verify-survival test waits for the pass service before asserting) carries no question: it follows verify-lifetime Taken point 4.
- Live surface: src/akrogon.ts, src/transcript.ts, skills/chart-issues/scripts/door-reset.ts, skills/implement-issue/SKILL.md, tests/run-units.test.ts, src/verify.ts.

## Findings

- Blind notes: slots/contracts-A.md, slots/contracts-B.md; merged with attribution in slots/contracts-merged.md; B's rebuttal slots/contracts-rebuttal-B.md: "no disagreement" (2026-11-10). Both slots pick 1a, 2a, 3a.
- Research, question 1: better-than-training, factory records read 2026-11-10: since 2026-10-25 the `--help` stack trace is in 116 of 676 pi sessions, 19 of 482 codex sessions and 39 of 912 claude sessions (A, file counts); 23 distinct tool results with 25 failed `--help` calls between 2026-11-08 and 2026-11-10, this survey excluded (B); most asked verbs `run-check`, `phase`, `verify` (A). Code: src/akrogon.ts, one strict `parseArgs`, no help option (A,B). Practitioner, read by B: Command Line Interface Guidelines, https://clig.dev/#help: subcommand help, meaningful exit codes, separate output and error streams. It changed the options: a verb-list-only help was demoted because the asked verbs need their flags.
- Research, question 2: better-than-training, measured 2026-11-10: whole-file read of the largest transcript on the host (60,441,186 bytes) 14.3 ms (A); a real reset transcript of 4,328,919 bytes, `transcriptEnd` median 0.163 ms, 95th percentile 1.050 ms over 200 warm runs (B); 13 real resets in three days, one boundary read and one suffix check each (B). It changed B's earlier map recommendation to drop.
- Research, question 3: better-than-training, skill text read 2026-11-10: skills/implement-issue/SKILL.md line 6 (blanket re-read of references) against line 14 (conditional reads) (A); one demonstrably unneeded read of worker-protocol.md, 1,104 words, in watcher-on-hc on 2026-11-08 (B). Practitioner, read by B: Fowler on Beck's design rules. It moved the change to the chart that owns the sentence.
- Binding mechanisms proposed for 1a (from the merged pitfalls): only the unknown-option error and the `--since` form error are formatted, every other error propagates; help on stdout exit 0, argument errors on stderr exit 1; arguments after `--` belong to the child command; the help and argument-error path finishes before `migrateStateHome()` and needs no registered repo; `--help` with an unknown flag exits 1 on the unknown flag (A proposed, B no disagreement); no `-h`, no `help` verb, no descriptions.
- Charting observations for the handoff (A, 2026-11-10, akrogon release 63526537, operator's local user, read-only, no cleanup needed):
  - `akrogon seat --help`: exit 1, `TypeError: Unknown option '--help'` with a code frame. `akrogon --help`: exit 1 with the verb-list usage error. `akrogon timing --flow --since 2026-10-25T00:00:00Z`: exit 1, ZodError "Invalid ISO date". `akrogon timing --cohort --since 2026-10-25T00:00:00Z`: exit 0, cohort report printed. Limits: shows the base behavior and the cohort form that stays; not the new output.
  - `sed -n 20,82p src/akrogon.ts`: `await migrateStateHome()` first, per-verb `options` chain, one strict `parseArgs`. `grep -n since src/akrogon.ts`: usage string at :264 names both forms; :277 `z.iso.datetime()`, :279 `z.iso.date()`. Limits: shows the declaration and order exist; not that help built from it is complete.
  - `akrogon log issues/chart/tasks-panel/direct/check-test-1793744593130-1258102.log`: `(fail) a verify pass survives its caller being SIGKILLed mid-check and finishes like an uninterrupted run`, at `expect(existsSync(receipt.path)).toBe(false)`, Expected false, Received true. `akrogon flaky`: 5 flips, latest 2026-11-08T07:48:55.432Z. Limits: kept records only, no rerun.
  - tests/run-units.test.ts: `waitInactive(unit, ms = 12000)` exists and is called as `akrogon-verify-${receipt.run}.service` in five other tests; the survival test polls the receipt and does not call it. src/verify.ts `runOnce`: receipt renamed into place, then `git worktree remove --force`. src/verify-pass.ts `passUnit`: `akrogon-verify-${id}`. Limits: shows helper and order; not that the wait turns the proof green.
  - Destination check: `akrogon pull` at the registered root: "0 open issues pulled"; `issues/seeds` holds nothing to compare. `akrogon status`: no open leaves. `akrogon preflight`: exit 0, origin/main 63526537. Slugs `factory-quick-fixes`, `cli-help`, `survival-test-wait` are free under issues/open and issues/closed. Readiness presence check on both drafts: `[]`.
  - Who edits the test in the lifecycle (read 2026-11-10): plan-issue's test-writing step writes and extends tests at plan.synthesis with the `Test-Change` trailer; implement-issue lets implement and check.fix write and edit no test outside three exceptions. The `survival-test-wait` design therefore places its test change at plan.synthesis.

## Taken

- Operator, 2026-11-10, verbatim: "1a, 2a, 3a,".
- Question 1: 1a. Help and the unknown-flag error are built from the option data the parser declares, plus existing usage lines; no hand-written help text. Binding mechanisms: only the unknown-option error and the `timing --since` form error are formatted, every other error propagates unchanged; help prints on stdout and exits 0; argument errors print on stderr and exit 1; arguments after `--` belong to the child command; the help and argument-error path finishes before `migrateStateHome()` and needs no registered repo or live session; `--help` together with an unknown flag exits 1 on the unknown flag; no `-h`, no `help` verb, no descriptions or examples; both `--since` forms stay as designed. Foreclosed: verb-list-only help, hand-written usage per verb.

```text
today                          with 1a
$ akrogon seat --help          $ akrogon seat --help
TypeError: Unknown option      akrogon seat
  '--help'                       --slot --harness --model
  ... 12 more lines              --effort --task
  of error text
```

- Question 2: 2a. The transcript-read change (W4) is dropped from this chart. Reason: the measured cost in Findings. Revisit only on a recorded slow or failed reset, metadata size first. Foreclosed: the one-line size change, the suffix read.
- Question 3: 3a. The implement-issue reference change (W5) is built in `shared-rules`. What transfers: the contradiction between the opening blanket re-read of references and the conditional reference reads, with the delegation-point read kept, repairs that delegate included; not a broad exemption from fresh phase reads. Foreclosed: fixing it here.
- W2 (the verify-survival test waits for the pass service before asserting) carries no question and follows verify-lifetime Taken point 4.
