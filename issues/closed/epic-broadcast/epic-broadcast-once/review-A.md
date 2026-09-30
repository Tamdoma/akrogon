# Review A: epic-broadcast-once

Base: `147dcb33c8c5ae826cff3b74be212d120e0ba913`. Reviewed head: `6ea82d10769354c75411bc43e951d6a98bb36fef` (3 commits ahead, worktree clean).

## Findings

No Fixes. No Nits.

## Criterion check

1. Epic two-issue scenario: inner merges assert exact `moved merged`, final asserts exact `moved merged\nepic complete epic`. Passes.
2. Concurrent final leaves of one completion owner: standalone race asserts exactly one `moved merged\nissue complete standalone` and one bare `moved merged`. Same lock-serialized code path serves epic owners. Passes.
3. Standalone unchanged: covered in the completion test; `tests/next.test.ts:844,1007` untouched, full suite green per report. Passes.
4. Recovery silence: retry and `next` paths assert neither line; repeated `merged` refused with no `complete`. Passes.
5. Source closure: diff shows only stdout expects changed; all close/view asserts intact. Passes.
6. Merge skill triggers on `issue complete` or `epic complete` and gathers the completion owner's briefs before the move. Passes.
7. All five wordings describe one broadcast per standalone issue or epic; live grep sweep shows no line claiming an inner issue broadcasts (`chart.md:203` is source-closure prose, a substring hit). Passes.
8. Report shows format clean, typecheck exit 0, full suite 339 pass; rerun below confirms the phase suite on the reviewed head. Passes.

## Contract and scope notes

- `src/phase.ts` delta is exactly the designed move: print after the completion guard, `basename(owner)` with the issue/epic word. Closure order, folder move, `justMerged` callers untouched.
- Diff is exactly the 8 planned files; no `src/next.ts`, sender, `gh` stub, `AREA.md`, or `issues/` changes. Design exclusions hold.
- Stdout asserts are fixed references consumed literally by the merge-issue skill; tests use real `cli(...)` invocations with the `gh` fake at the one boundary. No mocks of the unit under test.
- `docs/guide/merge.md` claims (standalone line, epic line, inner silence, one broadcast per standalone/epic) match the implemented behavior.

## Verification evidence

- `git status --porcelain` → empty; `git log` base..head → 3 commits.
- `bun test tests/phase.test.ts` on the reviewed head → 37 pass, 0 fail, 316 expects, 6.10s.
- `grep -rn "issue complete" docs skills README.md` and `grep -rn "epic complete" docs skills README.md` → only the standalone example, gated skill triggers, and the out-of-scope `chart.md:203` source-closure line.
- Full suite, format, typecheck evidence taken from `implementation/report.md` (339 pass, 1m22s); no rerun beyond the phase suite, which covers the changed behavior.

## Verdict

`ready`
