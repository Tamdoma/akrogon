# Sub-brief 2: document `failures` (unit U2)

Worktree: /home/ivan/.akrogon/worktrees/akrogon/stored-failure-names-u2 (detached HEAD 6d0541e1)

## 1. Goal

Plan decision D5, criterion C6: `docs/reference/files.md` and `src/AREA.md` state the new `verify-runs.jsonl` command-entry field `failures` — which entries carry it, who reads it stored-first, who never reads it, and that an akrogon older than this change cannot parse a ledger holding it.

## 2. Numbered acceptance criteria

1. `docs/reference/files.md`, the `verify-runs.jsonl` table row (~line 71): the entry description gains `failures` — a non-empty deduplicated list of the entry's log's failure names, stored only on an entry whose own command ran and exited non-zero (never on `blocked`, reused, exit 0 or setup-failed entries, never `(log gone)`); `flaky` and the main-red-unit matcher read it instead of the log when present, while the known-red receipt never reads it and always needs both logs; an akrogon older than this change cannot parse a ledger holding the field.
2. `docs/reference/files.md`, the `## Flaky report` paragraph (~line 93): for each name the red entry records — stored `failures` first, the log's Bun lines otherwise — `(fail)` title, `(unnamed) <script>`, `(script) <script>`, `(no test name)` or `(log gone)` — the same sentence updated, not duplicated.
3. `src/AREA.md`, the `src/verify.ts` bullet (~line 17): the entry description states the same writer/reader rules in that paragraph's compressed style (one or two clauses, no new paragraph).
4. `bun test tests/docs-links.test.ts` green; `bunx prettier --check docs/reference/files.md src/AREA.md` clean.
5. `grep -nF '\`failures\`' docs/reference/files.md src/AREA.md` hits the new statements.

## 3. Read-first list

- docs/reference/files.md lines 60–100 (records table + flaky paragraph).
- src/AREA.md lines 13–35 (verify.ts bullet, rewrite bullet).
- src/verify.ts `verifyRunSchema` and src/flaky.ts `flips` for the exact behavior (field may not exist on this HEAD — write the doc for the behavior described in §2, which is the leaf's implementation contract).
- /home/ivan/.pi/agent/skills/implement-issue/ponytail.md.

Pattern to copy: the existing compressed clause style in both files; `reused`/`blocked` are already described inline.

## 4. Change list and needed interfaces

- docs/reference/files.md: extend the `verify-runs.jsonl` table cell and the `## Flaky report` sentence.
- src/AREA.md: extend the `src/verify.ts` bullet where it describes the recorded receipt (before or inside the `--known-red` clause) and, if natural, the rewrite bullet at line ~31.
- Owned paths: docs/reference/files.md, src/AREA.md only. `src/AREA.md` keeps its section shape (Commands, Key files, Non-obvious patterns, See also; bullet stays under ~40 lines).

## 5. Do-not, reasons and exceptions

- Do not edit any test, src file, or `issues/`: this unit owns only the two doc files. Exception: none.
- Do not document a second file or recovery path: there is none by design. Exception: none.
- Do not reformat untouched lines beyond what prettier requires. Exception: none.
- Do not claim the field exists on this HEAD in src/: the schema lands in a parallel unit; write the docs for the stated contract. Exception: none.
- Restated: every exclusion above has its reason in-line; the only exception path is a mismatch returned to A.

## 6. Ordered steps

1. Edit docs/reference/files.md (table row + flaky sentence).
2. Edit src/AREA.md verify bullet.
3. `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile --backend=copyfile'` then `bun test tests/docs-links.test.ts`.
4. `bunx prettier --check docs/reference/files.md src/AREA.md`; prettier-write if needed; rerun the grep from §2.5.
5. Commit one commit on the detached HEAD (`docs: stored failure names ...`); return the commit ID.

Advisory size: about 2 files, under 8 turns.

## 7. Commands

- `bun test tests/docs-links.test.ts`
- `bunx prettier --check docs/reference/files.md src/AREA.md`
- `sh -c "grep -nF '\`failures\`' docs/reference/files.md src/AREA.md"`

## 8. Done-when, evidence and report

All five criteria green: both files state the contract, docs-links and prettier green, grep hits, one commit, clean tree. Paste the command results.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
