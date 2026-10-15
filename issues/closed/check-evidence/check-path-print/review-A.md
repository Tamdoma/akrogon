# Review A: check-path-print

Base f3557d8, reviewed head e6350fc (a998331 tests, 3830dda product, 6e07fdc skills, e6350fc format).

## Done-criteria

1. `check <n>: <exit> <kept path>` on its own stderr line — `runCheck` prints after `checkedRun` returns, `\n` prepended when the command's stderr did not end in a newline; `verify` keeps destructuring `code`/`log` and ignores `stderr_final_nl`. Live evidence: criterion test `run-check prints check name, exit and kept path on its own stderr line` passes on e6350fc (`akrogon run-check --name check-path-print -- bun test tests/run-check.test.ts`, 20 pass); unterminated stderr (`printf tail >&2`) leaves `check` at line start via the `/^check probe: 7 …$/m` anchor, and run-check's own exit passes the command's 7 through. Held.
2. Skill lines — all six files carry the rule, `akrogon log` reader and the three exemptions; check-issue's standalone section names `--holder <chart>/direct`; implement-issue keeps standalone outside the rule. Skill-text test passes on 6e07fdc+. Held.

## Checks and tests

- `akrogon verify` on e6350fc: green (format, test 847 pass, typecheck). An earlier verify on 6e07fdc was red on prettier over src/run-check.ts; fixed by e6350fc and re-verified.
- Test order: a998331 committed the two new cases red-first before product code, each with the required trailer; the anchor updates carry `Test-Change` trailers citing real output. New tests exercise the real CLI boundary; no mocks.
- Anchor updates to whole-stderr expectations match the new line, per the design's stated change.

## Findings

Fix: none.

Nit: the skill rule text cites `akrogon log <path>` as the reader, and that verb does not exist on this branch — it is delivered by the open sibling leaf `log-reader` in the same chart. Deferred because the design assigns the reader reference to this leaf's lines and the reader itself to that leaf; promoted to a Fix only if `log-reader` is dropped or redirects the reference.

Docs: no documented run-check stderr contract existed outside the touched skill files; no AREA.md or guide page went stale. One line: no documented behavior changed beyond the six skill files.

## Verdict

ready
