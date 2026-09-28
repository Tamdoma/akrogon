# Sub-brief 2: shapes.md preflight cross-refs

## 1. Goal

Add Preflight refusal and implementer-audit cross-refs in `skills/chart-issues/assets/shapes.md`. Plan D3, D5, D6. Covers plan A2 and criteria C1, C3.

Binding facts copied in: refuse the handoff when a brief names an external operation with no recorded proof under the Take operation-proof rule; the implementer audit checks that refusal. External operation is only what a brief names (API method and path, CLI command, launch flag). No restatement of rule fields. Additive sentences only.

## 2. Numbered acceptance criteria

1. Preflight paragraph (line 166) gains one sentence refusing a brief-named operation with no recorded proof under the Take operation-proof rule.
2. Implementer-audit paragraph (line 168) gains one sentence checking that refusal.
3. No rule field list is copied into this file and no existing sentence is reworded beyond appending the new sentences.

Verification for each criterion is grep plus reading the two paragraphs; no automated test proves prose.

## 3. Read-first list

- `skills/chart-issues/assets/shapes.md` Preflight and validation lines 164-170 in full before editing.
- `skills/chart-issues/SKILL.md` Take lines 45-53 for the cross-ref target name (read-only, do not edit).
- Pattern to copy: existing refusal style "Refuse the handoff while ..." in line 166.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.
- Open the grounding index only for a gap in this list.

## 4. Change list and needed interfaces

- Owns: `skills/chart-issues/assets/shapes.md` only.
- Change 1: append to the line-166 paragraph a sentence such as "Refuse the handoff when a brief names an external operation with no recorded proof under the Take operation-proof rule."
- Change 2: append to the line-168 paragraph a sentence such as "The audit checks that operation-proof refusal."
- Cross-ref phrase: "Take operation-proof rule". No other interface.
- Chunks that must land first: none. Shared test resource: none. Consumed output: none. Independent of units 1 and 3 (different files). Peer leaf base-preflight edits the same paragraph in parallel; keep sentences additive so the later merge rebases.

## 5. Do-not, reasons and exceptions

- Do not touch SKILL.md, questions.md, standing-design.md, src, tests, docs, README or anything under `issues/`; reason: other units own their files and this leaf is prose-scoped; exception: none.
- Do not copy rule fields (command, inputs, cleanup and similar) into this file; reason: plan D5 keeps one canonical definition; exception: none.
- Do not reword or delete existing preflight sentences including any `akrogon preflight` sentence; reason: base-preflight owns that sentence and this unit is additive only; exception: none.
- Do not add a test file or edit `tests/docs-links.test.ts`; reason: standing design forbids vanity tests; exception: none.
- Return a mismatch with evidence instead of changing scope or an interface; exception is a revised brief from B authorizing that change.

Reasons restated: scope stays in one file, single definition holds, additive only for clean rebase, no vanity tests. Exception restated: only a revised brief from B authorizes a scope or interface change.

## 6. Ordered steps

1. Read shapes.md lines 164-170 and SKILL.md Take for the cross-ref name (criteria 1-3).
2. Derive the two grep checks before editing: preflight refusal present, audit check present (criteria 1-2).
3. Edit `skills/chart-issues/assets/shapes.md` per section 4 (criteria 1-3).
4. Run `bun install` once in the worker worktree, then section 7 command; run the two greps and read the edited paragraphs (criteria 1-3).
5. Commit only `skills/chart-issues/assets/shapes.md` in the worker worktree and record the commit id.

Advisory size: 1 file, under 8 turns.

## 7. Commands

`: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE"` with `AKROGON_BASE=1607ee7fbf4a2362340c2d6b8de4257d72684ec6`. Expected to select no tests for markdown-only changes; the section 6 greps are the real check here.

## 8. Done-when, evidence and report

Done when criteria 1-3 hold in the worker worktree, the section 7 command exits 0, and the single-file commit exists. Paste grep outputs and the section 7 result. No end-to-end artifact applies to prose.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
