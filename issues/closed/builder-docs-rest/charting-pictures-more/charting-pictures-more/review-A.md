# Review A: charting-pictures-more

Base: 9a7402bf. Reviewed head: d44a5866. Verdict: **nits**.

## Verification evidence

- `akrogon verify` green on d44a5866 (format, typecheck, test), per `implementation/report.md`. HEAD is unchanged since then, so I did not rerun it.
- `check pictures: 0 implementation/check-pictures-1795788335777-1080540.log` and `check dash: 0 implementation/check-dash-1795788335859-1080638.log` ran on d44a5866.
- `tests/docs-pictures.test.ts` has had only its planning commit (9fbf4bf2) since base. No planned test was skipped, filtered or changed after planning.
- Scope: `git diff 9a7402bf..HEAD -- docs/guide` removes no line and adds only embed lines and blank lines. `where-things-go.md` changes the Mark bullet only. `tests/AREA.md` changes one bullet, and it is still 49 lines.
- Alt text against `<desc>`: a script over every embed on pages 04 to 08 found every alt equal to its picture's `<desc>`, every card 960 wide, and `aria-labelledby="t d"` on each. A banned-word scan (manual, quick fix, seat, door, leaf, attended) over every `<text>` and alt hit only `seats.yaml` in chart-records.svg. That is the real file name the guide uses, not the word "seat".
- Renders: I read A's contact sheets of all 24 pictures on white (`scratchpad/final/sheet-a.jpg`, `sheet-b.jpg`) and hand-off-review.svg on #0d1117 (`scratchpad/final/dark-hand-off-review.png`). Every picture shows its section's content, nothing overlaps or clips, the mark sits in the same corner on each, and the opaque card reads on dark. Spot-checked against page text: P9 to P12 rows, P5 (no research block), P15 (two misses), P17 (seven checks and the direct-drop branch), P20 (review rows and blocked-by), P21 (both routes). Each matches its section.
- Logo geometry at 4x (report): charting-session text mid 434.5 and logo mid 434.1, mode-and-route 414.5 and 414.1. The logo is centred on the "created by" line in both.
- Docs: `docs/reference/where-things-go.md` `## Pictures` describes the changed behavior. Its Mark line now matches the group in every picture, and no other documented behavior changed.

## Criteria

1. Mark group identical apart from translate: test case 2 is green over all 24 pictures. The logo position is measured centred, and slot B confirms it on a screenshot.
2. Every section has a picture except 04's c- tab section: test case 1 is green. There are no shares. Alt text is plain and labels use the approved words (scan above).
3. Search: test case 2 (no `href`, `<script`, `@import`, `@font-face`, `animation`, `<animate`, and one group holding `<title>Tamdoma</title>` and `created by`) plus the dash guard, both green.
4. Renders: these are slot B's to make. My own reading above found no picture that fails to show its section.
5. Checks: verify green.

## AREA.md listing

`tests/AREA.md` paths checked from the repo root with one command. Two paths were missing: `tests/budget.test.ts`, and `tests/hc-*.test.ts`, which is a glob, not a file. The line this leaf changed names `tests/docs-pictures.test.ts`, which exists.

## Fixes

None.

## Nits

- N1 `tests/AREA.md:19` names `tests/budget.test.ts`, which does not exist. The line comes from 5a5fa8af, before this leaf, and this diff does not touch it. It is deferred because it is outside this leaf's scope and no criterion covers it. It would become a Fix if a change here had added or edited that pointer.
- N2 `tests/AREA.md` is 49 lines, over the 40-line limit, and it was already over before this leaf. The leaf added no line. It is deferred as pre-existing. It would become a Fix if this diff had added lines.
