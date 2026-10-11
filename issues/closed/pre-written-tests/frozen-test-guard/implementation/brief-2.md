# Brief 2: frozen-test-guard — doc lines

Worktree: `/home/ivan/Work/infra/akrogon/issues/worktrees/frozen-test-guard-u2`

## 1. Goal

Update the owned doc lines to describe the new frozen-record guard (plan D10, brief criterion 7): the `plan.synthesis`→`implement` move records every path the branch changed against the target (content id, or absent for deletions); a later phase move refuses a recorded path whose content changed or vanished, or a newly added `src/test-files.ts`-matched path outside the record, until a `Test-Change: <path> <source and reason>` trailer names it in the last commit touching that path or a later commit; the existing changed/deleted-old-test-file rule is unchanged. `frozen` joins the command-owned state fields.

## 2. Numbered acceptance criteria

1. `skills/implement-issue/SKILL.md:64` — extend the paragraph (today's `:64` only; `:84` is another leaf's file, do not touch) to also state: the `plan.synthesis`→`implement` move records every branch-changed path in state; a later move refuses a recorded path changed or gone, or an added `src/test-files.ts`-matched path outside the record, until a `Test-Change:` trailer names it in the last commit touching it or a later commit (a trailer-only empty commit stays the allowed exception).
2. `skills/merge-issue/SKILL.md:51` — same rule folded into the parenthetical trailer sentence (today's `:51` only).
3. `skills/implement-issue/brief-template.md:45` — the worker trailer rule gains the added-matched-path/outside-record and recorded-path-drift cases with the same citation window.
4. `skills/chart-issues/assets/shapes.md` — the command-owned state-field sentence (today `:276`: "Attempts, done, fix_rounds, verdict, pane, tab, prompted and worktree belong to the command and are not door-authored.") adds `frozen`.
5. `docs/guide/merge.md:11` — the "Every phase move except a move to `failed`" paragraph gains the record-and-refusal sentence.
6. `README.md:134` — the phase-command row's "Moves except failed refuse changed old test files without Test-Change trailers" gains the frozen-record rule in the same compact style.
7. `src/AREA.md` — one new Non-obvious patterns bullet stating the record write point and refusal; keep the section and file within its shape (Commands / Key files / Non-obvious patterns / See also, ≤40 lines total).
8. Sweep `grep -rn "Test-Change\|test-files\|trailer" docs/ skills/ README.md` in the worktree; confirm each un-owned hit does not contradict the rule or list it as a limitation. Known non-conflicting: `skills/check-issue/SKILL.md:47` (B's review duty over all trailers in range), `:83` (existing-file rule, still true), `skills/merge-issue/SKILL.md:43` and `:65`, `docs/guide/phases.md:92`, `docs/guide/merge.md:17`.

## 3. Read-first list

- The seven owned files/lines above (read each before editing).
- `skills/implement-issue/ponytail.md`.
- `design.md` and `plan.md` in the leaf folder for wording the rule — do not copy headers, just the mechanics: record at `plan.synthesis`→`implement`, blob-id compare, last-touching-or-later trailer, existing M/D/T rule unchanged.

## 4. Change list and needed interfaces

Owns: the seven paths above only. No shared test resource. No prerequisite — wave 1 with U1 (code); the rule text above is already the settled interface (D-numbers fixed in plan).

## 5. Do-not, reasons and exceptions

- Do not touch `skills/implement-issue/SKILL.md:84`, `skills/check-issue/SKILL.md`, or `src/phase.ts`/`src/state.ts`/tests — owned by other leaves/units.
- Do not describe who may write tests, citation-source rules, or proof machinery — those belong to `test-proof-rules`; this leaf owns only the mechanical refusal.
- Do not reword unrelated sentences — minimal diff per file.
- Return a mismatch with evidence instead of widening scope; the exception is a revised brief from A.
- Reasons restated: sibling leaves own the excluded lines, scope is the mechanical refusal, minimal diffs keep review cheap; a mismatch goes back, never a self-decided change.

## 6. Ordered steps

1. Edit the seven files per criteria 1-7.
2. Run the sweep command (criterion 8) and record hits.
3. `bun test tests/docs-links.test.ts` in the worktree (after `bun install`) to prove no broken links.
4. Commit once: `docs: describe frozen planning-file record and trailer rule`.
- Advisory size: about 7 small edits, under 30 turns; beyond that return a mismatch with evidence.

## 7. Commands

`bun test --changed=354c80e14aca6483c430312c61ae5c1397bb548e --timeout=30000` plus `bun test tests/docs-links.test.ts` in the worktree.

## 8. Done-when, evidence and report

All eight criteria met with the sweep result and test output pasted. Report below:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
