# Plan: door-reads-live-address

Slot A synthesis, 2026-11-16, base 8532a1f7. Sources: brief.md, design.md (signposts `1a 2a 3a 4a 5a 6a 7a`, door-address Q1/Q2 picks, standing-design interpretation), readiness.yaml proof. No brief/design conflict. Design has no `Open for the plan:` questions. No credentials: design names none and `akrogon status` prints no `Missing:` lines. No grants, no paid or live operation: this leaf changes process text only.

Text-only leaf per the design's standing-design interpretation: the result is the wording itself, judged by reading at review, so no code test is written and nothing is committed at the plan pass. The criterion proofs below are bounded greps (presence/absence of the required clauses) run under `akrogon run-check`; they catch a missing or reverted clause, while the substance judgment stays with review reading the diff. Plan-time reds recorded below show each required clause absent on base.

## Read-first

- `skills/chart-issues/SKILL.md` `## Open` — inside-hc test reads `HC_TERMINAL_ID`; holds the column-helper calls (`herdr-consultant-column <door address>`, `--save`, `--restart`), the "door not in a tab" rule, and the `transcript.ts` seat-record lookup.
- `skills/chart-issues/SKILL.md` `## Handover` — "the prompt names its address" check on the receiving session.
- `skills/chart-issues/assets/questions.md` `## Blind peer exchange` — the brief report step `hc send <door address> "done <X>: <return path>"`.
- `skills/chart-issues/assets/handover.md` — `door-reset.ts <A address>` argument and the start prompt's `door <A address>`.
- `issues/chart/unattended-runs/forks/door-address.md` — the locked answers and B's `$HC_TERMINAL_ID`-expansion pitfall.
- `docs/reference-index.md`, `skills/AREA.md`, `learnings/LESSONS.md` — grounding; checked: no doc outside the three owned files names the door-address mechanism (`docs/`, `tests/AREA.md`, `src/AREA.md`, `skills/AREA.md` greps clean).

## Decisions

