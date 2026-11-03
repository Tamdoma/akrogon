# merge-reuse, seat A (written before reading B, C, D)

## Q1 accept same-tree leaf receipt at merge
- Pick: accept. Reason: since 2026-10-26, 13 of 17 merge head runs re-tested a tree that already had a green leaf receipt under identical commands (`issues/verify-runs.jsonl`, A script 2026-11-01); median 70 s each; both red merge runs were those same-tree reruns, so the rerun's only observed effect was two flake aborts. Cost: loses a second flake sample per merge; `akrogon flaky` still learns flakes from every other red.
- Rejected: keep rerunning (pays 70 s per merge, flake aborts block land); a config knob (adds a mode).
## Q2 one rule
- Pick: delete `run.scope === scope` from every receipt filter (`greenRun`, `redRun`, `reuseSource`, `requireGreenReceipt`, `knownRedReceipt` heads) and let command text decide: `sameCommands` for whole runs, `greenEntry` name+command per entry. Scope then only selects which commands are expected (`verifyCommands`). Gate and lookup cannot disagree because neither looks at scope. Removes code.
- Pitfall: the 2026-10-25 bug was a partial edit; removed by doing all filters in one diff and an end-to-end test through the gate. Pitfall: `slowChecked` reads `scope === 'merge'` runs; reuse writes no merge run, so the slow normal gets only real runs, which is correct.
## Q3 proof
- One end-to-end test: leaf verify green on tree T, merge verify on T prints reuse and runs no command, and the merge gate (`requireGreenReceipt(..., 'merge')`) accepts; plus a changed command set (a `merge_checks` entry) still runs the merge-only command. Rewrite 5d0b505f's expectation rather than add a parallel test.
