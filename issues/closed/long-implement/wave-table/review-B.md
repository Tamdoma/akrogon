# Review B: wave-table

Verdict: ready. No Fixes or Nits.

Base: `2dd1106554851d48ef7c15a4aade9074deea96dc` (effective `AKROGON_BASE`).
Reviewed head: `a055f6417629f2d6b79fa9f870303a7d2f2bdf18`.
The report's original base `2b796e98a2da6f914332e736974b93a0bc645715` precedes the operator's TMPDIR test fix; the report explains that history. The reviewed diff contains only the six owned prose files, with a clean worktree.

Debate was off. No positions-B.md or rebuttal-B.md exists. Initial review was conducted without reading the peer's review or contacting the peer.

## Verification

- V1. Criterion 1 and D2-D4: `skills/plan-issue/SKILL.md:55` records owned paths, shared test resources (including live fixtures/accounts/sites), prerequisite units, the cap of 3, same-wave independence and later-wave placement. A landed common prerequisite permits its consumers to share the later wave.
- V2. Criterion 2 and D5-D8: read the complete implement skill, worker protocol and brief template. They require whole-wave launch and collective wait, record the three exclusion reasons, group older plans from sub-brief records, preserve plan values for grouped plans and specify inline wave/list order. `rg -n -F 'one at a time when unsure' skills docs` and `rg -n -F 'ordered checklist' skills docs` both return no matches (exit 1).
- V3. Criterion 3 and D9: the check.fix paragraph applies the same grouping rule to repair sub-briefs while preserving inline and final-round self-repair. The referenced rule retains prerequisites and the cap of 3.
- V4. Criterion 4: opened the unchanged reference index and complete phase guide, then checked all wave/prerequisite references under skills and docs. The guide and skills area describe the changed behavior consistently. One root-based shell listing checked every path named by `skills/AREA.md`: all full paths exist. Its `scripts/observe.ts` shorthand belongs to the immediately named watch-issues skill and resolves to the existing `skills/watch-issues/scripts/observe.ts`; no changed dead pointer was found. Index targets remain unchanged.
- V5. Criterion 5: reused the implementation report's passing evidence at this exact head: format exit 0 (1s), typecheck exit 0 (1s), full tests 353 pass/0 fail (79s), resolved changed tests 148 pass/0 fail (63s). No code changed, missing check evidence or specific check concern warrants rerunning them. No prose assertion test was added, as required by the design.

Concrete contract trace: this leaf's plan puts disjoint U1/U2/U3, with no shared resource or prerequisite, in Wave 1. The new instructions launch those three together and wait for all. U4 depends on all three and remains in Wave 2. Shared paths or a shared live fixture exclude a unit from the conflicting wave. Older plans obtain those same decisions from their existing sub-brief records. Inline execution follows the wave and listed order.

The cited lesson histories `2026-10-01-failed-stop-guard-wording.md` and `2026-09-11-stale-rule-in-docs.md` support avoiding prose assertion tests and searching affected human docs. No new reusable lesson was found.

## Findings

None. The diff implements the brief and locked design without code, state, clocks, new record fields or changes to the proof-order sentences. Report evidence is sufficient for this prose-only change.

## Merge verification

Rebase target and refreshed AKROGON_BASE: `69059045bd1bf7f675e7a8c171b99d47b696d948`.
Prior reviewed head: `a055f6417629f2d6b79fa9f870303a7d2f2bdf18`.
Rebased head: `5cd4038aff43fdd6a5523e122bf4528f7057d7ef`.

The rebase completed without conflicts. `git range-diff 2dd1106554851d48ef7c15a4aade9074deea96dc..a055f6417629f2d6b79fa9f870303a7d2f2bdf18 69059045bd1bf7f675e7a8c171b99d47b696d948..5cd4038aff43fdd6a5523e122bf4528f7057d7ef` marks all three patches unchanged (`=`). The integration diff remains the six owned prose files. Both reviews allow merge. B holds no reusable Nit.

- M1. `bun run format`: exit 0, all formatted files unchanged.
- M2. `bun run typecheck`: exit 0.
- M3. `bun test`: exit 0, 353 pass/0 fail, 4,122 assertions across 15 files (78.14s). Full output: `/var/tmp/akrogon-1000/wave-table-db8355545e69/tmp.9QjDGAqIdP/test.log`.
- M4. Resolved `test_changed`, using the refreshed base: exit 0, six changed prose files and no affected tests, 0 pass/0 fail (9ms). Output: `/var/tmp/akrogon-1000/wave-table-db8355545e69/tmp.9QjDGAqIdP/changed.log`.

No merge_checks or advisory commands are configured. The worktree is clean after checks. Gathered both completion-owner briefs (wave-table and proof-order under long-implement) before completion can move the folder.

`git push origin HEAD:main` succeeded fast-forward from `6905904` to `5cd4038`. The remote-tracking main points to the rebased head, and the ancestor check exits 0. Push confirmed before marking merged.
