# Sub-brief U2: config.md harnesses row

Worktree: /home/ivan/.akrogon/worktrees/akrogon/claude-seats-deny-prompts-u2

## 1. Goal

Implement plan D4: the `harnesses` row in docs/reference/config.md documents the new claude
`--settings` behavior in one clause, so an operator writing a harness line knows what merges and
what refuses.

## 2. Numbered acceptance criteria

1. The `harnesses` table row in docs/reference/config.md (machine config.yaml section, ~line 29)
   gains one clause covering: for a `claude` harness line, akrogon merges
   `permissions.denyInsteadOfPrompting: true` into the line's one `--settings` JSON object or adds
   it when the line has none; a line whose settings it cannot merge without dropping a setting
   (a non-object or missing value, a non-object `permissions`, more than one `--settings`, or a
   `--` token) is refused at launch naming the operand.
2. The change is inside the existing table cell; no new section, no rewrite of other rows.
3. docs-links test stays green (no broken links/anchors).

## 3. Read-first list

- docs/reference/config.md — the `harnesses` row, machine config.yaml table.
- tests/docs-links.test.ts — the targeted check for doc edits.
- /home/ivan/.pi/agent/skills/implement-issue/ponytail.md — read it.

## 4. Change list and needed interfaces

Owns: docs/reference/config.md, the `harnesses` row only. No prerequisite chunks; no shared test
resource. Style: rows are one sentence fragments; match that.

## 5. Do-not, reasons and exceptions

- Do not edit any other file, row or section: the plan scopes this unit to the one row.
- Do not document behavior outside the leaf (no startup dialogs, no watch, no other harnesses):
  the leaf's claim is the claude `--settings` merge only.
- Do not add a doc page or a new heading: one clause in the existing cell.
- Return a mismatch with evidence instead of changing scope; the exception is a revised brief
  from A authorizing that change.

## 6. Ordered steps

1. `bun install --frozen-lockfile --backend=copyfile` in the worktree.
2. Read the `harnesses` row and two neighbors for style; write the clause.
3. Run `akrogon run-check --name docs-links -- bun test tests/docs-links.test.ts`.
4. Commit docs/reference/config.md (docs-style message; no trailer needed).
5. Fill the report lines below and return them with the commit ID and the `check` line.

Advisory size: 1 file, under 6 turns.

## 7. Commands

- `akrogon run-check --name docs-links -- bun test tests/docs-links.test.ts`.

## 8. Done-when, evidence and report

Green `check docs-links: 0 <log>` line, one commit changing only docs/reference/config.md. Return:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
