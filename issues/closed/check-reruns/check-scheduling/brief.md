# Brief: check-scheduling

## What
Change the seat and chart rules so slow checks run only where they prove something:
- implement-issue: after the last unit and after every repair, A proves every done-criterion, runs the changed tests (including affected consumers) and every `checks` command, reusing unchanged evidence. `merge_checks` never run before merge unless a done-criterion itself names one whole-run property that needs it. The undefined "full suite" is replaced at `SKILL.md:34,42,48,52`, `worker-protocol.md:11,25,27`, `brief-template.md:37,39`.
- chart-issues: the audit in `assets/shapes.md:132,170` refuses a done-criterion that cites a `merge_checks` command or claims repo health outside the leaf's ownership, and allows a repo-wide `checks` command only when the chart names the property no smaller test proves. The sentence "a leaf needing a larger repo-wide command gets it added to `checks` first" is removed.
- Mirrors: `skills/AREA.md:22`, `docs/guide/phases.md:91` and `docs/guide/merge.md:3` state the same schedule (`checks` before review and after repair, `checks` then `merge_checks` at merge).

Observable outcome: no skill or guide page requires a seat to run an undefined "full suite", or to run `merge_checks` merely because implement or a repair ended; a whole run before review happens only when a done-criterion needs it (A,B). The chart audit refuses a repo-health criterion.

## Why
Tamdoma/akrogon#48. On framework leaf `emdash-conversion` a 15-minute repo-wide suite ran at least 6 times across seats and rounds, and the leaf spent most of a day in review and repair. The causes were a done-criterion naming that suite (C1 `framework:verify`, red on main for reasons outside the leaf) and `implement-issue/SKILL.md:52` forcing a full-suite rerun after every repair. `merge_checks` (5375dbe) already gives slow suites a merge-only home; the seat and chart rules do not use it yet.

## Done-criteria
1. The implementation report pastes `grep -rn "full suite\|full-suite" skills docs/guide` and judges each match by meaning: none requires an undefined full suite, or `merge_checks`, after implement or a repair except through a done-criterion that needs a whole run. Correct uses such as `brief-template.md:39` (do not substitute a full suite for targeted tests) and `init-akrogon/SKILL.md:20` may stay (A,B).
2. `skills/implement-issue/SKILL.md` states, for both the implement end and check.fix, the 2a obligation from the design (criterion proof, changed tests with affected consumers, every `checks` command, unchanged evidence reused, `merge_checks` only at merge unless a criterion needs a whole run), and the line-52 repair rerun sentence is gone.
3. `skills/chart-issues/assets/shapes.md` audit refuses a criterion citing a `merge_checks` command or claiming repo health outside leaf ownership, allows a repo-wide `checks` command only with a named property no smaller test proves, and no longer contains the "added to `checks` first" sentence.
4. `skills/AREA.md`, `docs/guide/phases.md` and `docs/guide/merge.md` describe the same schedule as the skills; `merge-issue/SKILL.md:33` (both maps at merge) and `check-issue/SKILL.md:51` (rerun only on code change, missing evidence or a concern) are unchanged.
5. `bun run format`, `bun test` and `bun run typecheck` pass; `tests/docs-links.test.ts` and `tests/command-reference.test.ts` pass unchanged.

Credentials: none. Human prerequisites: none.
