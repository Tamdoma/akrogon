# Plan: peer-notes-single-writing

Direct synthesis. `debate: "no"` in state.yaml, so no positions or rebuttals. Built from `brief.md`, `design.md`, and the live checkout at commit 3ce2085 (the design's line anchors verified against the worktree). No brief/design conflict found; if one appears, the design wins.

Scope: prose-only edits inside `skills/chart-issues/` and `docs/guide/chart.md`, plus a read-scan of `skills/AREA.md` and `README.md`. No `src/`, `tests/`, `issues/`, scripts, config or lifecycle changes.

## Decisions

- D1. questions.md fork-notes sentence. In `skills/chart-issues/assets/questions.md`, Blind peer exchange, fork paragraph (currently `:48`, ending "Each returned peer file is a full round, not a reaction to A."): replace that sentence so a fork's returned peer file holds blind notes per question — the peer's own position, not a review of A — with the five parts: pick with reason and cost; each rejected option with its reason; evidence with tier, source and date; pitfalls with what removes each; any question the peer would ask that the fork does not ask. What a peer receives and the exclusions stay. The opening-map sentence stays verbatim.
- D2. SKILL.md Take named-peers sentence (`:49`). Change "merges the completed independent rounds" to notes and state that A alone writes the formatted operator round and a merge tag cites only a line the peer wrote. Keep the disagreement-only rebuttal, the focused final-shape check, the restatement exemption and the peer-wait clause unchanged.
- D3. questions.md "After all finish" paragraph (`:50`). Merged file = compact notes: each option with slot tags, reason and cost, evidence lines, each pitfall with its removing step, open questions, points where slots differ. Each named peer rebuts that file once. A writes the full operator round once, to the operator, after the rebuttals, with rebuttals under the challenge check. No second full-round file; the record is merged notes plus the fork's Findings and Taken. Final-shape, restatement and direct-request sentences stay.
- D4. questions.md round template + "Every round uses this shape" paragraph (`:27` area). Template gains one line, "How to choose", after the options, shown only when options trade off, naming the safe answer and when to pick the other. The paragraph gains register rules in the skill's own words: everyday words, simpler than explaining to an 18-year-old who does not know the process; each process word explained on first use; each actor named by what it does for the operator, explained in one sentence on first use; each part says only what the decision needs while every part of the round and every number the decision depends on stays; time in minutes, dollars only where a recorded figure exists; file names, slot letters and token detail only in a sentence when they help the operator decide; before sending, A reads the round once against these rules and fixes what fails. No operator alias name (`eli`, `elid`, `scr`, `foc`, `ref`) and no word count appears.
- D5. questions.md peer-task briefs (`:44`-`:48` area). Every peer task (opening map, fork notes, rebuttal, focused final-shape check, leaf review) travels as a brief file; the prompt is one line naming the brief's absolute path and the peer's slot letter (settled in leaf review: the return path is not repeated in the prompt — two copies can disagree). The brief is finished before the prompt and not edited during the exchange; a new exchange gets a new brief or a new return path. Briefs use absolute paths, hold what the peer is to receive plus the exact return path, and live under `<chart>/slots/` staying in the chart; the temporary-path rule applies before the chart folder exists. "Every peer prompt gives the exact output path." becomes "every peer brief gives the exact absolute return path, and the prompt names only the brief's absolute path and the slot letter". A fork-notes brief points at the note definition in Blind peer exchange and does not restate its parts, while still giving task, permitted context and return path. Confirmed-start check, no-automatic-re-prompt and every wait rule stay.
- D6. SKILL.md Handoff leaf-writing sentence (`:67`). After peer review A corrects the scratchpad drafts, keeping one final scratchpad version per leaf with changed-line tags and held disagreements carried into the leaf design; those files are transferred by name into `issues/open/`, state last and prerequisites before dependents, after the existing collision and preflight checks. Contracts are not written a second time. Every proof, presence check, grants and both reviews stay.
- D7. `docs/guide/chart.md` peer paragraphs (`:162`, `:201`): peers return notes, A writes the round, reviewed drafts are moved (not rewritten). Scan `skills/AREA.md` and `README.md` for any sentence describing the peer exchange or leaf writing; update a hit, otherwise the implementation report states none was found. Current scan: README.md mentions chart-issues only generically (`:15`, `:182`); skills/AREA.md has no peer-exchange sentence — likely report "none found", confirmed at edit time.
- D8. Invariants across the diff: no model name, effort level or price; no new command, script, config field, file kind or lifecycle state. The changed Take, Blind peer exchange and Handoff paragraphs read in order as one procedure: brief, blind notes, merged notes, one rebuttal each, one round written by A, operator answer, and at handoff draft, review, correct, move.
- D9. One commit, prose only. The sibling leaf chart-usage-table also touches SKILL.md in other sentences; neither leaf waits on the other. No test added for wording (standing design: criteria judged by reading changed paragraphs; the existing `test` check proves guide links and the shapes example still hold).

Credentials: none. The brief and design name no variable and `akrogon status peer-notes-single-writing` printed no `Missing:` lines, so no env presence check applies.

## Read-first

- `docs/reference-index.md`
- `skills/AREA.md`
- `learnings/LESSONS.md` — applicable lessons: `2026-09-11-stale-rule-in-docs` (grep `docs/` for the changed rule and own or report the hit) and `2026-09-14-ambiguous-prose-after-rename` (sweep prose for the old term, e.g. "full round", "Every peer prompt gives the exact output path", not only the old path). `2026-10-01` wording-assertion lesson supports adding no wording test.
- `skills/chart-issues/SKILL.md` — Take `:49`, Handoff `:67`.
- `skills/chart-issues/assets/questions.md` — template, `Every round uses this shape`, Blind peer exchange `:44`-`:50`.
- `skills/chart-issues/assets/shapes.md` — read only for Handoff's existing collision/preflight terms so D6 references them correctly.
- `docs/guide/chart.md` — `:160`-`:182`, `:195`-`:205`.
- `README.md` — scan for peer-exchange or leaf-writing sentences.
- Leaf folder `brief.md`, `design.md` — binding fork decisions verbatim.

## Needed interfaces

None. No code, schema, command or file-format change; edits are sentences inside existing paragraphs, and the round template gains exactly one line.

## Acceptance criteria

- A1 (brief DC1). The questions.md fork paragraph defines fork peer files as blind notes with the five listed parts; "a full round, not a reaction to A" is gone; what a peer receives, exclusions and the opening-map sentence are unchanged.
- A2 (DC2). SKILL.md Take says A merges completed independent notes, A alone writes the formatted operator round, and a merge tag cites only a peer-written line; rebuttal, final-shape check, restatement exemption and peer-wait clauses remain.
- A3 (DC3). The "After all finish" paragraph describes compact merged notes, one rebuttal per named peer, one operator round written after the rebuttals with rebuttals under the challenge check, no second full-round file, record = merged notes + Findings and Taken; final-shape, restatement and direct-request sentences remain.
- A4 (DC4). The template has a conditional "How to choose" line after the options; the shape paragraph carries every register rule named in D4, with no alias name and no word count.
- A5 (DC5). Every peer task is a brief file with a one-line prompt naming only the brief's absolute path and slot letter; brief-final-before-prompt, fresh brief/return path per exchange, absolute paths, `<chart>/slots/` retention, the pre-chart temporary-path rule, the note-definition pointer rule, and the unchanged confirmed-start, no-re-prompt and wait rules are all present; "Every peer prompt gives the exact output path." is replaced as specified.
- A6 (DC6). The Handoff sentence describes correct-then-move with one final scratchpad version, changed-line tags, held disagreements into the leaf design, transfer by name (state last, prerequisites before dependents) after existing checks, and no second writing; proofs, presence check, grants and both reviews remain.
- A7 (DC7). chart.md's two peer paragraphs say peers return notes, A writes the round and reviewed drafts are moved; the AREA.md/README.md scan result (hit updated or none found) is recorded in the implementation report.
- A8 (DC8). No model name, effort level or price in the diff; no new command, script, config field, file kind or lifecycle state; the three changed areas read in order as the one procedure listed in D8.
- A9 (DC9). `bun test --timeout=30000` passes; `git status` shows `src/`, `tests/`, other skills and `issues/` unchanged on the branch.

## Checklist, in order

Wave 1 (one unit — the edits share wording and DC8 requires cross-file consistency, so a single unit owns all three files):

- U1 owns `skills/chart-issues/SKILL.md`, `skills/chart-issues/assets/questions.md`, `docs/guide/chart.md`; read-only scan of `skills/AREA.md`, `README.md`. Shared test resource: none. Prerequisites: none.
  1. questions.md: apply D1, D3, D4, D5 sentence edits in place. Covers A1, A3, A4, A5.
  2. SKILL.md: apply D2 (`:49`) and D6 (`:67`). Covers A2, A6.
  3. docs/guide/chart.md: apply D7 to `:162` and `:201`; run and record the AREA.md/README.md scan. Covers A7.
  4. Stale-term sweep per lessons: `grep -n "full round\|independent rounds\|Every peer prompt gives\|output path" skills/chart-issues docs/guide` and reconcile each hit against the new wording (fork's Findings/Taken "round" uses in research prose are legal; peer-file and prompt-path ones are not).
  5. Ordered read-back of the changed Take → Blind peer exchange → Handoff text against D8's procedure. Covers A8.
  6. Run `bun run format`, `bun test --timeout=30000`, `bun run typecheck`; confirm `git status --porcelain` lists only the three owned files. Covers A9.

Agent docs affected: `skills/chart-issues/SKILL.md`, `skills/chart-issues/assets/questions.md` (both edited per D1–D6). Human docs affected: `docs/guide/chart.md` (peer paragraphs per D7). `skills/AREA.md` and `README.md` are scanned for a peer-exchange or leaf-writing sentence; a hit is updated, otherwise the report states none was found.

## Verification

| Criterion | Proof | Failure it catches | Size | Rerun trigger |
|---|---|---|---|---|
| A1 | `grep -n "full round, not a reaction to A" skills/chart-issues/assets/questions.md` empty + read-back lists all five parts | old sentence left, part dropped | seconds | questions.md edit |
| A2 | read SKILL.md `:49` diff; `grep -n "rebuttal\|final shape\|restatement\|peer-wait" skills/chart-issues/SKILL.md` still hits | retained clause deleted | seconds | SKILL.md edit |
| A3 | read "After all finish" diff; `grep -n "second full-round file\|merged notes" skills/chart-issues/assets/questions.md` hits | second-file behavior left in | seconds | questions.md edit |
| A4 | template diff shows one added "How to choose" line; `grep -n "elid\|\beli\b\|\bscr\b\|\bfoc\b\|\bref\b\|word count" skills/chart-issues/assets/questions.md` empty | alias leaked, rule dropped | seconds | questions.md edit |
| A5 | `grep -n "Every peer prompt gives the exact output path" skills/chart-issues/assets/questions.md` empty; read-back confirms one-line prompt, brief rules, `<chart>/slots/`, unchanged wait/confirm rules | prompt still carries the path, wait rule touched | seconds | questions.md edit |
| A6 | read SKILL.md `:67` diff; presence-check block and reviews sentences untouched | second-write behavior left, check deleted | seconds | SKILL.md edit |
| A7 | read chart.md `:160`-`:205` diff; `grep -n "peer" README.md skills/AREA.md` reviewed, report records the result | guide contradicts skill | seconds | chart.md edit |
| A8 | ordered read of the three changed areas; `git --no-pager diff` grep for model/effort/price terms empty; `git --no-pager diff --stat` shows only owned paths | inconsistent procedure, forbidden content, stray file | seconds | any edit |
| A9 | `bun run format && bun test --timeout=30000 && bun run typecheck`; `git status --porcelain` clean outside the three files | broken link, broken shapes example, stray change | minutes | any edit |

The brief names the destination `test` check as DC9's proof; `format` and `typecheck` run as the configured gate alongside it. No `merge_checks` entry exists and none is added.

## Open limitation

Whether the change saves cost is unproven here: the first notes trial (design, cut-boundary) showed no visible saving, and per the exclusions proof-of-saving belongs to the leaf chart-usage-table. Also unmeasured (design round-writing C2): which of the three register properties — shorter, simpler, more context — the operator reacts to.

## Dependencies

None. Sibling leaf chart-usage-table edits different sentences of SKILL.md and shapes.md; no ordering required.
