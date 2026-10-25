# Review A — suite-refusal

Base: 68f1b19d. Reviewed head: a47dbdb. Verdict: ready.

## Findings

None blocking.

- F1 (Nit): `runCheck`'s matcher adds `argv.join(' ') === t` beside the design's token-equality form. It is a superset of form 1 — it also refuses a `merge_checks` text whose argv tokens differ in internal quoting (e.g. a multi-space or quoted variant that joins to the same string). Consequence today: none; the wrongly refused argv is a merge_checks entry either way and the printed hint applies. Deferred: tighter tokenization belongs to a defect that misroutes a real command, which none of the three forms produces.
- F2 (Nit): `parse(t)` comment tokens (`# ...`) map to `''`, so `['a','']` would match entry `a # c`. A zero-length argv arg is not a real invocation; no reproduction from a real source. Stays a Nit.

## Verification evidence

- src/run-check.ts: refusal placed after `requireRepo`, before `leafTarget`/`checkedRun` — exits non-zero before any spawn; stderr names `akrogon verify --attempt <id>` and a narrower command (criterion 1).
- Matcher covers all three forms; `checks`/`advisory` untouched (criteria 1–2). `verify`'s `checkedRun` calls bypass `runCheck` — locked shape holds.
- src/config.ts `withSetup`: merge_checks map to literal `akrogon verify --attempt <id>` (criterion 3).
- Skills: implement-issue :67/:82/:88, check-issue :69/:93, merge-issue :79 all name the refusal and the narrowest-failing-command rule (criterion 4). docs/checks.md, config.md, commands.md updated; commands.md invocation cell unchanged so command-reference still holds.
- No `--scope merge` anywhere: `grep -rn 'scope merge' src/ skills/ docs/ tests/` empty.
- AREA.md paths listed exist (src/run-check.ts, config.ts, verify.ts, phase.ts, shell.ts).
- Report claims match live output: crit1/crit3/crit4 logs green at a47dbdb; `verify leaf a47dbdb: green`; full test suite 1138 pass; format/typecheck green.

## Verdict

ready.
