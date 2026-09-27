# Plan: peer-c-role

Direct synthesis. `debate: no`, no positions or rebuttals. Source is brief plus locked design only. No brief/design conflict found.

## Decisions

- D1: State each charting peer rule once with "each named peer" phrasing. No duplicated B block plus C block.
- D2: First-reply rule names the B pane, then the C pane when given, or says single slot. C is named only with B.
- D3: Merged-point attribution lists agreeing slots, for example `(A)`, `(B)`, `(C)`, `(B,C)`, `(A,B,C)`. `(both)` leaves the three owned files. Existing charts under `issues/` keep `(both)` as history.
- D4: `questions.md` renames "Blind B exchange" to a peer-generic section. It gives distinct exact return paths per peer (`map-C.md`, `<fork>-C.md`, `<fork>-rebuttal-C.md`, `<fork>-final-check-C.md`), herdr idle wait plus `herdr agent wait` per peer, each peer blind to A's draft and to the other peer's map, pass, and rebuttal, and each rebuttal reading only A's merged file.
- D5: Guide "second seat" section and diagram describe optional C with the same role as B, blind to both A and B, named only with B. Contract-review sentence covers each named peer.
- D6: Only the three owned files change. No `src/`, `tests/`, `config.yaml`, `issues/`, `shapes.md`, lifecycle, or other-skill edits.

## Read-first

- `skills/chart-issues/SKILL.md` lines 23, 35, 47, 57
- `skills/chart-issues/assets/questions.md` lines 40-50
- `docs/guide/chart.md` lines 160-164, diagram, line 201
- `skills/chart-issues/assets/shapes.md` (excluded: `slots/<pass>.md` already covers any peer)
- `docs/reference-index.md`, `skills/AREA.md`, `learnings/LESSONS.md`
- Relevant lessons: 2026-09-11-lock-vs-criterion (forbidden-term grep vs verbatim text), 2026-09-11-stale-rule-in-docs (grep `docs/` for changed rule), 2026-09-14-ambiguous-prose-after-rename (sweep old term, not just old path)

## Interfaces (keep literal)

- `herdr agent wait` without a timeout, run per named peer after prompting.
- Herdr idle wait per named peer before prompting.
- Exact per-peer return paths given in every peer prompt: temp dir before chart folders exist, `<chart>/slots/` after.
- Challenge check carries every peer's rebuttal.
- No config key, state field, phase, or dispatch change for C.

## Acceptance criteria (locked, from brief)

- A1: First-reply rule names B, and C when given, or says single slot; C named only with B.
- A2: Every B charting rule in SKILL.md (opening map, per-fork exchange, rebuttal, direct requests, late check, handoff review) applies to each named peer, stated once.
- A3: `questions.md` peer exchange covers each named peer per D4.
- A4: `grep -rn "(both)" skills/chart-issues docs/guide/chart.md` prints nothing; attribution reads as agreeing-slot lists.
- A5: Guide second-seat section, diagram, and contract-review sentence cover optional C per D5.
- A6: `git --no-pager diff --name-only "$AKROGON_BASE"...HEAD` lists only the three owned files.
- A7: `bun run format`, `bun run typecheck`, `bun test` pass.

## File checklist (in order)

1. `skills/chart-issues/SKILL.md` — rewrite lines 23, 35, 47, 57 per D1/D2/D3. Covers A1, A2, A4.
2. `skills/chart-issues/assets/questions.md` — rewrite line 40 tail and section lines 42-50 per D4 and D3. Covers A3, A4.
3. `docs/guide/chart.md` — rewrite section lines 160-164, diagram, line 201 per D5 and D3. Covers A4, A5.
4. Verify A4, A6, A7 with the commands below. Record outputs in the implementation report.

## Docs affected

- Agent doc: `skills/chart-issues/SKILL.md` — peer-generalized charting rules and slot-list attribution.
- Agent doc: `skills/chart-issues/assets/questions.md` — peer-generic blind exchange with per-peer paths and waits.
- Human doc: `docs/guide/chart.md` — optional C peer prose, diagram, and contract review.

## Verification

```sh
grep -rn "(both)" skills/chart-issues docs/guide/chart.md
git --no-pager diff --name-only "$AKROGON_BASE"...HEAD
bun run format
bun run typecheck
bun test
```

Expect: grep prints nothing; diff lists exactly `skills/chart-issues/SKILL.md`, `skills/chart-issues/assets/questions.md`, `docs/guide/chart.md`; all three checks pass.

## Credentials

None. Design names no variable-named secret, so no `.env` presence check applies.

## Limitation

Prose-only change with no behavioral test path: verification is grep plus diff plus repo checks. No three-pane herdr rehearsal required per design.

## Dependencies

None. Single ordered pass over three files.

## Implementation notes (2026-09-26, repair round 1)

- F1 from review-A: the round template at `skills/chart-issues/assets/questions.md:24` still named slot B literally ("including B's remaining disagreements") after the D4 rename swept only the section heading and body. This refines D4: peer-generic wording covers the template line too, e.g. "each named peer's remaining disagreements". No locked decision changed; criteria unchanged.
