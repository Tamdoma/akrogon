# Brief U2: operator guide — seat front matter

## 1. Goal

Plan D8/criterion 6 of `index-seats`: `docs/guide/cheat.md` and `docs/guide/files.md` each show the `slots:` front matter block for `ISSUE.md`/`EPIC.md` and the resolution order, in one place each.

## 2. Numbered acceptance criteria

1. `docs/guide/cheat.md` shows a YAML front matter example beside or after the existing `slots:` repo example (lines ~30-37), naming `ISSUE.md`/`EPIC.md` and the resolution order: issue `ISSUE.md`, then epic `EPIC.md`, then repo `issues/config.yaml`, then machine `config.yaml`; nearest seat wins; applies at the next agent start.
2. `docs/guide/files.md` shows the same block and order under the artifact descriptions for `ISSUE.md`/`EPIC.md` (the `ISSUE.md`/`EPIC.md` bullet area, ~lines 19-24).
3. Wording stays terse guide style; no new files, no other guide pages touched.

## 3. Read-first list

- `docs/guide/cheat.md` — full file; the existing repo `slots` example at lines 30-37 is the pattern to mirror.
- `docs/guide/files.md` — full file; the `## What each artifact is` list is the target.
- `docs/guide/setup.md` line 59 — existing `slots` prose for terminology consistency.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

Owns `docs/guide/cheat.md` and `docs/guide/files.md`. No code, no prerequisites, no shared resources.

The front matter shape to document:

```markdown
---
slots:
  b:
    harness: codex
    model: gpt-5
    effort: high
---
# Issue: my-issue
```

Valid values: whole seat `{harness, model, effort}`, seats `a`/`b` only; malformed blocks fail `next`/`status`/`config` naming the file.

## 5. Do-not, reasons and exceptions

- Do not edit code, tests, or other guide files (`setup.md`, `parts.md`, `next.md` etc.) — out of scope per criterion 6; a needed change elsewhere is a mismatch returned with evidence.
- Do not invent features not in this brief (no `state.yaml` override, no per-phase seats).
- Mismatch return, not scope drift; exception is a revised brief from A.

## 6. Ordered steps

1. Read the read-first files.
2. Edit `cheat.md`: extend or follow the repo `slots` block with the index front matter form and the one-line resolution order.
3. Edit `files.md`: document that `ISSUE.md`/`EPIC.md` may open with the `slots` front matter block and give the same resolution order, one place.
4. `bun test tests/docs-links.test.ts --timeout=30000` to confirm no broken links/anchors.
5. Commit with a `docs:` message. No test files, so no `Test-Change` trailer.

Advisory size: 2 files, under 12 turns.

## 7. Commands

```sh
bun test tests/docs-links.test.ts --timeout=30000
```

## 8. Done-when, evidence and report

Both files show the block and resolution order; docs-links test green; commit id returned. Report:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
