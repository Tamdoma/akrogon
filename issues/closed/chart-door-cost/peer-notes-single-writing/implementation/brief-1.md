# Worker brief 1: peer-notes-single-writing prose edits

## 1. Goal

Rewrite the chart-issues peer-exchange and handoff prose so peers return blind notes instead of full rounds, A alone writes the formatted operator round, every peer task travels as a brief file, and reviewed leaf drafts are moved into `issues/open/` instead of rewritten. Implements plan decisions D1–D9 from the leaf's `plan.md`. Prose-only edits; no code, tests, scripts, config or lifecycle change.

## 2. Numbered acceptance criteria

Prose criteria are proved by reading the changed paragraphs, not by new tests (no wording test is added, per leaf design).

- AC1. `skills/chart-issues/assets/questions.md`, Blind peer exchange, fork paragraph (currently `:48`, last sentence "Each returned peer file is a full round, not a reaction to A."): that sentence is replaced so a fork's returned peer file holds blind notes per question — the peer's own position, not a review of A — with five parts: the pick with its reason and cost; each rejected option with its reason; the evidence with tier, source and date; the pitfalls with what removes each; any question the peer would ask that the fork does not ask. What a peer receives, the exclusions and the opening-map sentence stay unchanged.
- AC2. `skills/chart-issues/SKILL.md` Take paragraph (`:49`, "With named peers, ..."): says A merges the completed independent **notes**, A alone writes the formatted operator round, and a merge tag cites only a line the peer wrote. The disagreement-only rebuttal, the focused final-shape check, the restatement exemption and the peer-wait clause stay unchanged.
- AC3. questions.md "After all finish" paragraph (`:50`): the merged file is compact notes holding each option with its slot tags, reason and cost, the evidence lines, each pitfall with the step that removes it, open questions and the points where slots differ. Each named peer rebuts that file once. A writes the full operator round once, to the operator, after the rebuttals, with rebuttals under the challenge check. No second full-round file; the record is the merged notes plus the fork's Findings and Taken. Final-shape check, restatement and direct-request sentences stay.
- AC4. questions.md round template + the "Every round uses this shape" paragraph: the template gains one "How to choose" line after the options, shown only when the options trade off, saying which answer is the safe one and when to pick the other. The paragraph gains register rules in the skill's own words: everyday words, simpler than explaining to an 18-year-old who does not know the process; each process word explained the first time; each actor named by what it does for the operator and explained in one sentence on first use; each part says only what the decision needs while every part of the round and every number the decision depends on stays; time in minutes, and money in dollars only where a recorded figure exists, never from a rate the door assumes; file names, slot letters and token detail in a sentence only when they help the operator decide; before sending, A reads the round once against these rules and fixes what fails. No operator alias name (`eli`, `elid`, `scr`, `foc`, `ref`) and no word count appears.
- AC5. questions.md, Blind peer exchange: every peer task (opening map, fork notes, rebuttal, focused final-shape check, leaf review) travels as a brief file, and the prompt is a one-line pointer naming the brief's absolute path and the peer's slot letter (the return path is NOT repeated in the prompt — two copies can disagree; this was settled in the chart's leaf review). The brief is finished before the prompt is sent and not edited during the exchange; a new exchange gets a new brief or a new return path. Briefs use absolute paths, hold what the peer is to receive plus the exact return path, and live under `<chart>/slots/` staying in the chart; the existing temporary-path rule (`/tmp/<session>/...`) still applies before the chart folder exists. The sentence "Every peer prompt gives the exact output path." becomes: every peer brief gives the exact absolute return path, and the prompt names only the brief's absolute path and the slot letter (A,B,C). A fork-notes brief points at the note definition in the Blind peer exchange section and does not restate its parts, while still giving the task, the permitted context and the return path. The confirmed-start check, the no-automatic-re-prompt rule and every wait rule (`herdr agent wait`, `peer-wait.ts`) stay verbatim.
- AC6. SKILL.md Handoff (`:67`, "When peers are named, leaf writing is a mandatory exchange ..."): after the peers' review A corrects the scratchpad draft files, keeping one final scratchpad version per leaf with changed-line tags and any held disagreement carried into the leaf design, and those files are transferred by name into `issues/open/`, state last and prerequisites before dependents, after the existing collision and preflight checks. Contracts are not written a second time. Every proof, the presence check, the grants and both reviews stay.
- AC7. `docs/guide/chart.md`: the peer paragraph at `:162` says peers return notes and A writes the round; the paragraph at `:201` says reviewed draft contracts are moved (not rewritten). Then read `skills/AREA.md` and `README.md` for a sentence describing the peer exchange or leaf writing; if a hit exists update it, otherwise record in your report that none was found (current scan: README.md mentions chart-issues only generically at `:15` and `:182`; AREA.md has no peer-exchange sentence — likely "none found", confirm at edit time).
- AC8. No model name, effort level or price in any changed text. No new command, script, config field, file kind or lifecycle state. Reading the changed Take, Blind peer exchange and Handoff paragraphs in order gives one consistent procedure: brief, blind notes, merged notes, one rebuttal each, one round written by A, operator answer, and at handoff draft, review, correct, move.

## 3. Read-first list

- `skills/chart-issues/SKILL.md` — Take `:49`, Handoff `:67`
- `skills/chart-issues/assets/questions.md` — round template, "Every round uses this shape" paragraph, Blind peer exchange `:44`-`:50`
- `docs/guide/chart.md` — `:160`-`:205`
- `skills/AREA.md`, `README.md` — scan only
- `learnings/LESSONS.md` lines `2026-09-11-stale-rule-in-docs` and `2026-09-14-ambiguous-prose-after-rename`: sweep prose for old terms, not only old paths
- This skill folder's `ponytail.md`

## 4. Change list and needed interfaces

- Owns: `skills/chart-issues/SKILL.md` (two sentences), `skills/chart-issues/assets/questions.md` (round template one line, one paragraph, Blind peer exchange), `docs/guide/chart.md` (two paragraphs). Read-only: `skills/AREA.md`, `README.md`.
- Shared test resource: none. Prerequisites: none. Wave 1, only unit.
- Needed interfaces: none — sentence edits in place, no new headings, template gains exactly one line.

## 5. Do-not, reasons and exceptions

- Do not edit `src/`, `tests/`, `skills/chart-issues/scripts/`, `skills/chart-issues/assets/shapes.md` or `standing-design.md`, other skills, config or `issues/` — the leaf excludes them.
- Do not add headings or restructure; edits are sentence-level replacements in existing paragraphs — the design requires minimal diff.
- Do not name a model, effort level, price, or the operator aliases (`eli`, `elid`, `scr`, `foc`, `ref`) — DC8 forbids them.
- Do not touch the wait rules, confirmed-start check, no-re-prompt rule, proofs, presence check, grants or review clauses — every one is an explicit "stays" item.
- Do not repeat the return path in the prompt text — leaf review settled that two copies can disagree.
- Return a mismatch with evidence instead of changing scope or wording the criteria name; the exception is a revised brief from A authorizing that change.
- Restating: exclusions stay excluded because the leaf forbids them; the named "stays" items stay because the done-criteria require them; any conflict comes back as a mismatch, never silently widened.

## 6. Ordered steps

1. Read `questions.md` and `SKILL.md` fully first. Then edit `questions.md`: AC1 fork-notes sentence, AC3 "After all finish" paragraph, AC4 template line + register rules, AC5 brief-file rewrite of the exchange mechanics. Covers AC1, AC3, AC4, AC5.
2. Edit `SKILL.md`: AC2 Take sentence and AC6 Handoff sentence. Covers AC2, AC6.
3. Edit `docs/guide/chart.md` `:162` and `:201` per AC7; run and record the AREA.md/README.md scan.
4. Stale-term sweep: `grep -n "full round\|independent rounds\|Every peer prompt gives\|output path" skills/chart-issues docs/guide` — reconcile each hit; "round" uses in Research tier prose or Findings/Taken are legal, peer-file and prompt-path ones are not.
5. Ordered read-back: Take → Blind peer exchange → Handoff must read as the AC8 procedure.
6. Run the changed-tests command below.

Advisory size: 3 files, under ~20 turns.

## 7. Commands

```sh
: "${AKROGON_BASE:=3ce20853c64d843d97a1ebe0fbef335958ac0dff}" && bun test --changed="$AKROGON_BASE" --timeout=30000
```

Run with `AKROGON_BASE=3ce20853c64d843d97a1ebe0fbef335958ac0dff` exported in your environment. Markdown-only diffs may run zero tests; that is a valid result — report it as observed.

## 8. Done-when, evidence and report

Done when all eight ACs hold by read-back, the stale-term sweep shows no leftover old-rule text, the file scope is exactly the three owned files (`git status --porcelain` clean otherwise), your work is committed on the detached worktree HEAD, and the changed-test command was run with its output reported.

Commit message: one conventional commit, e.g. `docs(chart-issues): peers return blind notes; A writes the round once`. No Test-Change trailer needed — no file matched by `src/test-files.ts` is touched.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
