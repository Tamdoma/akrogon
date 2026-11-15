# Review A: door-step-files

Base: `81c6bc83`. Reviewed head: `5a289acfaf818debe097a2b2ed63dddf8a35e4fc`. Diff: `git diff 81c6bc83..HEAD` (9 files, +88/−61). Worktree clean.

## Verification evidence

- `bun test tests/docs-links.test.ts` green on reviewed head (11 pass, `check changed-tests-after-a-fix: 0 implementation/check-changed-tests-after-a-fix-1794393937127-2899344.log`).
- `akrogon verify` green on head (`verify leaf 5a289acf…: green`; test 1163 pass; format, typecheck clean — logs under `implementation/`).
- Clause preservation: I rebuilt each old section (`## Direct route` `## Autopilot` `## Handover` at base) and matched every sentence against the head's combined text of `SKILL.md` + the three step files. Every clause found exactly once; the only deltas are the listed citation repoints, the three added read directives, the step-file headings/preambles, and the one D4 sentence edit in the fresh-A check.
- AREA.md path listing: all 11 named paths exist (one shell pass, all OK).
- Docs sweep: `grep -rn 'chart-issues' docs/` — the only page stating a moved rule's place was `docs/reference/files.md`, repointed to `assets/handover.md`; all other pages link the skill or describe behavior (quick-fix.md "the full rules are in chart-issues" names the skill, not a section — no moved-rule place stated).
- Command literals: `verify --holder <chart>/direct --known-red` verbatim in `assets/direct-route.md`; `` `akrogon pack <chart>` `` ×1 in `SKILL.md` Handoff + ×2 in `direct-route.md` (steps 9 and abandon); all three marker words present; literal tests read the files carrying them and pass.
- `wc -w`: `SKILL.md` 8,387 → 5,412; step files 1,055 + 1,476 + 531.

## Reading-path trace (criteria 1–3)

- Manual session handing off through the lifecycle: never opens a step file; SKILL.md still holds the direct-route refusal list + route question, three-mode def + start rule + mode-record read, the handover trigger and the fresh-A start-prompt check. ✓
- Direct route chosen: `## Direct route` directive sends the door to `direct-route.md`, which holds protocol/bound/growth/continuations incl. the known-red rule copy and both pack sites. ✓
- Autopilot / full autopilot: mode known from SKILL.md kept text and the mode-record rule; directive sends the door to `autopilot.md`, which holds behavior, waits, proposals, drops, mode end, and both autopilot handover paragraphs (D4). ✓
- Old A at a chart switch: Drain's repoint + `## Handover` directive → `handover.md` holds entry append, folder creation, reset launch, start-prompt construction. Under autopilot old A already read `autopilot.md`, which carries the handed-list entry and `seats.yaml` deferral. ✓
- Fresh A receiving a start prompt: SKILL.md's kept check paragraph validates address/chart/mode-entry/transcript-path; the D4 sentence points an autopilot-mode session at `autopilot.md` for the resume entry instead of naming `continue attended` unconditionally. ✓
- Door resuming after compaction: opening re-read rule lands on SKILL.md; mode-record rule stays in SKILL.md; step files re-read when their step arrives. ✓

## Findings

No Fix. Nits:

- N1: `questions.md`/`shapes.md` repoints name the step files as code spans (`` `autopilot.md` ``) rather than markdown links, so the link check cannot verify them. Deferred: naming is correct on the reviewed head, the bound rule still holds, and D5 permitted either form; a link form would be stronger only for mechanical checking. Evidence promoting it: a renamed step file silently breaking the span.
- N2: `report.md`'s criterion-6 word counts come from the worker report plus my re-run; the numbers are consistent but the per-file after counts include added preambles, so "words removed" (8,387−5,412=2,975) is smaller than the 3,761 section measure cited in the brief — expected, since kept stubs, directives and preambles add words back.

## Test-Change trailers

`6a105a35` carries `Test-Change: tests/docs-links.test.ts door-step-files done-criterion 5…`. The change moves where two existing literal tests read; criterion 5 is the cited brief outcome and the old expectations contradict it, so the change is licensed. (A is not required to judge its own trailer; recorded for completeness.)

## Verdict

ready

```text
akrogon phase door-step-files merge --slot A --verdict ready
```
