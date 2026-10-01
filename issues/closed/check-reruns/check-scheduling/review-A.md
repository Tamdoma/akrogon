# Review A: check-scheduling

Base: `9ea5dd0ae720970b37e0175d7b109c913d29a242`
Reviewed head: `af8d3639047a5ee0ddf0bba9019248744639cc9a` (ahead of base, `git status --short` empty at review time; matches report head, so report evidence applies).
Verdict: `nits`

No debate artifacts exist; `debate: no`, expected. Worked blind; peer review not read.

## Criterion checks (all live-verified)

1. `grep -rn "full suite\\|full-suite" skills docs/guide` returns only `brief-template.md:39` (forbids substituting a full suite for targeted tests) and `init-akrogon/SKILL.md:20` (slow full-suite commands belong in `merge_checks`). Both are correct uses the brief allows; neither requires a run after implement or repair. `docs/` has zero hits.
2. `SKILL.md:48` and `:62` both state all six 2a parts (criterion proof, changed tests with affected consumers, every `checks` command, unchanged evidence reused, `merge_checks` only at merge, whole-run exception via a criterion). `grep -c "a full-suite rerun follows a repair"` returns 0; the `checks` blocks / `advisory` Nits clause is kept. `:42` and `:34` rewritten, no `full suite` left in the file.
3. `shapes.md:132` excludes a `merge_checks` command and repo-health claims; `:170` refuses a criterion citing `merge_checks` or claiming repo health outside leaf ownership and gates repo-wide `checks` on a named property no smaller test proves; `blocked-by` / operation-proof clauses untouched. `grep -rn "gets it added to" skills/ docs/` exits 1.
4. `AREA.md:22`, `phases.md:91`, `merge.md:3` mirror the same schedule read in the diff. `git diff --exit-code 9ea5dd0..HEAD -- skills/merge-issue/SKILL.md skills/check-issue/SKILL.md skills/init-akrogon/SKILL.md src tests` is empty.
5. Report pastes green `bun run format`, `bun test` (342 pass, 0 fail, 77s wall), `bun run typecheck`, and `tests/docs-links.test.ts` + `tests/command-reference.test.ts` (7 pass). Head matches and tree is clean, so no rerun trigger; no checks rerun. Diff touches no markdown links, so no new link risk.

## Contract and scope

- Plan D1–D9 all hold: 7 prose files, 14/14 line diff, term rule kept, no new tier name, no vanity test (correct per check-issue:45), exclusions byte-unchanged.
- `skills/AREA.md`: 30 lines, exactly the 4 required `##` sections.
- Concrete scenario (emdash-conversion): new `:48`/`:62` require proof plus `checks` with reuse instead of a blanket rerun, `:52` no longer forces one, and the new audit would refuse a C1 citing a `merge_checks` suite or claiming repo health, or demand the named property for a repo-wide `checks` command. Rules hang together.
- Extra sweep: `grep -rn "full run\\|whole suite\\|entire suite" skills/ docs/guide/` hits only `standing-design.md:12`, which the design keeps unchanged as consistent with 2a. No other seat rule requires a whole run.

## Nits

- N1 backtick variance: `SKILL.md:34` (`checks sub-brief`) and `worker-protocol.md:11` (`checks and akrogon phase`) use plain `checks` where sibling lines use `` `checks` ``. Reproduction: read the cited lines. Deferred because meaning is identical and no criterion requires backticks; already disclosed in the report. Promotes to Fix on evidence a seat misread the scope because of it.
- N2 pre-existing dead pointer: `skills/AREA.md:15` names `scripts/observe.ts`; `scripts/` exists nowhere (main checkout, worktree, or any history: `git log --all -- scripts/observe.ts` empty). Reproduction: the one-command path listing plus `ls`. Deferred because this leaf did not touch that line (diff shows only line 22 changed), no criterion covers it, and no seat failure is in evidence. Promotes to Fix on evidence a seat failed by following that pointer, or owned by a leaf that touches that bullet.

## Lesson

None. No reusable mechanism found; the dead pointer is a single stale line, not a process failure.
