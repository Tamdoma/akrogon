# Sub-brief 3: questions.md measurement scoping

## 1. Goal

Scope Optional measurement to exploration only in `skills/chart-issues/assets/questions.md`. Plan D4, D5, D6. Covers plan A3 and criteria C1, C4.

Binding facts copied in: Optional measurement covers exploration only and never replaces required operation proof; declining a required probe holds the handoff per the Take operation-proof rule. Keep existing sandbox behavior: smallest experiment, time-box, finding retained, scratch code discarded.

## 2. Numbered acceptance criteria

1. Optional measurement states it covers exploration only and never replaces required operation proof.
2. It states declining a required probe holds the handoff per the Take operation-proof rule.
3. Existing sandbox sentences (smallest experiment, time-box, finding retained, scratch code discarded) remain intact.

Verification for each criterion is grep plus reading the section; no automated test proves prose.

## 3. Read-first list

- `skills/chart-issues/assets/questions.md` Optional measurement lines 52-54 in full before editing.
- `skills/chart-issues/SKILL.md` Take lines 45-53 for the cross-ref target name (read-only, do not edit).
- Pattern to copy: existing Optional measurement paragraph style, plain sentences with no template block.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.
- Open the grounding index only for a gap in this list.

## 4. Change list and needed interfaces

- Owns: `skills/chart-issues/assets/questions.md` only.
- Change: append to the Optional measurement paragraph sentences such as "This section covers exploration only and never replaces required operation proof. Declining a required probe holds the handoff under the Take operation-proof rule."
- Cross-ref phrase: "Take operation-proof rule". No other interface.
- Chunks that must land first: none. Shared test resource: none. Consumed output: none. Independent of units 1 and 2 (different files).

## 5. Do-not, reasons and exceptions

- Do not touch SKILL.md, shapes.md, standing-design.md, src, tests, docs, README or anything under `issues/`; reason: other units own their files and this leaf is prose-scoped; exception: none.
- Do not copy rule fields into this file; reason: plan D5 keeps one canonical definition; exception: none.
- Do not weaken the sandbox sentences (smallest experiment, time-box, discard); reason: exploration behavior is locked and still needed; exception: none.
- Do not add a test file or edit `tests/docs-links.test.ts`; reason: standing design forbids vanity tests; exception: none.
- Return a mismatch with evidence instead of changing scope or an interface; exception is a revised brief from B authorizing that change.

Reasons restated: scope stays in one file, single definition holds, exploration behavior preserved, no vanity tests. Exception restated: only a revised brief from B authorizes a scope or interface change.

## 6. Ordered steps

1. Read questions.md lines 52-54 and SKILL.md Take for the cross-ref name (criteria 1-3).
2. Derive the grep checks before editing: exploration-only present, never-replaces present, declining-holds present (criteria 1-2).
3. Edit `skills/chart-issues/assets/questions.md` per section 4 (criteria 1-3).
4. Run `bun install` once in the worker worktree, then section 7 command; run the greps and read the edited section (criteria 1-3).
5. Commit only `skills/chart-issues/assets/questions.md` in the worker worktree and record the commit id.

Advisory size: 1 file, under 8 turns.

## 7. Commands

`: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE"` with `AKROGON_BASE=1607ee7fbf4a2362340c2d6b8de4257d72684ec6`. Expected to select no tests for markdown-only changes; the section 6 greps are the real check here.

## 8. Done-when, evidence and report

Done when criteria 1-3 hold in the worker worktree, the section 7 command exits 0, and the single-file commit exists. Paste grep outputs and the section 7 result. No end-to-end artifact applies to prose.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