- **D1 (definition, criterion 1).** One sentence block in `## Open`, placed immediately after the inside-hc sentence so the rule sits beside the only place the file already reads `HC_TERMINAL_ID`. Required clauses: the door's address is `$HC_TERMINAL_ID` as A reads it at the moment of each use; a recorded address (summary, `seats.yaml`, Mode record) is history, never routing; A resolves the value and writes the literal, never the variable name, into briefs and helper arguments; every rule in this file, questions.md and handover.md that names the door's or A's address uses this definition. The variable-name clause carries the pitfall's reason in passing: a literal `$HC_TERMINAL_ID` in a brief expands to the consultant's own terminal.
- **D2 (placeholder discipline, criterion 2).** The `<door address>` and `<A address>` placeholders stay — inside SKILL.md they are defined by `## Open` — and each use site in the two asset files names its source: questions.md's report step states the brief carries the resolved literal per the address rule, handover.md states `<A address>` is resolved live and passed literally because door-reset.ts runs in a helper terminal where `$HC_TERMINAL_ID` is unset or wrong. SKILL.md `## Handover`'s "the prompt names its address" gains the live-address qualifier.
- **D3 (recorded-value sites stay).** The seats.yaml seat entries, the Mode record lines and shapes.md examples are records of the live read at write time — history by definition — and are not edited. `transcript.ts <address>` in the seat-record paragraph is covered by `## Open`'s definition and needs no edit.
- **D4 (not-in-a-tab rule, criterion 3).** Minimal clause: the exit is recorded once in the round's log and the round continues (unchanged), with the precondition stated — the helper was called with the live address — so the exit can only mean a live door with no tab. C's verify-and-rerun dissent is not added; design locks removal over a second guard.
- **D5 (waves).** Serial-solo: one unit owns all three files — they carry one definition and its use sites, and splitting prose across files buys nothing. implement A runs the plan itself, no workers.
- **D6 (out-of-scope surfaces, stated limit).** `direct-route.md` (B review prompt's `hc send <door address>`), `autopilot.md` and `shapes.md` are not owned; they inherit the term through `<door address>` bound by `## Open`. Recorded as a limitation for review; the design's stated limits (old briefs not edited mid-exchange, next-release reach) carry verbatim.

## Interfaces

None new or changed. `HC_TERMINAL_ID` is already read by the inside-hc rule; `herdr-consultant-column`, `door-reset.ts`, `transcript.ts` and `hc send` signatures are untouched (design: not owned, already take the address as an argument).

## Checklist

- **Wave 1, U1** — `skills/chart-issues/SKILL.md` (definition in `## Open`; not-in-a-tab precondition; `## Handover` live-address qualifier), `skills/chart-issues/assets/questions.md` (report-step literal clause), `skills/chart-issues/assets/handover.md` (`<A address>` resolution clause). No prerequisite; serial-solo.

Docs touched: the three owned files above. No other agent or human doc names this mechanism — `skills/AREA.md` describes the skill by section only, `docs/` and `src/` `tests/` AREA files have no door-address mention.

## Done-criteria → proofs

Runner: `sh -c` grep/sed compounds under `akrogon run-check` (exist at base; no new machinery). Each criterion's substance is judged by reading the changed files at the leaf's head — the criterion's own words — with the greps as the mechanical assist. Size: seconds each. Rerun trigger: any edit to the named file or section.

### C1 — `## Open` states the live-read definition, history-not-routing, and the resolved-literal rule.

- Test/proof: `git diff 8532a1f7...HEAD -- skills/chart-issues/SKILL.md` read at review, plus `akrogon run-check --name c1-definition -- sh -c 'sec=$(sed -n "/^## Open/,/^## Drain/p" skills/chart-issues/SKILL.md) && grep -q "moment of each use" <<<"$sec" && grep -q "history, never routing" <<<"$sec" && grep -q "the literal" <<<"$sec"'` (re-run at head; clause words may differ, so a correction under the proof-command rule is legitimate).
- Observation: the `## Open` section text; before = no address definition anywhere (base red below), after = the four D1 clauses. Product failure caught: a door or fresh A routing by a recorded address again (report #138's stale t1tm).

### C2 — every door/A-address use in the three files points to or uses the definition; no rule names a summary, seats.yaml or the Mode record as the source.

- Test/proof: read of the three files at head, plus `akrogon run-check --name c2-use-sites -- sh -c 'grep -E "hc send <door address>" skills/chart-issues/assets/questions.md | grep -qE "live|## Open" && grep -E "door-reset.ts <A address>" skills/chart-issues/assets/handover.md | grep -qE "live|## Open" && grep -E "prompt names" skills/chart-issues/SKILL.md | grep -qE "live|## Open"'` — each use sentence must carry the live/pointer qualifier. A candidate-lines listing (`c2-source-candidates`, below) prints every sentence co-naming `seats.yaml`/`Mode record`/`summary` and `address` for the review read; base lists only the legitimate recording rules.
- Observation: the use-site sentences in all three files; before = `hc send <door address>` and `door-reset.ts <A address>` name no source at all (base red below), after = each names the live source. Product failure caught: a brief shipped with a recorded or unexpanded address — the dead-terminal report path.

### C3 — the "door not in a tab" rule keeps "recorded once … round continues" and states the live-address precondition.

- Test/proof: read at head, plus `akrogon run-check --name c3-not-in-tab -- sh -c 'sec=$(sed -n "/^## Open/,/^## Drain/p" skills/chart-issues/SKILL.md) && grep -q "recorded once" <<<"$sec" && grep -q "round continues" <<<"$sec" && grep "not in a tab" <<<"$sec" | grep -q "live address"'`.
- Observation: the rule sentence in `## Open`; before = no precondition clause (base red below), after = both clauses present. Product failure caught: dropping the continue-on-exit behavior, or a stale address silently passing as "door not in a tab" again — the #138 harm.

### Condition checks

Text leaf: each checked condition's violation is a wording outcome, shown red at planning by the criterion's own absence probe above; no separate temporary-edit break is meaningful where the product is the text. Review reading the diff is the judgment.

- C1 (a): a brief carrying `$HC_TERMINAL_ID` verbatim — caught by the "never the variable name" clause; the `the literal` grep red-proves its absence on base, read judges the clause.
- C2 (a): a surviving source-name (seats.yaml/Mode/summary) on an address use — `c2-source-candidates` lists every candidate line; base shows only record-write rules, the read at head must show none claiming source status. (b): a use site left pointing nowhere — the c2-use-sites greps; base red below.
- C3 (a): the "recorded once and the round continues" behavior dropped while adding the precondition — the kept-clause greps; (b): precondition stating a weaker source ("an address") — the `live address` grep, read judges.
- D3/D6 coverage (a): a use outside the three files left unbound — traced: `direct-route.md`/`autopilot.md`/`shapes.md` name no address source and use the `<door address>` term bound by `## Open`; review judges the inherited binding. (b): restart `--save`/`--restart` calls — same `## Open` definition; no site edit needed (traced: the placeholder is defined once).

## Plan-run record

All probes run on base head 8532a1f7 (worktree). Reds are the intended absence of each required clause; no test commit is owed since the leaf writes no code test.

- `check c1-definition: 1 implementation/check-c1-definition-1794844293765-472181.log` — red on base: `## Open` holds no live-address definition, no history clause, no literal clause.
- `check c2-use-sites: 1 implementation/check-c2-use-sites-1794844299779-472766.log` — red on base: `hc send <door address>` (questions.md), `door-reset.ts <A address>` (handover.md) and `prompt names` (SKILL.md `## Handover`) carry no live/source qualifier.
- `check c3-not-in-tab: 1 implementation/check-c3-not-in-tab-1794844306939-473007.log` — red on base: `recorded once` and `round continues` already pass (kept clauses), the `live address` precondition is absent.
- `check c2-source-candidates: 0 implementation/check-c2-source-candidates-1794844310221-473282.log` — observational listing, not a verdict. Base prints three lines, all legitimate record writes: SKILL.md:29 (seats.yaml restart entry), SKILL.md:39 (seat record), handover.md:5 (Mode record entry). None claims source status; the head run must show the same plus the new definition's history clause, judged by read.

## Operator blockers

None. No grant, env value, live session or paid call is needed by plan or implementation.
