# Brief U2: report docs

## 1. Goal

Document the picked-leaf report in `docs/guide/next.md` per plan D1, D2, D9 and brief criterion 9.

## 2. Numbered acceptance criteria

1. A new section after How order is decided names manual subjects: `next <target>`, typed bare `next` without event JSON, and `next --all` inside or outside a repo.
2. The section lists the three reasons in order: failed needing phase recovery, unmerged deps with phase or parked, missing or unreadable, missing inputs by kind, name and holder with never values.
3. The section states one line per picked leaf, ready siblings still start, any line sets exit 1, and automatic passes (`--resume`, Herdr events, merge wake) plus dependents plus merge turn, capacity and busy seats stay quiet.

## 3. Read-first list

- `docs/guide/next.md` (How order is decided, Release work without managing every prompt).
- Pattern to copy: the existing How order is decided prose shape, short paragraphs plus one `sh` fence only when needed.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.
- Open the index only for a gap in this list.

## 4. Change list and needed interfaces

Chunks that must land first: none. Paths owned: `docs/guide/next.md`. Shared test resource: none. Consumed output: none.

- Add one section titled `When picked work cannot start` after How order is decided and before Release work without managing every prompt. Cover subjects from criterion 1, reasons from criterion 2, and exit plus silence from criterion 3. Keep target-forms wording untouched for sibling `named-targets`.

## 5. Do-not, reasons and exceptions

- Do not touch code, tests, `docs/guide/parts.md`, or the target-forms paragraphs in `docs/guide/next.md`. Reason: U1 plus U3 own code, U4 owns tests, sibling owns target forms. Exception: none.
- Do not quote exact CLI error strings. Reason: tests assert substrings, prose quotes would couple docs to wording. Exception: fixed tokens `parked`, `missing`, `unreadable`, `exit 1`, `phase recovery` are allowed.
- Mismatch rule: return a mismatch with evidence to A instead of changing scope. Exception: a revised brief from A authorizing that change.
- Restated: edit only the one owned file in its new section, avoid exact error quotes, and mismatch rather than widen scope, unless A revises this brief.

## 6. Ordered steps

1. In `docs/guide/next.md`, insert the new section for criteria 1-3.
2. Grep the file for `phase recovery`, `exit 1`, `parked`, `missing`, `unreadable`, and `automatic` to confirm criteria 1-3.

Advisory size: 1 file, under 4 turns.

## 7. Commands

Run only this changed-test command from the worker worktree, after `bun install` there when `node_modules` is absent:

```sh
export AKROGON_BASE=3e034dee43f0853446c2ba8f97bb72668ab213dc
: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000
```

A runs criterion proof and every `checks` command separately.

## 8. Done-when, evidence and report

Done when criteria 1-3 hold, only the owned file differs, grep hits are pasted, and the changed-test command result is pasted. No end-to-end artifact is required.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
