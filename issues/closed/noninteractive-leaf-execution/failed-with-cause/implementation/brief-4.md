# Brief 4: check.fix round 1 — whitespace-only --reason, stale AREA.md line

## 1. Goal

Repair review-A finding F1: `--reason` accepts whitespace-only input, contradicting plan D2's "empty or whitespace-only is refused". Also correct the stale `src/AREA.md` invariant both reviewers flagged (N1). Do not weaken any criterion or existing test.

## 2. Numbered acceptance criteria

1. `akrogon phase <slug> failed --reason ' '` (and `--reason ''`) is refused with a nonzero exit; the leaf's `state.yaml` is unchanged.
2. `akrogon phase <slug> failed --reason '  real reason  '` still succeeds; the stored `failure.reason` is the trimmed text `real reason`.
3. A `state.yaml` written with `failure.reason: ' '` is rejected by `readState` (schema-level protection identical to the boundary).
4. `src/AREA.md` no longer claims every phase move rejects a dirty worktree; the corrected line names the two exceptions (stop into `failed`, `cause: blocked` restart) and keeps the issue-files and empty-branch facts accurate.

## 3. Read-first list

- `src/phase.ts` — `phaseCommand` parses `rawReason` as `z.string().min(1).optional()` near the bottom of the file.
- `src/state.ts` — `failureSchema` has `reason: z.string().min(1)`.
- `src/AREA.md` — the "Non-obvious patterns" bullet "Every phase move rejects a dirty worktree and branch changes under `issues/`; the empty-branch refusal applies only at review handoff."
- `tests/phase.test.ts` — the `failed routing and reason misuse are guarded` test is the place to extend for criteria 1–2.
- `tests/state.test.ts` — the `failure record round-trips and rejects unknown keys` test is the place to extend for criterion 3.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

- `src/phase.ts`: `rawReason` parse becomes `z.string().trim().min(1).optional().parse(rawReason)` — trims and refuses whitespace-only at the boundary.
- `src/state.ts`: `failureSchema.reason` becomes `z.string().trim().min(1)` — same protection for stored records.
- `src/AREA.md`: replace the stale bullet with an accurate one, e.g. "Phase moves reject a dirty worktree and branch changes under `issues/`; a stop into `failed` skips both, a `cause: blocked` restart skips only the dirty check, and the empty-branch refusal applies only at review handoff." Keep it one bullet; the file's section layout is fixed.
- `tests/phase.test.ts`: extend the reason-misuse test — `--reason ' '` refuses (assert nonzero exit and unchanged `state.yaml` bytes via the existing `bytes()` helper), and a padded reason stores trimmed text.
- `tests/state.test.ts`: extend the failure round-trip test — `failure.reason: ' '` throws `z.ZodError`.

## 5. Do-not, reasons and exceptions

- Do not touch `src/next.ts`, `src/status.ts`, `src/routing.ts`, `src/akrogon.ts`, `README.md` — unrelated to the findings; exception: none.
- Do not remove the `slot ?? required[0]` fallbacks or the `reason as string` cast — review-A N2 records them as harmless type-level fallbacks; removing them breaks typecheck.
- Do not change any other `AREA.md` section or exceed its 40-line / four-section layout.
- Do not weaken or delete existing tests.
- Do not commit — B commits after the full suite.
- Return a mismatch with evidence instead of changing an interface; the exception is a revised brief from B.

## 6. Ordered steps

1. Extend the two tests for criteria 1–3 (red).
2. Apply the `.trim().min(1)` edits in `src/phase.ts` and `src/state.ts` (green).
3. Correct the `src/AREA.md` bullet (criterion 4 — verify by reading the file).

Advisory size: about 4 files, under 15 turns.

## 7. Commands

`: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE"` with `AKROGON_BASE=43ef0f7a7cb8908df33a734bbdee406b1563d408`. Run from the worktree root. B runs the full suite separately.

## 8. Done-when, evidence and report

Criteria 1–3 verified by the extended tests passing under the changed-tests command; criterion 4 verified by the corrected bullet text. Pasted command output required.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
