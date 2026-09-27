# Brief-1: peer C charting role, all three prose files

Single unit. Edits all three owned files in one consistent pass.

## 1. Goal

Add optional peer C to charting prose. C copies B's whole role, blind to A and to B, named only with B. Merged points list agreeing slots. Plan decisions D1-D6 apply.

Binding facts copied in. Q1-A: C copies B's whole charting role: blind map at open, blind pass per fork, one disagreement-only rebuttal, one late check on a mechanism or contract change, implementer review of draft contracts before handoff; rules stated once for each named peer. Q2-A: each peer blind to A's draft and to the other peer's map, pass and rebuttal; each rebuttal reads only A's merged file. Q3-A: C named only with B; first reply names B then C. Merge Q1-A: merged points list agreeing slots such as `(A)`, `(B,C)`, `(A,B,C)`; `(both)` leaves skill and guide; existing charts keep `(both)` as history. Locks: peer joins by operator naming its pane at chart open, no config key; A owns interview and record; one rebuttal; one late check; restatements need no check; naming peers never sets `debate`.

## 2. Numbered acceptance criteria

1. SKILL.md first-reply rule names B pane, then C pane when given, or says single slot; states C named only with B.
2. Every B charting rule in SKILL.md (opening map, per-fork exchange, rebuttal, direct requests, late check, handoff review) applies to each named peer, stated once, not duplicated per slot.
3. questions.md peer exchange section covers each named peer: distinct exact return paths per peer, herdr idle wait and `herdr agent wait` per peer, each peer blind to A's draft and the other peer's work, each rebuttal reading only A's merged file.
4. `grep -rn "(both)" skills/chart-issues docs/guide/chart.md` prints nothing; attribution reads as agreeing-slot lists.
5. Guide second-seat section, diagram, and contract-review sentence cover optional C with the same role, blind to both A and B, named only with B.
6. Diff lists only the three owned files.

No new test file: prose-only change with no runtime path. Verification is grep plus diff plus the changed-test command below. Red state already holds: `(both)` exists today in SKILL.md and questions.md.

## 3. Read-first list

- `skills/chart-issues/SKILL.md` lines 23, 35, 47, 57 (live wording to rewrite)
- `skills/chart-issues/assets/questions.md` lines 40-50 (live wording to rewrite)
- `docs/guide/chart.md` lines 160-164, diagram after, line 201 (live wording to rewrite)
- Pattern to copy: existing SKILL.md line 47 sentence shape, generalized from "With B, ..." to "With a named peer, ..." style stated once
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`
- Open the grounding index only on a gap in this list.

## 4. Change list and needed interfaces

- `skills/chart-issues/SKILL.md`: rewrite first-reply, opening-map, per-fork exchange, handoff-review sentences per criteria 1, 2, 4. Keep "two-slot" wording out; use each-named-peer phrasing.
- `skills/chart-issues/assets/questions.md`: rewrite line 40 tail and "Blind B exchange" section per criteria 3, 4. Rename section peer-generic. Paths: `map-C.md`, `<fork>-C.md`, `<fork>-rebuttal-C.md`, `<fork>-final-check-C.md` alongside existing B paths.
- `docs/guide/chart.md`: rewrite second-seat section, diagram, contract-review sentence per criteria 4, 5.

Needed interfaces, kept literal: `herdr agent wait` without a timeout, per peer after prompting; herdr idle wait per peer before prompting; exact per-peer return paths in every peer prompt (temp dir before chart folders exist, `<chart>/slots/` after); challenge check carries every peer's rebuttal. No code signatures or data shapes: markdown only. No preceding worker output: first and only unit.

## 5. Do-not, reasons and exceptions

- Do not touch `src/`, `tests/`, `config.yaml`, `issues/`, `shapes.md`, or any other skill. Reason: C has no config key, state, phase, or dispatch role and exists only in charting. Exception: none.
- Do not leave `(both)` in the three owned files. Reason: criterion 4 greps exactly these paths. Exception: none; existing charts under `issues/` keep theirs untouched.
- Do not allow C without B or C reading B's work. Reason: locked Q2-A and Q3-A forbid it. Exception: none.
- Do not advise which model runs in C's pane. Reason: operator did not decide it. Exception: none.
- Do not change scope or an interface on your own; return a mismatch with evidence naming the conflict, the actual surface, and the smallest brief fix. Reason: plan is the contract. Exception: a revised brief from B authorizing the change.

Restated: exclusions hold because locked scope, grep criterion, and operator decisions require them; the only way past one is a revised brief from B.

## 6. Ordered steps

1. Read the three files at the listed lines; confirm `(both)` hits (criterion 4 red). File: all three. Criterion: 4.
2. Edit SKILL.md first-reply, map, exchange, handoff sentences. File: SKILL.md. Criteria: 1, 2, 4.
3. Edit questions.md research tail and blind-exchange section. File: questions.md. Criteria: 3, 4.
4. Edit guide section, diagram, contract-review sentence. File: chart.md. Criteria: 4, 5.
5. Run `grep -rn "(both)" skills/chart-issues docs/guide/chart.md` and expect no output; run `git --no-pager diff --name-only` and expect only the three files. Criteria: 4, 6.
6. Run the section 7 changed-test command. Criterion: 6 (no code changed, suite unaffected).

Advisory size: about 3 files and under 16 turns. Work clearly beyond this returns a mismatch with evidence, not a hard cutoff.

## 7. Commands

Only this changed-test command, with the supplied base:

```sh
AKROGON_BASE=9aaadd379d9c46c49fd0b6a6460c6c39f898fc53 bash -c ': "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE"'
```

B runs the full suite separately. Do not run `bun run format`, `bun run typecheck`, or full `bun test`.

## 8. Done-when, evidence and report

Done when criteria 1-6 hold: prose rewritten per brief, grep prints nothing, diff lists only the three files, changed-test command result pasted. No end-to-end artifact exists for a prose-only leaf; grep and diff outputs are the evidence. State limits and unverified items plainly.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
