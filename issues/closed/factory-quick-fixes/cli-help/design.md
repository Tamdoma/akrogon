# Design: cli-help

## Binding decisions, verbatim

### Signposts (issues/chart/factory-wins/forks/signposts.md), operator, 2026-11-10T09:55Z: `1a | 2c | 3a | 4a | 5b | 6a | 7a |`

- 1a: fewer parts first, then the operator's time, then clock time, then tokens.
- 2c: no win may remove the second-seat review, clean-checkout checks before a merge, the operator's approvals, the decision record or any current chart-door step.
- 3a: a win is charted only with a number from the factory's own records showing today's cost.
- 6a: changes land in akrogon only.
- 7a: earlier decisions stay binding and reopen only when the operator names one.
- 4a (small wins first) and 5b (one bounded paid run) order the session and bind nothing inside this leaf. No paid call and no live change belongs to this leaf.

### Contracts of the quick fixes (issues/chart/factory-wins/forks/contracts.md), operator, 2026-11-10: "1a, 2a, 3a,"

- Question 1: 1a. Help and the unknown-flag error are built from the option data the parser declares, plus existing usage lines; no hand-written help text. Binding mechanisms: only the unknown-option error and the `timing --since` form error are formatted, every other error propagates unchanged; help prints on stdout and exits 0; argument errors print on stderr and exit 1; arguments after `--` belong to the child command; the help and argument-error path finishes before `migrateStateHome()` and needs no registered repo or live session; `--help` together with an unknown flag exits 1 on the unknown flag; no `-h`, no `help` verb, no descriptions or examples; both `--since` forms stay as designed. Foreclosed: verb-list-only help, hand-written usage per verb.

```text
today                          with 1a
$ akrogon seat --help          $ akrogon seat --help
TypeError: Unknown option      akrogon seat
  '--help'                       --slot --harness --model
  ... 12 more lines              --effort --task
  of error text
```

- Excluded from this leaf: question 2 (the transcript-read change is dropped), question 3 (the implement-issue reference change belongs to the `shared-rules` chart), and the verify-survival proof, which the sibling leaf `survival-test-wait` owns.

### Earlier decision kept (issues/closed/issue-flow/issue-flow-report/brief.md, criterion 1)

`akrogon timing --flow --since <YYYY-MM-DD>` and `--cohort --since <iso>` are the designed forms. This leaf changes neither form, only what a wrong form prints.

## Standing design

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md. Interpretation: every criterion is behavior at the CLI boundary, so its proof is a real invocation of the command with exit code, stdout and stderr judged, as tests/guard.test.ts and tests/timing-report.test.ts do today. Criteria 1 to 3 and 5 are new behavior, each shown by one deliberate break turning its proof red; criterion 4 fixes an observed failure and is shown failing on the base and passing after. The proof of criterion 1 reads the verb list and the flag declaration from the source and asserts the property (each verb answers, each declared flag is printed, each printed flag is accepted); it keeps no hand-copied list of verbs or flags. The layout of the help text is not asserted, only its content. Criteria 6 and 7 are negatives written here at charting; where an existing test already shows one, it is kept and not duplicated. No machinery is built, no model or outside call is made, and no secret is involved.

## Leaf architecture

- Owned surfaces: src/akrogon.ts (the argument boundary: the option declaration, the `parseArgs` call, the `timing --since` parses and the default usage error), a small helper module beside it if the plan wants one, src/guard.ts and src/run-check.ts only so far as each one's existing `Usage:` string becomes one value read by its present error path and by help, with their command behavior unchanged (A,B), and the CLI tests that show the criteria. Documentation that lists command usage (the README command table, docs pages checked by tests/command-reference.test.ts) changes only where it states the behavior this leaf changes.
- Today, read 2026-11-10 at 63526537: `await migrateStateHome()` runs first; `verb` is `process.argv[2]`; `options` is one ternary chain keyed by verb; one `parseArgs({ args: process.argv.slice(3), options, allowPositionals: true, strict: true })` follows; `timing` parses `--since` with `z.iso.datetime()` for `--cohort` and `z.iso.date()` for `--flow` and already builds the usage string `Usage: akrogon timing <slug> | --cohort --since <iso> | --flow --since <YYYY-MM-DD>`; an unknown or missing verb throws the verb-list usage error. `Usage:` lines also exist for `pack` and `stop` in src/akrogon.ts, in src/guard.ts and in src/run-check.ts.
- Literal interfaces: help goes to stdout with exit 0; the two argument errors go to stderr with exit 1; neither holds a stack trace or code frame. The flag is `--help` only. Text layout is free. The verb list printed by `akrogon --help` is the list the default usage error prints today.
- Order changed: the help exit and the two argument-error exits happen before `migrateStateHome()`. Consumer: every verb's own work relies on the migration having run. Decision: a successful parse still reaches `migrateStateHome()` before any verb work, so no verb sees an unmigrated state home; only the three new exits precede it. The retired-verb refusal (`unhold`, `hold-fix`) keeps its message.
- Error scope: only the parser's unknown-option error and the `--since` schema failure are caught and formatted, by their specific error type; no handler wraps the verb dispatch. Consumers that read akrogon's stderr or exit code for other failures (`run-check`, the listener, seats quoting errors) see those failures unchanged.
- `--` ownership: `run-check` passes everything after `--` to the child command through positionals today; the help check looks only at akrogon's own arguments before `--`.
- Known limit, accepted with option 1a: the declaration holds flags, not positional arguments, so help shows a verb's positional shape only where a `Usage:` line already exists. Writing new usage lines is foreclosed.
- Open for the plan: whether the verb list and the option declaration become one shared constant so help, parser and usage error read the same data; where the shared `guard` and `run-check` usage values live, with no runtime reading of source text and no deliberate invalid call to obtain them (A,B); whether the verb list's omission of `verify-pass` (dispatched in src/akrogon.ts, absent from the list) is deliberate, with public verb membership left as it is either way; how a verb with no declared flags prints; which doc-phrase assertions in tests/command-reference.test.ts and tests/docs-links.test.ts touch the changed lines.
