# Report: check-path-print

Base: dace0f7 (origin/main, refreshed during check.fix; prior base f3557d8, prior head e6350fc). Head: 0a80ab9 (rebased commits: 355728a tests red-first, 3d8e653 product, 07eedea skills, d4ea958 format; repair commits 8c65522 B's direct-holder line, 0a80ab9 direct-holder pin).

Serial-solo run (every plan wave held one unit); no workers.

## Changes and reasons

- src/run-check.ts: `runCheck` writes `check <name>: <code> <kept>` to stderr after `checkedRun` returns, preceded by `\n` when the command's stderr did not end in a newline (empty included); `checkedRun` returns `stderr_final_nl` derived from `result.stderr.endsWith('\n')`; run-check's own exit code is unchanged. `verify` destructures only `code`/`log` and ignores the new field.
- tests/check-names.test.ts:26, tests/run-check.test.ts:428: stderr anchors extended to cover the new `check` line (expectation change with a cited real output in each Test-Change trailer).
- tests/run-check.test.ts: new case — `printf tail >&2; exit 7` through run-check asserts code 7, `check probe: 7 <abs .log>` at stderr line start, and the kept log exists under the leaf `implementation/` with the command output.
- tests/run-units.test.ts: new case — the six listed skill files each contain the run-check rule, `akrogon log`, and the exemption tokens; check-issue matches `<chart>/direct`, implement-issue keeps standalone outside the rule.
- Skill files (rule + reader + exemptions per the locked line list): skills/implement-issue/SKILL.md (:27 new paragraph, retry and merge-repair paragraphs name run-check), skills/implement-issue/worker-protocol.md (worker keeping rule under Failure ownership), skills/implement-issue/brief-template.md (evidence section), skills/check-issue/SKILL.md (Shared context rule, retry/re-check/repair paragraphs cite run-check, standalone section names `--holder <chart>/direct`), skills/merge-issue/SKILL.md (Shared context rule, verify exemption note), skills/plan-issue/SKILL.md (:69 rule sentence).

## Done-criteria proof

1. `check <n>: <exit> <kept path>` on its own stderr line, exit unchanged — test `run-check prints check name, exit and kept path on its own stderr line`. Command `akrogon run-check --name check-path-print -- bun test tests/run-check.test.ts` on e6350fc: 20 pass 0 fail (with check-names). Red-first record in plan.md.
2. Skill lines state the rule, `akrogon log` reader, and exemptions — test `skills name the run-check keeping rule, its log reader and its exemptions`. Command `akrogon run-check --name check-path-print-skills -- bun test tests/run-units.test.ts -t 'run-check keeping rule'` on 6e07fdc: 1 pass 0 fail. Red-first record in plan.md.

## Checks

`akrogon verify` on e6350fc: green — format, test (847 pass 0 fail), typecheck all exit 0; logs under implementation/check-{setup,format,test,typecheck}-*.log. One earlier verify on 6e07fdc was red on format only (`src/run-check.ts` prettier); fixed by e6350fc.

## Notes

- Deliberate break was not needed beyond the red-first runs: the new tests failed at planning for the missing behavior (recorded in plan.md).
- Interpretation: empty command stderr also gets the leading `\n` (design reads "only when the last stderr byte was not a newline"); the anchors accept `\n+`.
- No README/guide/AREA.md stated the run-check output contract; no doc updated beyond the six skill files.
- No lessons recorded; no known limitations; no unverified criteria.

## check.fix (fix_rounds 1)

B's check.review found F1: implement-issue's Shared context rule named no `--holder <chart>/direct` for the direct route. B repaired the doc in 8c65522 (`Direct implementation follows the Shared context command-output keeping rule with the absolute <chart>/direct path as holder: akrogon run-check --holder <chart>/direct --name <label> -- <cmd> keeps logs there.`) and handed criterion 2's missing case to A.

A's repair: one case in the existing skills test (`implement-issue names the direct-route holder`, tests/run-units.test.ts:579), shown red against a deliberate break (holder line removed: `error: implement-issue names the direct-route holder / Expected to contain: "--holder <chart>/direct"`, log check-check-path-print-skills-…-*.log) and green after restore, committed as 0a80ab9 with a Test-Change trailer citing done-criterion 2. No other Fixes; no Handed-to-A plan corrections; no operator actions.

Refresh: branch rebased f3557d8 → dace0f7 cleanly during this pass (prior head e6350fc → rebased SHAs above).

Proof after repair, on 0a80ab9: `akrogon run-check --name check-path-print -- bun test tests/run-check.test.ts tests/check-names.test.ts` → 20 pass 0 fail; `akrogon run-check --name check-path-print-skills -- bun test tests/run-units.test.ts -t 'run-check keeping rule'` → 1 pass 0 fail; `akrogon verify` → green (setup, format, test 850 pass 0 fail, typecheck; logs implementation/check-{setup,format,test,typecheck}-*.log).
