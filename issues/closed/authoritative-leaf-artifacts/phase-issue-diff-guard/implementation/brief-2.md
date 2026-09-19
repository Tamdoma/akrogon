# Brief 2: update prose that describes the review-only issues/ rule

## 1. Goal

The `issues/` branch check now runs on every phase move with a recorded worktree, not only at review handoff. Update the three prose spots that state or imply the old review-only scope. Plan decision D5.

## 2. Numbered acceptance criteria

1. `src/AREA.md:20` becomes exactly: `- Every phase move rejects a dirty worktree and branch changes under \`issues/\`; the empty-branch refusal applies only at review handoff.`
2. `docs/guide/files.html:60` second sentence becomes exactly: `The <code>phase</code> command checks this on every move and refuses if it finds one.`
3. `docs/guide/limits.html:63` card body becomes exactly: `Every phase move refuses any file under <code>issues/</code> on the branch, and refuses a dirty worktree. The move into review also refuses an empty branch. Agents write issue files only in the registered checkout.`
4. `docs/guide/phases.html:61` and `docs/guide/problems.html:66` are unchanged — both describe the implement→review move, which is still refused, and neither claims the check is review-only.
5. `grep -rn "issues/" docs/guide/ skills/*/SKILL.md` shows no remaining wording claiming the `issues/` check runs only at review handoff.

## 3. Read-first list

- `src/AREA.md` — line 20 under "Non-obvious patterns".
- `docs/guide/files.html` — line 60, the "two writers" paragraph.
- `docs/guide/limits.html` — line 63, the "Issue files never go on a leaf branch" card.
- `docs/guide/phases.html:61`, `docs/guide/problems.html:66` — verify they need no change, then leave them.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`

## 4. Change list and needed interfaces

Three single-line text edits, applied verbatim from criteria 1-3. No code, no interfaces.

## 5. Do-not, reasons and exceptions

- Do not edit `skills/*/SKILL.md` — implement-issue:39 already states the rule without review scoping, and the parallel `prompt-leaf-folder` leaf may touch skill prose.
- Do not edit `docs/guide/phases.html` or `problems.html` — criterion 4 keeps them byte-identical.
- Do not rephrase beyond the exact strings in criteria 1-3 — the plan locks the wording.
- Return a mismatch with evidence to the plan author instead of changing scope; the exception is a revised brief from B authorizing that change.

Restated: exactly three line edits; anything else comes back as a mismatch.

## 6. Ordered steps

1. Apply the three edits (criteria 1-3).
2. Run the greps in criterion 5 and `grep -rn "handoff" docs/guide/files.html docs/guide/limits.html src/AREA.md`; confirm no review-only claim remains — paste output.
3. Run the changed-test command; zero or few tests is expected for a prose-only diff — paste output.

Advisory size: 3 files, under 12 turns.

## 7. Commands

```bash
export AKROGON_BASE=e624357e825e21b38a15c07a435b1ff066c6ba38
bun test --changed="$AKROGON_BASE"
```

Run from the worktree root. Do not run the full suite; B does that.

## 8. Done-when, evidence and report

All five criteria hold; grep output pasted showing no review-only wording remains.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
