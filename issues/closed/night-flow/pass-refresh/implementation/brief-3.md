# Brief 3: stale-doc lines for the pass refresh

## 1. Goal

Update the two docs lines that describe A's proof so they mention the leaf branch refresh onto current main (plan D5). Skill-text leaf; these are stale-doc updates, not claims removal.

## 2. Numbered acceptance criteria

1. `docs/guide/phases.md:94` — the sentence `A runs changed tests as work lands, then criterion proof plus every `checks` command before handoff and after repair...` mentions that A refreshes the leaf branch onto current main before that proof (one clause, e.g. `after refreshing the leaf branch onto current main` placed before `then criterion proof` or equivalent wording).
2. `skills/AREA.md` — the bullet `Worker returns include changed-test evidence; A runs criterion proof plus every `checks` command before review...` gets the same refresh mention, and the file stays ≤40 lines with exactly `Commands`, `Key files`, `Non-obvious patterns`, `See also` as second-level sections.
3. No other file changes; no other line in either file changes.

## 3. Read-first list

- `docs/guide/phases.md:94` — the sentence, in the A-pass description.
- `skills/AREA.md` — 33 lines; the bullet sits under `## Non-obvious patterns` (~`:24`).
- `skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

Owns: `docs/guide/phases.md`, `skills/AREA.md`. Nothing must land first; no shared test resource.

The exact refreshed wording is yours; keep it one clause each and do not claim the refresh happens "at merge" — it happens at A pass boundaries.

## 5. Do-not, reasons and exceptions

- Do not edit any other file: skill files and tests are owned by sibling units or A. Exception: none — return a mismatch.
- Do not touch `tests/` or add wording about merge_checks, base-run or comparison records: out of scope for these two lines. Exception: none.
- Do not exceed the AREA.md 40-line cap or rename its sections: the implement-issue doc rule requires both. Exception: none.

Reasons restated: owned paths only, minimal wording delta, AREA.md shape preserved. Exceptions restated: only a revised brief from A.

## 6. Ordered steps

1. Read both files at the named lines.
2. Make the two one-clause edits.
3. Run `bun install --frozen-lockfile` and `bun test tests/skill-refresh.test.ts` in the worktree: your edits must not turn any currently-green test red (this file does not assert these two docs; a failure means you touched something else).
4. Commit both files in one commit, e.g. `docs: leaf branch refresh before A proof`; return the commit id.

Advisory size: 2 files, under 6 turns.

## 7. Commands

`bun test tests/skill-refresh.test.ts` from the worktree after `bun install --frozen-lockfile`. AKROGON_BASE=22ede6c12f7d3b3beb2c7dadeb1bc4aea81d6192.

## 8. Done-when, evidence and report

Done when criteria 1-3 hold. Commit; paste commit id and the test summary.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
