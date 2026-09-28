# Sub-brief 1: SKILL.md canonical rule

## 1. Goal

Add the single canonical operation-proof rule to Take and fix credential timing in `skills/chart-issues/SKILL.md`. Plan D1, D2, D5, D6. Covers plan A1 and criteria C1, C2.

Binding rule to write (function over form, state evidence not a template): every external operation a brief names (API method and path, CLI command, launch flag) gets one real call with the identity the leaf will use, recorded in the fork with command, inputs, identity reference without secret values, version, date, observed result, cleanup result and limits (what it does not prove). Writes use the smallest reversible call on a throwaway target with checked cleanup. A provider dry-run or validate call counts only for the property the provider documents it proves, run with the real identity and target. Declining a required probe holds the handoff. When no safe sufficient probe exists the handoff is held and scope is not narrowed. No waiver.

## 2. Numbered acceptance criteria

1. Take holds one new paragraph after the prototype sentence with all elements above; prose states required evidence without a fixed template.
2. The credential sentence ends requiring needed keys in the consumer gitignored `.env` before handoff so probes can run (no "before dispatch" remains in this file for these credentials).
3. Handoff audit sentence references the Take operation-proof rule without restating its field list.

Verification for each criterion is grep plus reading the edited paragraph; no automated test proves prose.

## 3. Read-first list

- `skills/chart-issues/SKILL.md` Take lines 45-53 and Handoff lines 55-63 in full before editing.
- `skills/chart-issues/assets/standing-design.md` (credential-timing interpretation, no vanity tests).
- Pattern to copy: existing Take paragraph style, plain sentences with no template block.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.
- Open the grounding index only for a gap in this list.

## 4. Change list and needed interfaces

- Owns: `skills/chart-issues/SKILL.md` only.
- Change 1: insert the D1 paragraph after the sentence ending "whose scratch code is discarded." (line 51).
- Change 2: in line 53 change final clause "so the operator fills them before dispatch" to "before handoff so the probes can run"; keep the rest verbatim.
- Change 3: extend line 61 audit sentence with a cross-ref such as "and the Take operation-proof rule" without copying field lists.
- Chunks that must land first: none. Shared test resource: none. Consumed output: none. Independent of units 2 and 3 (different files).

## 5. Do-not, reasons and exceptions

- Do not touch shapes.md, questions.md, standing-design.md, src, tests, docs, README or anything under `issues/`; reason: other units own their files and this leaf is prose-scoped; exception: none.
- Do not restate the rule in Handoff beyond the cross-ref; reason: plan D5 keeps one canonical definition; exception: none.
- Do not add a test file or edit `tests/docs-links.test.ts`; reason: standing design forbids vanity tests and that suite scans only README plus guide; exception: none.
- Do not invent a fixed evidence template; reason: design requires function over form; exception: none.
- Return a mismatch with evidence instead of changing scope or an interface; exception is a revised brief from B authorizing that change.

Reasons restated: scope stays in one file, single definition holds, no vanity tests, no fixed template. Exception restated: only a revised brief from B authorizes a scope or interface change.

## 6. Ordered steps

1. Read SKILL.md Take and Handoff plus standing-design.md (criteria 1-3).
2. Derive the three grep checks before editing: canonical paragraph present, "before dispatch" absent, Handoff cross-ref present (criteria 1-3).
3. Edit `skills/chart-issues/SKILL.md` per section 4 (criteria 1-3).
4. Run `bun install` once in the worker worktree, then section 7 command; run the three greps and read the edited paragraphs (criteria 1-3).
5. Commit only `skills/chart-issues/SKILL.md` in the worker worktree and record the commit id.

Advisory size: 1 file, under 8 turns.

## 7. Commands

`: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE"` with `AKROGON_BASE=1607ee7fbf4a2362340c2d6b8de4257d72684ec6`. Expected to select no tests for markdown-only changes; the section 6 greps are the real check here.

## 8. Done-when, evidence and report

Done when criteria 1-3 hold in the worker worktree, the section 7 command exits 0, and the single-file commit exists. Paste grep outputs and the section 7 result. No end-to-end artifact applies to prose.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
