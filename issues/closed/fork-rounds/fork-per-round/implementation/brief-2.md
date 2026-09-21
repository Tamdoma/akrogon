# Brief-2: shapes template, guide, verify-only docs

## 1. Goal

Implement plan D1, D5-D8 for leaf fork-per-round. shapes.md gains Open forks template and open-fork sentence. docs/guide/chart.md gains one-per-round sentences. AREA.md and README.md are verified unchanged. Depends on brief-1 output for consistency read but edits disjoint files.

## 2. Numbered acceptance criteria

1. shapes.md CHART template has `## Open forks` between Forks taken and Fog with ordered-link line. Preflight rule unchanged.
2. shapes.md fork paragraph last sentence replaced with Open-forks-list sentence. Rest of paragraph unchanged.
3. docs/guide/chart.md forks section says forks taken one per round and next fork researched after answer. Records paragraph says CHART.md lists open forks in take order. Diagrams, export-csv example, headings unchanged.
4. skills/AREA.md and README.md confirmed to hold no sentence describing chart rounds. Both unchanged.
5. No new heading except `## Open forks` in template. No new field, file, or command. Changed Drain, Take, round, fork paragraphs read as map, one fork per round, reshape, next fork, handoff.
6. Changed-test command in section 7 passes.

## 3. Read-first list

- `/home/ivan/Work/infra/akrogon/issues/worktrees/fork-per-round/skills/chart-issues/assets/shapes.md`
- `/home/ivan/Work/infra/akrogon/issues/worktrees/fork-per-round/docs/guide/chart.md`
- `/home/ivan/Work/infra/akrogon/issues/worktrees/fork-per-round/skills/AREA.md`
- `/home/ivan/Work/infra/akrogon/issues/worktrees/fork-per-round/README.md`
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`
- Pattern to copy: existing template list lines `- [<fork>](forks/<fork-slug>.md): ...`. Keep exact link shape.

Open the repo index only if a path above is missing.

## 4. Change list and needed interfaces

Worktree: `/home/ivan/Work/infra/akrogon/issues/worktrees/fork-per-round`.

File 1: `skills/chart-issues/assets/shapes.md`, inside ```markdown `# Chart` block
- Old block:
```markdown
## Forks taken
- [<fork>](forks/<fork-slug>.md): <settled answer>

## Fog
```
- New block:
```markdown
## Forks taken
- [<fork>](forks/<fork-slug>.md): <settled answer>

## Open forks
- [<fork>](forks/<fork-slug>.md): <question in one line>, in the order they will be taken

## Fog
```
- Old fork sentence: `A fork file with no operator answer under ## Taken is open, and CHART.md lists none.`
- New fork sentence: `A fork file with no operator answer under ## Taken is open and appears in CHART.md's Open forks list in the order it will be taken, next first.`
- Actual file uses backticked `## Taken`. Keep backticks.

File 2: `docs/guide/chart.md`
- In `## Forks are decisions; fog needs investigation`, after paragraph `The round gives options, a recommendation with its reason and the pitfalls of the choice. You can pick an option or answer in your own words.`, add paragraph: `Forks are taken one per round. After you answer, the next fork is researched and asked.`
- In records paragraph `Intake keeps the original report separate from agent findings. Fork files keep evidence and your recorded answers. The chart points to what remains open.`, append sentence: ` CHART.md lists open forks in the order they will be taken.`
- Touch nothing else in the guide.

Verify-only: `skills/AREA.md`, `README.md`. Grep for chart-rounds sentences, leave unchanged.

Brief-1 output needed: SKILL.md and questions.md edits landed. Read them only for criterion 5 consistency check.

## 5. Do-not, reasons and exceptions

- Do not edit SKILL.md, questions.md, src, tests, other skills, issues, installed skill copy. Reason: owned by brief-1 or excluded. Exception: none.
- Do not reword shapes literals or add extra guide sentences. Reason: plan D1 and D6 require minimal verbatim. Exception: return mismatch if anchors differ.
- Do not add headings except template `## Open forks`, and no new field, file, command. Reason: criterion C7. Exception: none.
- Do not run full suite. Reason: B runs it after last worker. Exception: none.
- Return a mismatch with evidence to the plan author instead of changing scope or an interface. Exception: a revised brief from B authorizing that change.

Reasons restated: scope split, minimal-verbatim rule, C7 ban, suite ownership, mismatch path. Exceptions restated: none except revised brief for scope or interface change.

## 6. Ordered steps

1. shapes.md criterion 1: grep `## Forks taken` block to show red for missing Open forks, insert template section, grep `## Open forks` for green.
2. shapes.md criterion 2: grep old `CHART.md lists none`, replace last sentence only, grep new `appears in CHART.md's Open forks list`.
3. chart.md criterion 3: read forks section and records paragraph, add two-sentence paragraph and one records sentence, grep new sentences.
4. AREA/README criterion 4: grep for `round`, `chart`, `fork` in both files, confirm no chart-rounds sentence, confirm `git diff` shows no change there.
5. Criteria 5-6: check headings and diff scope, read changed Drain, Take, round, fork paragraphs in order, run section 7 command.

Advisory size: 2 edited files plus 2 verify-only files, under 12 turns.

## 7. Commands

```sh
AKROGON_BASE=c9c96553f8d64c76668a1e2a9aee027e9d634ad1 bun test --changed="c9c96553f8d64c76668a1e2a9aee027e9d634ad1"
```

Run only this test command. Use grep for red/green checks.

## 8. Done-when, evidence and report

Done when criteria 1-6 hold with pasted grep and test output. Keep limitations explicit.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
