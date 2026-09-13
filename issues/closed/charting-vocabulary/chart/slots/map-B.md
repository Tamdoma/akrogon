# Slot B territory map

Destination: consistent charting vocabulary, with existing lifecycle, handoff, preflight and footer behavior preserved. Intake read verbatim from `issues/AKROGON-NAMING.md`. No slot A output read. One destination and one eventual leaf appear sufficient, after the forks below are settled.

## Material forks

### D1. Does the vocabulary change the disk contract?

- **O1 (recommended under current locks):** Keep `decisions/` and existing record headings as literal storage names. Use the new vocabulary in explanations, explicitly exempting storage literals from the vocabulary ban. This preserves the parser and unchanged tests with the smallest scope.
- **O2:** Rename folders and headings, migrate chart links, and update the status parser and its fixtures. This gives consistent visible records, but requires an explicit exception to the four-file scope and “test suite passes unchanged” requirement. Decide whether archived charts migrate too. Supporting both formats would add a compatibility mechanism, not just rename words.

Reason and evidence: `src/status.ts:238–252` reads `decisions/`, detects a nonempty `## Resolution`, and counts `## Not Yet Specified`. `tests/status.test.ts:460–482` creates those exact old literals. Folder moves alone cannot complete this rename. The other CHART section headings are not consumed by this parser.

Pitfalls: Renaming only the skill template silently produces zero fork/fog counts. Renaming `Resolution` independently loses taken counts. O1 needs an explicit done-criteria exception because the supplied ban currently includes the old template headings.

### D2. When is a multi-question fork taken?

- **O3 (recommended):** Keep each Q block focused on one choice. Group related Q blocks in one fork file and present the whole fork together. Take it only when all material questions have explicit answers. Partial answers remain recorded without marking the fork taken.
- **O4:** Take the fork after any reply and put missing answers into later forks. This follows “taken when I answer” literally but breaks the requirement that related questions travel together and changes existing answer handling.

Reason and evidence: `assets/questions.md` already says explanation requests do not settle choices, omitted material answers stay open, and silence cannot supply an answer. `assets/shapes.md` currently gives each sharp question its own file. Grouping changes that file boundary, not those consent rules. One final resolution record also fits the status parser's one-file count.

Pitfalls: A partial answer under `## Resolution` looks fully decided to status. Restarting Q numbering inside each fork makes the single round reply key ambiguous. Preserve continuous numbering across the round, and the existing rule to present all currently material questions together.

### D3. How does a later correction affect a taken fork?

- **O5 (recommended):** Preserve the original answer verbatim. Record a linked new fork for a material correction, explicitly identifying which earlier choice it supersedes. Only the effective choices become binding decisions in the design.
- **O6:** Edit or reopen the old fork before handoff. This uses fewer records but contradicts the intake's “never reopened” rule.

Reason and evidence: `SKILL.md` requires B's focused check before recording a late mechanism or contract change. `assets/shapes.md` requires later changes after handoff to become new intake. The intake needs a matching rule for corrections before handoff.

Pitfalls: Preserving every old answer without identifying supersession can put contradictory binding decisions into a self-contained design. Immutability must not prevent an operator correction.

## Practitioner questions

- **Q1:** Does “unchanged” require existing test files to remain untouched, or only unchanged observable behavior? D1 depends on this distinction.
- **Q2:** If D1 chooses migration, does it cover only active charts or also `issues/closed/*/chart/`? Inspected archived CHART files contain relative `decisions/` links. Preserve source text in INTAKE files and verbatim answers during any migration.
- **Q3:** Does “one screen” mean one complete message? No viewport limit exists in `assets/questions.md`. Use a complete message with one reply key and challenge check, without dropping questions to fit a display.

## Contradictions and beginner pitfalls

- **F1:** The claimed implementer dependency is absent. Neither `skills/implement-issue/` nor `skills/plan-issue/SKILL.md` directly references chart files. Planning reads leaf brief/design, implementation reads plan and implementation artifacts. Preserve “binding decisions” and plan D1…Dn names. `assets/standing-design.md` has no chart vocabulary needing replacement.
- **F2:** “Charts stay here” in `assets/shapes.md` is only true through handoff. `src/phase.ts:103–104` moves a matching owner-named chart when its completion owner closes. `tests/phase.test.ts:160–175`, `docs/guide/files.html:106`, and existing closed charts confirm this. Preserve that behavior. `issues/chart/status-empty-open/CHART.md` also demonstrates a handed-off chart still in the active store.
- **F3:** Fog as arbitrary prose does not match current status counting. `src/status.ts:228–234` counts nonempty bullet lines, not paragraphs. Use prose bullets under retained storage headings for O1, or explicitly settle parser scope for O2. A zero status count cannot prove fog is absent today.
- **F4:** “Map never saved” conflicts literally with the blind exchange files required by `assets/questions.md`, including this requested artifact. Distinguish temporary peer exchange from a permanent standalone map. Keep useful findings in chart/fork records and retain the existing cleanup rule.
- **F5:** “Behavior unchanged” already has one explicit exception: multiple questions per fork file. The current rule is “each question decides one thing,” not the intake's quoted “each file decides one thing.” Retain focused questions while changing grouping. New forks after answers and fog clearing must remain allowed.

Verification for the eventual implementation: run `bun test`, inspect CHART relative links for the chosen migration scope, and check that status counts and close-time moves remain correct. This map makes no implementation changes and claims no test result.
