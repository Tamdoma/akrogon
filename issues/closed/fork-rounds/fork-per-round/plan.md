# Plan: fork-per-round

Direct synthesis. `debate: no`, no positions or rebuttals. Source is brief plus locked design. Brief and design agree; no conflict to record.

## Read-first

- `docs/reference-index.md`
- `skills/AREA.md`
- `skills/chart-issues/SKILL.md`
- `skills/chart-issues/assets/questions.md`
- `skills/chart-issues/assets/shapes.md`
- `skills/chart-issues/assets/standing-design.md`
- `docs/guide/chart.md`
- `learnings/LESSONS.md`

## Decisions

- D1: Use design literals verbatim. No rewording, no extra sentences.
- D2: `questions.md` C1 replaces only the first sentence of the round paragraph. Rest of paragraph unchanged.
- D3: `SKILL.md` Drain inserts the one-fork sentence after the territory-map sentence, before the split paragraph. Direct-item condition becomes no open fork and no fog.
- D4: `SKILL.md` Take replaces the middle clause with the three-sentence fog-graduation step. Handoff-readiness and prototype clauses after the semicolon stay byte-identical.
- D5: `shapes.md` template inserts `## Open forks` between `## Forks taken` and `## Fog`. Fork paragraph replaces only its last sentence. Preflight rule unchanged.
- D6: `docs/guide/chart.md` adds one or two sentences in "Forks are decisions; fog needs investigation" plus one sentence in the records paragraph. Diagrams, export-csv example, headings unchanged.
- D7: `skills/AREA.md` and `README.md` are verify-only. Live grep finds no sentence describing chart rounds, so implementation reports none found and changes neither file.
- D8: Verification order is targeted grep, docs-links test, full suite, scope diff, consistency read.

## Needed interfaces

Exact strings from design:

1. questions.md: `Present the current fork's material questions in one complete round and wait for the operator's answer; the next fork is researched and presented after that answer.`
2. Drain insert: `A round takes one fork, the next answerable fork first, preferring the one whose answer reshapes the most remaining forks; a destination with one fork costs one round.`
3. Drain direct-item: `A direct single item whose map finds no open fork and no fog writes the same chart structure and proceeds to handoff immediately.`
4. Take replacement: `Record operator answers and their reasons in fork files. After each answer, re-read Fog and move newly sharp material questions into their own fork files, removing only that material from Fog. Reshape the remaining forks and update CHART.md's ordered Open forks list before selecting and researching the next fork;` then existing handoff text unchanged.
5. shapes.md template block:
```markdown
## Open forks
- [<fork>](forks/<fork-slug>.md): <question in one line>, in the order they will be taken
```
6. shapes.md fork sentence: `A fork file with no operator answer under ## Taken is open and appears in CHART.md's Open forks list in the order it will be taken, next first.`

## Acceptance criteria

- A1 (C1): Old sentence `Present all currently material questions in one complete round` is gone; new current-fork sentence present; rest of paragraph unchanged.
- A2 (C2): Take holds re-read Fog, move sharp material, reshape forks, update Open forks list, select and research next fork; handoff and prototype clauses unchanged.
- A3 (C3): Drain states one fork per round, next answerable first, reshape-preference, one-fork costs one round; direct-item condition is no open fork and no fog.
- A4 (C4): Template has `## Open forks` between Forks taken and Fog with ordered links; open-fork sentence replaced; preflight refusal unchanged.
- A5 (C5): Guide forks section says one per round plus research-after-answer; records paragraph says CHART.md lists open forks in take order; diagrams and export-csv example unchanged.
- A6 (C6): Implementation report states whether AREA.md or README.md held a chart-rounds sentence. Live check says none.
- A7 (C7): No new heading except `## Open forks` in template; no new field, file, or command; Drain, Take, round, and fork paragraphs read as map, one fork per round, reshape, next fork, handoff.
- A8 (C8): `bun test tests/docs-links.test.ts` and `bun test` pass; `src/`, `tests/`, other skills, `issues/` unchanged.

## Checklist

1. `skills/chart-issues/assets/questions.md` (C1): replace round first sentence with D2 literal.
2. `skills/chart-issues/SKILL.md` Drain (C3): insert one-fork sentence, fix direct-item condition.
3. `skills/chart-issues/SKILL.md` Take (C2): replace middle clause with fog-graduation step.
4. `skills/chart-issues/assets/shapes.md` (C4): add template section, replace open-fork sentence.
5. `docs/guide/chart.md` (C5): add forks-section and records-paragraph sentences.
6. `skills/AREA.md` (C6): confirm no chart-rounds sentence, leave unchanged.
7. `README.md` (C6): confirm no chart-rounds sentence, leave unchanged.
8. Consistency and scope pass (C7, C8): heading, field, diff, and procedure-order check.

## Docs affected

- Agent doc `skills/chart-issues/SKILL.md`: Drain one-fork rule and Take fog-graduation step.
- Agent doc `skills/chart-issues/assets/questions.md`: round granularity sentence.
- Agent doc `skills/chart-issues/assets/shapes.md`: Open forks template and open-fork definition.
- Human doc `docs/guide/chart.md`: one-per-round forks section and open-forks records sentence.
- `skills/AREA.md` and `README.md`: read, no chart-rounds sentence found, no change.

## Verification

Run in worktree:

```sh
grep -n "Present the current fork's material questions" skills/chart-issues/assets/questions.md
grep -n "A round takes one fork" skills/chart-issues/SKILL.md
grep -n "no open fork and no fog" skills/chart-issues/SKILL.md
grep -n "re-read Fog" skills/chart-issues/SKILL.md
grep -n "## Open forks" skills/chart-issues/assets/shapes.md
grep -n "appears in CHART.md's Open forks list" skills/chart-issues/assets/shapes.md
bun test tests/docs-links.test.ts
bun test
git status --porcelain
git --no-pager diff --stat
git --no-pager diff -- src/ tests/ issues/ | cat
```

Pass means each grep hits once, both test commands pass, diff touches only the four owned files, and a sequential read of changed Drain, Take, round, and fork paragraphs gives map, one fork per round, reshape, next fork, handoff.

## Limitation

The installed copy under `~/.claude/skills` is not updated by this leaf; the operator refreshes it after merge, so behavior changes only after that manual step.

## Credentials and dependencies

- Credentials: none. Brief names none, design names no variable, so no env presence check applies.
- Dependencies: none. Checklist order is file order only.
