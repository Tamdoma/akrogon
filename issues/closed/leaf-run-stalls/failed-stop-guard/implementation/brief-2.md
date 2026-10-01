# Brief-2: failed-stop-guard U2 docs (owns docs/guide/problems.md, docs/guide/phases.md)

## 1. Goal

Add the one guard sentence per guide file (plan D8, criterion C5) so an operator
reading either recovery section learns that `--slot` calls cannot move a failed leaf.

## 2. Numbered acceptance criteria

- B2.1: `docs/guide/problems.md`, in the `The leaf is failed.` section after the
  resume code block (`akrogon phase export-csv implement` / `akrogon next
  export-csv`), adds exactly this sentence: `A call carrying `--slot` cannot
  move a failed leaf; recovery omits `--slot` after the blocker is resolved.`
- B2.2: `docs/guide/phases.md`, in the `Failed can resume at any active phase...`
  paragraph, appends exactly this sentence: `A call carrying `--slot` cannot
  move a failed leaf; recovery omits `--slot`.`
- B2.3: No other line in either file changes; no new links or anchors are added.

## 3. Read-first list

- `docs/guide/problems.md` (`The leaf is failed.` section)
- `docs/guide/phases.md` (failed recovery paragraph under `How a phase moves`)
- This skill folder's `ponytail.md`
- Copy the existing plain-sentence style of the surrounding paragraphs. Open the
  index only for a gap in this list.

## 4. Change list and needed interfaces

- Owns: `docs/guide/problems.md`, `docs/guide/phases.md`. One sentence each.
- No prerequisites; lands in wave 1 alongside tests. No interface or output is
  consumed by any other unit.
- No code signatures needed. Verify by reading the edited sections; the
  docs-links test covers link integrity and this change adds no links.

## 5. Do-not, reasons and exceptions

- Do not reword the sentences: the wording is locked by the plan. Exception: a
  revised brief from A.
- Do not touch any other file: docs-only unit, keeps the pick clean. Exception:
  none; anything else is a mismatch with evidence.
- Do not change scope or an interface; return a mismatch with evidence to the
  plan author instead. Exception: a revised brief from A authorizing that change.
- Restated: no rewording (locked wording, only a revised brief changes it); no
  other files (keeps the pick clean, no exception); no scope or interface change
  (mismatch with evidence, only a revised brief authorizes it).

## 6. Ordered steps

1. `docs/guide/problems.md` (B2.1): insert the sentence after the resume code block.
2. `docs/guide/phases.md` (B2.2): append the sentence to the recovery paragraph.
3. Run the section 7 command and confirm it passes (a docs-only change selects
   no tests); paste surrounding lines of each insertion as evidence.
4. Commit only the two guide files.

Advisory size: about 2 files and under 8 turns; work clearly beyond it returns a
mismatch with evidence, not a hard cutoff.

## 7. Commands

Run only this, with edits in the working tree (before commit):

```sh
export AKROGON_BASE=2ad0acf70a85dacefa3a89c53a53233e2aae11ca
: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE"
```

Run `bun install` in the worktree first if dependencies are missing. Do not run
the full suite; A runs it.

## 8. Done-when, evidence and report

Done when B2.1-B2.3 hold: one exact sentence per file, nothing else changed,
command output pasted, only the two guide files committed. Report the commit ID
and fill these lines:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
