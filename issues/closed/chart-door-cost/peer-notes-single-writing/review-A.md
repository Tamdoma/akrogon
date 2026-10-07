# Review A: peer-notes-single-writing

Initial review, blind (no contact with B, B's review not read). Base `3ce2085` · reviewed head `0969a0f` (`docs(chart-issues): peers return blind notes; A writes the round once`, 3 files, +10/−8).

Inputs: leaf `brief.md`, `design.md`, `plan.md`, `implementation/report.md`, live diff `3ce2085..HEAD`, live checkout reads. Debate artifacts: none expected (`debate: "no"`), none present.

## Verification evidence

- `git diff --stat 3ce2085..HEAD`: only `docs/guide/chart.md`, `skills/chart-issues/SKILL.md`, `skills/chart-issues/assets/questions.md`. `git status --porcelain` clean. DC9 scope part holds.
- `bun test --timeout=30000` green at implement (501 pass, 0 fail; report §Commands). Not rerun: markdown-only diff, report carries the run, no specific concern. DC9 test part holds — guide links and shapes example still pass.
- `grep -rn "full round\|independent rounds\|Every peer prompt gives" skills/chart-issues docs/guide README.md skills/AREA.md`: zero hits.
- Added-line sweep for `elid|eli|scr|foc|ref|sonnet|opus|gpt|model|price|$N|word count`: zero hits. The paragraph retains the pre-existing phrase "on every harness and at every effort level" — kept text, not a new level name; inside DC8's intent. Nit below.
- Doc paths named by changed text verified live: `skills/chart-issues/scripts/peer-wait.ts` exists; guide links `create.md`/`next.md`/`README.md` exist (covered by docs-links test).

## Criterion audit

- DC1 ✓ questions.md `:48` (now the fork paragraph) replaces "a full round, not a reaction to A" with blind notes per question + all five parts verbatim. Receive list, exclusions, opening-map sentence unchanged.
- DC2 ✓ SKILL.md `:49`: "merges the completed independent notes", "a merge tag citing only a line the peer wrote", "A alone then writes the formatted operator round"; rebuttal, final-shape check, restatement exemption, peer-wait clause all retained.
- DC3 ✓ "After all finish" paragraph: compact-notes definition names every required element; one rebuttal each; round written once after rebuttals with rebuttals under challenge check; "no second full-round file"; record = merged notes + Findings and Taken; final-shape/restatement/direct-request sentences kept.
- DC4 ✓ Template gains `How to choose <when the options trade off: ...>` after the options, conditional by its own text; register rules appended to the shape paragraph covering every sub-rule in the criterion including the dollars-only-recorded-figure clause and the read-before-send rule. No alias name, no word count.
- DC5 ✓ `:48` rewritten: every peer task (map, fork notes, rebuttal, final-shape check, leaf review) is a brief file; one-line prompt names only brief absolute path + slot letter; brief finished before prompt, fresh brief/return path per exchange; absolute paths; `<chart>/slots/` retention; temporary-path rule kept and extended to briefs; fork-notes brief points at the note definition without restating; confirmed-start, no-re-prompt and all wait rules untouched in `:46`.
- DC6 ✓ SKILL.md `:67`: correct-then-move, one final scratchpad version, changed-line tags, held disagreement into leaf design, transfer by name (state last, prerequisites before dependents) after existing collision and preflight checks, no second write; proofs, presence check, grants, both reviews retained.
- DC7 ✓ guide `:162` and `:201` updated; `skills/AREA.md` + `README.md` scanned for peer-exchange/leaf-writing sentences — none found, recorded in report.
- DC8 ✓ No model name, effort level or price added; no new command, script, config field, file kind or lifecycle state; ordered read Take → Blind peer exchange → Handoff yields the stated single procedure.
- DC9 ✓ `test` green (report evidence), non-owned paths unchanged.

Cross-check against chart leaf reviews: leaf-review-B.md D1's settled text ("brief alone carries the exact absolute return path; prompt names only brief path and slot letter") is what the diff implements; the chart's own `slots/` brief names (`handoff-script-brief.md`) match the new `fork-name-brief-A.md` convention.

## Findings

### Nits

- N1. Brief-file example names are `fork-name-brief-A.md` / `map-brief-A.md` while returns keep `fork-name-A.md` — the "brief" token placement differs from returns (`brief` after the fork name vs slot letter after it). Reproduction: read questions.md `:48`. Deferred: any agent following the text writes a correctly-located brief file; the convention is unambiguous in context and mirrors the chart's own `handoff-script-brief.md`. Promotion evidence: a recorded case of a peer or A writing a brief to a wrong path from this wording.
- N2. Retained phrase "at every effort level" sits in a paragraph that was edited; a strict reading of DC8's "no effort level" could flag it. Deferred: the phrase is pre-existing shape prose, names no level, and removing it would alter a sentence the criteria did not ask to change; the criterion targets model/effort/price selection detail leaking into new text. Promotion evidence: the criterion's author intends retained sentences to be swept too.

## Verdict

`nits` — all nine done-criteria verified against the live diff; no Fix has a realistic source with a consequence today (the diff is documentation prose and every behavior claim reads correctly against the chart record and skill mechanics).

```text
Last operation: review-A.md written to leaf folder; verdict nits on head 0969a0f
Next: akrogon phase peer-notes-single-writing merge --slot A --verdict nits
```
