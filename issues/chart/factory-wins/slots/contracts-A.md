# Fork notes, slot A: contracts of the quick fixes (2026-11-10)

Written before reading slots/contracts-B.md. "reader" = Haiku reader report of 2026-11-10; "checked" = A ran the command or read the lines.

## Question 1: help and mistyped flags

- Pick: 1a. Reason: it removes the whole class (any unknown flag, `--help` on any verb, a bad `--since` value) with text the code already declares, so nothing new has to be kept in step. Cost: one specific handler around the single `parseArgs` call and the two `--since` parses.
- Rejected 1b: it fixes `--help` only; the other guessed flags keep the stack trace (`--compare` 25, `--leaf` 16, `--flow` 16, `--done` 12, `--base` 11 occurrences, checked by grep over the three transcript stores).
- Rejected 1c: 33 hand-written usage lines are a new stock to maintain (signpost 1a, fewer parts) and repeat what the options map already states.
- Evidence (better-than-training, this repo, 2026-11-10):
  - src/akrogon.ts:73-78 is one global `parseArgs({... strict: true})`; options are built per verb at :29-71; no `help` option exists (reader; A saw the crash on `akrogon seat --help`, exit 1, `TypeError: Unknown option '--help'`).
  - Transcripts holding `Unknown option '--help'`: 469 files all time that also name akrogon; since 2026-10-25, 116 of 676 pi sessions, 19 of 482 codex sessions, 39 of 912 claude sessions (checked, `grep -rl` over ~/.pi/agent/sessions, ~/.codex/sessions, ~/.claude/projects). Verbs asked most in pi and codex: `run-check --help` 359, `phase --help` 89, `verify --help` 70, `config --help` 30, `log --help` 29 (checked, `grep -rho 'akrogon [a-z-]* --help'`). Counts are text occurrences, so a quoted error counts again; the file counts are the firmer number.
  - `timing --since`: src/akrogon.ts:277 parses cohort with `z.iso.datetime()`, :279 parses flow with `z.iso.date()`; the usage string at :264 already names both forms; the flow form is by design (issues/closed/issue-flow/issue-flow-report/brief.md criterion 1). So the defect is only the ZodError dump where the usage line should print. Under 7a the two forms stay.
  - Tests at the CLI boundary exist: tests/guard.test.ts:68, tests/timing-report.test.ts:669 "flow report: usage errors name the three timing forms", tests/command-reference.test.ts (reader).
- Pitfalls and what removes each:
  - A catch-all that hides real errors: the handler matches only the parse error for an unknown option and the `--since` schema failure; every other error keeps its trace (done-criterion: an unrelated thrown error still exits non-zero with its message).
  - Help text that drifts from the real flags: the text is derived from the same options map the parser uses, so it cannot differ.
  - A seat reading `--help` as success of the verb: `--help` runs nothing of the verb (done-criterion: `akrogon stop --help` stops nothing).
  - The verb list at :341 omits `verify-pass`, which is dispatched at :327-331 (reader). Whether that is deliberate (an internal verb) is an `Open for the plan` line, not a change.
- Question the fork does not ask: should `akrogon help <verb>` exist too? No: one form is enough.

## Question 2: the transcript-read change (W4)

- Pick: 2a, drop. Reason: the cost today is below anything a seat or the operator can notice. `readFileSync` of the largest transcript on this host (60,441,186 bytes) takes 14.3 ms on average over 5 runs; `statSync` 0.005 ms (checked with bun). `transcriptEnd` and `transcriptRecords` have no caller in `src`; the only caller is skills/chart-issues/scripts/door-reset.ts:80 and :90, the door handover helper (reader). No `door-reset.log` exists under issues/chart (checked, `find`), so no handover has been recorded in a chart. A leaf through plan, implement, review and merge costs far more than it would ever save.
- Rejected 2b: a one-line change, harmless, but still a whole leaf for 14 ms on a path with no recorded run. It can ride with the next leaf that edits src/transcript.ts for another reason.
- Rejected 2c: the suffix read adds code (open, seek, partial read, the agy branch) and a short-read risk on the late-operator-input refusal (door-reset.ts:89-93) for no measurable gain.
- Evidence tier: better-than-training, measured on this host 2026-11-10.
- Pitfall: dropping a real cost that grows later. Removed by the record: the measurement is in the fork, and transcripts would need to grow about 70 times before the read reaches one second.
- Question the fork does not ask: none.

## Question 3: the implement-issue reference change (W5)

- Pick: 3a, build it in `shared-rules`. Reason: the sentence it edits is the re-read rule ("At every phase prompt, re-read this file, its references…", skills/implement-issue/SKILL.md:6, checked), which is one of the shared lifecycle rules `shared-rules` gives one source (W7) and then scopes to the step (W8). Editing it here and again there is the same sentence changed twice by two leaves. Line 14 already makes the two references conditional ("brief-template.md when writing a brief, and worker-protocol.md when delegating or validating a worker return", checked), so the contradiction is between two rule sentences, which is exactly the W7 subject.
- Rejected 3b: lands a little sooner, but its cost today is not measured. 52 of 255 closed plans mention serial-solo (B, lower bound); whether those seats actually read the two files (2,035 words) is not shown by any record A has. Under 3a it is listed, not charted, until that number exists; `shared-rules` can measure it as part of its contract walk.
- Evidence tier: better-than-training (inspected skill text, 2026-11-10).
- Pitfall: W5 forgotten in the move. Removed by writing it into `shared-rules` INTAKE and Fog now.
- Question the fork does not ask: none.

## Result for the chart if all three picks hold

Two leaves, parallel, no dependency: `cli-help` (W1) and the verify-survival test wait (W2). The direct route is refused (more than one outcome), so the handoff goes to the lifecycle as one issue with two leaves.
