# Review A: cli-help

Base: a33d967b5dd07829b81b9dd87802c8a72f8effbd. Reviewed head: 43a3d7a75ad7b1219ced4328618dad3f49fe131e. Verdict: nits.

## What I checked

- Whole diff a33d967b..HEAD against plan.md D1–D8, brief criteria 1–7 and the design's binding decisions.
- `src/usage.ts`, `src/akrogon.ts`, `src/guard.ts`, `src/run-check.ts`, `docs/reference/commands.md`, `tests/cli-help.test.ts`.
- `src/AREA.md` and `tests/AREA.md` for affected index pointers; `docs/reference/commands.md` for the changed behavior; grepped docs/README/skills for `--help`/usage claims — none stale.
- Verify receipt on head: format 0, typecheck 0, test 0 (`check-test-1794393077603-3928523.log`), no blocked entries.
- Live edge probes on head: `seat --slot --help`, `seat --task --help`, `--help extra`, `seat --compare=x`, `verify-pass --help`, `bogus --help` — all sane, exit codes consistent with the design's scope.
- `Test-Change:` trailer on 43a3d7a7 is the only test-matched change and carries its trailer (formatting only, no expectation changed); worker commits ae088dea and 36c76b13 touch no test paths.

## Criteria

All seven proven green by `tests/cli-help.test.ts` inside the verify `test` run on the head and by `check final-tests: 0`. The proof commands match plan.md; no planned test was skipped or filtered. The timing `--since` catch wraps only the `mode` parses, `timingCommand` stays outside, and the shape gate still throws `TIMING_USAGE` unchanged — matching the contract. `verify-pass` stays out of the verb list and gets no help, per the design's kept omission.

## Findings

### N1 — `VERB_OPTIONS` membership is not cross-checked against the dispatch's `case` labels

Reproduction: today `VERB_OPTIONS` (31 verbs incl. nothing extra) and the switch's `case` labels agree, verified by eye and by `command-reference.test.ts` green — but that test compares table rows to `case` labels, not `VERB_OPTIONS`. A future verb added to dispatch and forgotten in `VERB_OPTIONS` would leave `akrogon <verb> --help` exiting 1 while every criterion test stays green (the test iterates `VERB_OPTIONS` itself, so the missing verb is never exercised). Deferred because it is a coverage gap with no wrong behavior today and no realistic source. Evidence to promote: a commit that diverges the two sets, or review deciding verb-list membership deserves an assertion comparing `Object.keys(VERB_OPTIONS)` to the dispatched `case` labels, the same cross-check `command-reference.test.ts` does for the docs table.

### N2 — `src/AREA.md` does not mention `src/usage.ts`

Concern: the area index lists `src/akrogon.ts` as validating CLI arguments and dispatching, and now the flag declaration, `USAGE_LINES` and `helpText`/`verbFlags` helpers live in `src/usage.ts`. A reader learning the argument boundary from the index finds no pointer to it. Deferred because the file is five lines from `akrogon.ts`'s import list and the consequence is orientation, not correctness. Evidence to promote: a doc-completeness rule for helper modules in the area index, or a seat reporting it could not find the option declaration's home.

### N3 — `akrogon seat --slot --help` consumes `--help` as `--slot`'s value

Reproduction (live on head): `bun src/akrogon.ts seat --slot --help` exits 1 with `HC_TERMINAL_ID is not set` rather than help. `parseArgs` in strict mode lets a string option consume a following `--flag` token as its value, so `--help` never becomes `values.help`. Deferred because no criterion covers the flag-as-value position, the base errored identically, and the input asks for a slot value it then receives. Evidence to promote: a user or seat hitting this form expecting help, which would name a real source.

## Verdict

nits — all done-criteria proven, checks green, no blocking defect.
