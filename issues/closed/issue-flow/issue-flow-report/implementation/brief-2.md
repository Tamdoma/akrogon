# Worker brief 2: docs for the flow report (unit U2)

Worktree: `/home/ivan/.akrogon/worktrees/akrogon/issue-flow-report-u2` (detached at the leaf test commit c7c9b42). You own exactly `README.md`, `docs/guide/files.md`, `src/AREA.md`. Touch nothing else — no source, no tests.

## 1. Goal

Document `akrogon timing --flow --since <YYYY-MM-DD>` per plan decision D10: README command row, guide paragraph, AREA line. The command prints one line per leaf-carried GitHub issue (filed time, handoff date = earliest leaf `created`, merged time or `open`, wait in whole days, total span `X.Xd`, leaf count), one line per open issue of the origin repo that no leaf carries, then summary lines splitting handed-off issues into before/on-or-after `--since` on the handoff date, plus backlog median/oldest age and the count of closed issues no leaf carries. It covers leaf-carried issues only and is read-only.

## 2. Acceptance criteria

1. `README.md` command table: the `akrogon timing` row reads `| \`akrogon timing [<slug>\|--cohort --since <iso>\|--flow --since <YYYY-MM-DD>]\` | <effect> |` — keep/extend the effect text to cover the flow report in the row's existing style.
2. `docs/guide/files.md` `## akrogon timing` section: one new paragraph after the `--cohort` paragraph describing `akrogon timing --flow --since <YYYY-MM-DD>`; it must contain the literal string `akrogon timing --flow --since <YYYY-MM-DD>` and the term `leaf-carried`, name the handoff-date split and the GitHub listing reads (one `state=all` listing per repository, PRs dropped), and state read-only like the other paragraphs.
3. `src/AREA.md`: extend the `src/timing-report.ts` Key-files line to mention the `--flow` issue report. Keep the file's structure (Commands / Key files / Non-obvious patterns / See also) and it stays under 40 lines — current file is near that, so extend the existing line, never add lines elsewhere.

The committed tests pin the README row shape (`tests/command-reference.test.ts` contract) and the two literal guide strings. Do not edit tests.

## 3. Read-first list

- `README.md` line ~141 — the timing row to change.
- `docs/guide/files.md` `## akrogon timing` — copy the existing paragraph style.
- `src/AREA.md` — the `timing-report.ts` line.
- `tests/command-reference.test.ts` — see what the contract asserts (read only).
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and interfaces

Three file edits, no interfaces. Owns: `README.md`, `docs/guide/files.md`, `src/AREA.md` only.

## 5. Do-not, reasons and exceptions

- Do not edit code or tests — docs only; a wrong test expectation is a mismatch.
- Do not document options or output fields beyond what the command does (criteria 1–3 above) — accuracy over completeness.
- Do not restructure the guide or README — one row, one paragraph, one line.
- Return a mismatch instead of widening scope; the exception is a revised brief from A.

## 6. Ordered steps

1. `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile'` in your worktree.
2. Edit the README row; confirm it parses (criterion 1).
3. Write the guide paragraph; confirm both literal strings present (criterion 2).
4. Extend the AREA line; confirm file ≤40 lines (criterion 3).
5. Run the command in section 7 — the two command-reference cases must be green. The `flow report:` tests in timing-report.test.ts fail in your worktree (product code is another worker's); that is expected, do not chase them.

Advisory size: 3 files, under 15 turns.

## 7. Commands

- `bun test --timeout=30000 tests/command-reference.test.ts`

## 8. Done-when, evidence and report

`tests/command-reference.test.ts` fully green in your worktree. Commit only your three files; message like `docs: akrogon timing --flow issue report` — no Test-Change trailer. Then fill:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
