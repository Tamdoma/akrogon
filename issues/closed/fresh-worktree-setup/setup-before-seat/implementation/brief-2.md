# Sub-brief 2: reference docs for dispatch-time setup (unit W1-U2)

Wave 1. Commit A created the worker worktree at: `44c72f78` (confirmed).

## 1. Goal

Implement plan decision D9 and done-criterion 7: `docs/reference/config.md`, `docs/reference/checks.md` and `src/AREA.md` state that `setup` also runs in a leaf worktree before a seat works there, once per checkout state. Owns exactly `docs/reference/config.md`, `docs/reference/checks.md`, `src/AREA.md`. No other unit touches these paths.

## 2. Numbered acceptance criteria

7. `docs/reference/config.md` (`setup` row), `docs/reference/checks.md` (`setup` paragraph) and `src/AREA.md` (first-allocation pattern and the `akrogon config` composition note) say that `setup` also runs in a leaf worktree before a seat works there, once per checkout state. Proof: the reviewing seat reads the diff.

There are no mechanical tests for the wording; the docs-link tests must stay green (they check link integrity only).

## 3. Read-first list

In your worktree:

1. `docs/reference/config.md` — the `setup` row and its surrounding table/prose.
2. `docs/reference/checks.md` — the `setup` paragraphs.
3. `src/AREA.md` — the "first allocation" pattern paragraph and the `akrogon config` composition note.
4. `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

The mechanism you are documenting (write about this, do not invent your own):

- When a repo configures `setup`, akrogon runs it in a leaf worktree before any seat works there: on dispatch start, re-prompt, `akrogon seat` and broadcast. It runs once per checkout state, tracked by a marker at the worktree's `git rev-parse --git-path akrogon-setup` holding the exact setup string; a changed string reruns it. It runs under the worktree's install lock with the same constructed env checks use, followed by the own-modules check. `src/batch.ts`'s worktree move deletes the marker, so a leaf restacked onto a new top is set up again. While a seat of the leaf is actively working (or a run-check is live), a due setup holds the leaf: nothing is delivered and `akrogon seat` refuses, until the seat settles. A failed setup is reported per leaf, removes a just-created worktree, and is retried on the next pass.

Reference for depth (read-only): `/home/ivan/Work/infra/akrogon/issues/open/fresh-worktree-setup/setup-before-seat/plan.md` and `design.md`.

## 4. Change list and needed interfaces

Chunks that must land first: none (wave 1; the design fixes the mechanism, so docs do not wait for code). Consumed output: none. Shared test resources: none (unit 1 runs `tests/setup-*.test.ts`, you run the docs tests below).

- `docs/reference/config.md`: extend the `setup` row so it says setup runs before check commands **and** in a leaf worktree before a seat works there, once per checkout state. Match the table's existing terse style; keep the row one row.
- `docs/reference/checks.md`: extend the `setup` paragraph with the dispatch-time duty — where it runs, the once-per-checkout-state marker behavior, the busy gate in one clause. Match surrounding prose density; this reference is written for reading, keep it tight.
- `src/AREA.md`: two edits — the "first allocation" pattern paragraph gains the setup duty (marker, busy gate, removal of a just-created worktree on failure); the `akrogon config` composition note (where it says setup runs before check commands) gains the dispatch-time run. The file must stay at most 40 lines with exactly the sections Commands, Key files, Non-obvious patterns, See also — count lines after editing and compress elsewhere in the same file if you exceed 40.

## 5. Do-not, reasons and exceptions

- Do not edit any other file — no source, no tests, no skills, no other docs; the plan names exactly these three. Exception: none.
- Do not document implementation internals beyond what a maintainer needs (no function names in the reference docs unless the surrounding text already uses them). Reason: the docs describe behavior, not the diff. Exception: `src/AREA.md` names mechanisms and paths as it already does.
- Do not change an interface or scope; return a mismatch with evidence instead. Exception: a revised brief from A authorizing the change.
- Never run any `git stash` subcommand: every worktree of the repo shares one stash and a pop can lift a sibling's edit. To set work aside: commit it as a WIP commit and, before returning, `git reset --soft <creation commit>` and make the unit's returned commit once, so A's cherry-pick of that one commit carries all the work.
- Restated: exactly three files, behavior-level wording, no stash ever, WIP squashes into one returned commit.

## 6. Ordered steps

1. Install dependencies in your worktree first: `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile --backend=copyfile'` (needed for the docs-link tests).
2. Read the three files and the mechanism description above.
3. Edit `docs/reference/config.md`, then `docs/reference/checks.md`, then `src/AREA.md` (criterion 7). Keep every edit in the file's existing voice.
4. Run the docs-link tests (section 7).
5. Squash into one commit if needed; commit message: `docs: setup runs in leaf worktrees before seats` or similar honest summary.

Advisory size: 3 files, under 25 turns. Beyond that, return a mismatch with evidence.

## 7. Commands

Run through `akrogon run-check` and cite the printed `check <label>: <exit> <path>` line in your report:

- `akrogon run-check --name u2-docslinks -- bun test tests/docs-links.test.ts tests/command-reference.test.ts --timeout 120000`

Never run `akrogon verify` and never the full suite.

## 8. Done-when, evidence and report

Docs-link tests green on your commit, cited with the `check <label>: <exit> <path>` line. `src/AREA.md` at most 40 lines. Your one commit on the worker branch, its ID in the report. Read back any cited log with `akrogon log <path>`; paste at most short excerpts.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
