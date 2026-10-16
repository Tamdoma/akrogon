# Sub-brief 2: release-any-phase docs unit

Worktree: /home/ivan/.akrogon/worktrees/akrogon/release-any-phase-u2
Leaf branch HEAD: 9eda855.

## 1. Goal

Bring prose in line with the leaf's behavior change: reconcile stops the loaded slice of any leaf — not only merged or failed — whose recorded tab is proven gone, keeps an unfinished leaf's slice when no tab is recorded, and keeps a leaf's temp when the unit inventory is unreadable. No code changes in this unit.

## 2. Acceptance criteria

- A1: `README.md`'s reconcile paragraph no longer claims slice stopping is merged-or-failed-only and describes the unfinished-leaf rules (gone recorded tab stops; no recorded tab keeps; live run record and own-slice keeps unchanged).
- A2: `src/AREA.md`'s `src/reconcile.ts` bullet says "finished-leaf slices and unloaded…" only where still true; the slice-stop clause covers any leaf with a proven-gone recorded tab.
- A3: No other doc sentence contradicts the new rule; `docs/guide/limits.md`'s closed-tab statement is left alone (it describes merged-leaf temp deletion, still true).
- A4: `bunx prettier --check README.md src/AREA.md` clean.

## 3. Read-first list

- `README.md` ~line 121 — the long reconcile paragraph: "The same pass stops the systemd slice of a merged or failed leaf once its tab is gone…"
- `src/AREA.md` — `src/reconcile.ts` bullet: "stops finished-leaf slices and unmatched empty `akrogon-l*` slices…"
- `docs/guide/limits.md` line 18 — verify it needs no change.
- `/home/ivan/Work/infra/akrogon/issues/open/temp-release/release-any-phase/plan.md` — decisions D1-D6 for exact semantics.

## 4. Change list and needed interfaces

- `README.md`: rewrite only the slice clause, keeping sentence structure tight: the pass stops the loaded slice of any leaf whose recorded tab is proven gone — merged, failed or unfinished — unless a live run record names it or the pass runs inside it; an unfinished leaf with no recorded tab keeps its slice.
- `src/AREA.md`: same clause in the `reconcile.ts` bullet; also note the leaf-temp keep when the unit inventory is unreadable ("leaf temp … kept with an inventory-unavailable reason when the unit list cannot be read").
- `src/AREA.md` `src/next.ts` bullet: if it describes dispatch locking, check it still matches (manual merge dispatch now takes the global lock). Update only if a sentence is now false.
- Owned paths: `README.md`, `src/AREA.md`. No test resource, no prerequisite on other units.

## 5. Do-not, reasons and exceptions

- Do not edit code or tests — this unit is docs only. Exception: none; return a mismatch if a doc fix seems to require a code change.
- Do not touch `docs/guide/*.md`, `skills/`, `tests/AREA.md` or any other file unless it literally contradicts the new rule; report any such file you find instead of editing.
- Keep the AREA.md bullet format: one bullet per file, same terse style.

Reasons restated: docs-only scope keeps the diff reviewable; silent doc edits outside the plan hide drift from review.

## 6. Ordered steps

1. Read the listed files and `plan.md` decisions.
2. Edit `README.md` and `src/AREA.md`.
3. `bunx prettier --check README.md src/AREA.md`; fix formatting if flagged.
4. Commit with `git -c user.name=akrogon -c user.email=akrogon@localhost commit` (docs only; no `Test-Change` trailer needed since no test-file-matched path changes).

Advisory size: 2 files, under 8 turns.

## 7. Commands

- `bunx prettier --check README.md src/AREA.md` from the worktree.
- No test commands: this unit changes no tested behavior.

## 8. Done-when, evidence and report

Done when the two files describe the any-phase slice rule and the inventory-unavailable temp keep, prettier is clean, and the commit exists on the worktree HEAD.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
