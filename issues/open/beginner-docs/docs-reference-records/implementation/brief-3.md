# Brief 3: docs/reference/releases-and-updates.md

Worktree: /home/ivan/.akrogon/worktrees/akrogon/docs-reference-records-u3

## 1. Goal

Write docs/reference/releases-and-updates.md. Plan decisions D1, D2, D3, D4, D8, D10.

## 2. Numbered acceptance criteria

1. Explains the installed release versus the source checkout: where releases live, what "active" and "previous" mean, which one the `akrogon` command runs. Source: src/release.ts, src/self-update.ts, src/akrogon.ts.
2. Explains how registered checkouts follow main (what updates them and when). Source: src/self-update.ts and whatever it calls (trace it, e.g. sync or pull code).
3. Explains what triggers a deploy of a new release. Source: src/self-update.ts, src/release.ts.
4. Explains how a failed update is reported while the active release stays in place (what the reader sees, where). Source: src/self-update.ts.
5. Rollback is mentioned only as the existence of `akrogon rollback` and what it does in one line (previous becomes active, hold on the rolled-back commit) if the code confirms it; no step-by-step rollback (another leaf owns that page).
6. Embed `![<alt text describing what the picture shows>](../pictures/releases.svg)` with non-empty alt text. The picture shows: source is the merged default branch, release folder with active (current) and previous release, `akrogon rollback` makes previous active and holds the rolled-back commit.
7. Plain short sentences. No dates.

## 3. Read-first list

- Authoring sources (stale): README.md sections "Install" and "Initialize a repository", docs/guide/install.md.
- Truth: src/self-update.ts, src/release.ts, src/rollback.ts (only to confirm the one rollback line), src/akrogon.ts, src/AREA.md.
- Picture: docs/pictures/releases.svg. Style: /home/ivan/.claude/skills/implement-issue/ponytail.md.

## 4. Change list and needed interfaces

Add docs/reference/releases-and-updates.md (new). Owns only that path. Prerequisites: none. Shared test resources: none.

## 6. Ordered steps

1. Trace self-update and release code end to end (criteria 1–5).
2. Write: intro, picture, release vs checkout, following main, deploy trigger, failed update, rollback pointer (criteria 1–7).
3. Run section 7 commands, commit.

Advisory size: 1 file, under 15 turns.

## 5. Do-not, reasons and exceptions

- Edit only your owned page. Other docs, README, docs/reference-index.md, tests, src, skills and everything under issues/ belong to other leaves or are out of scope. Exception: none; return a mismatch to A instead.
- Do not link docs/guide/ (it is deleted by a later leaf) or any page not yet on disk (docs/reference/commands.md, checks.md, config.md, docs/use/*, docs home). Link only: the picture named below, skills/<name>/SKILL.md, src/<file>.ts, and the other three pages of this leaf by their paths in docs/reference/ (files.md, state-and-phases.md, releases-and-updates.md, limits.md). Reason: no dead links on main after merge.
- No dates or year numbers anywhere (the proof greps for 19xx/20xx). No "was removed", "used to", migration or history notes. No names of retired commands, settings or files. Reason: brief criterion 3 and the design: docs describe current state only.
- Code wins: the old docs/guide pages are authoring sources only and are often stale. Every claim must be checked against current src/ and skills/ files. Drop any old claim you cannot trace to code. Reason: seat B checks each statement against the sources.
- Do not restate agent procedure from skills. Say what the reader sees, does and why, and link the skill. Write out literal commands only where a lookup needs them.
- Do not write or edit any test. Do not commit anything except your page.
- If the plan is wrong (a fact contradicts the brief below, or the subject cannot be covered without breaking a rule above), return a mismatch with evidence and the smallest brief correction. Exception: a revised brief from A.

Reasons and exceptions restated: scope is your one page (exception: revised brief from A); links only to existing targets so main has no dead links; no dates or history because docs show current state only; code over old guide because B checks each claim; skills own agent procedure; workers write no tests.

## 7. Commands

Install once in your worktree: `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c "bun install --frozen-lockfile"`.
Targeted checks (run from your worktree root):

- `akrogon run-check --name u3-dates -- sh -c "test -s docs/reference/releases-and-updates.md && ! grep -nE \"\\b(19|20)[0-9]{2}\\b\" docs/reference/releases-and-updates.md"`
- Link check, list every relative link target and confirm each exists: `akrogon run-check --name u3-links -- sh -c "cd docs/reference && grep -oE \"\\]\\([^)#]+\" releases-and-updates.md | sed \"s/^](//\" | grep -v \"^http\" | while read p; do test -e \"\$p\" || { echo MISSING \$p; exit 1; }; done"`
- `akrogon run-check --name u3-prettier -- bunx prettier --check docs/reference/releases-and-updates.md` (report the result; if prettier reformats, run `bunx prettier --write docs/reference/releases-and-updates.md` and keep the result).

Links to the other three pages of this leaf may be missing in your worktree; the link check above flags them as MISSING. That is expected for those three names only; A rechecks after all pages land. If `akrogon run-check` cannot run from your worktree, run the same command directly and paste its exit code and output.

## 8. Done-when, evidence and report

Done when the page covers every item in section 2, each claim traces to a source you name, the commands above exit 0, and one commit on your worktree holds only docs/reference/releases-and-updates.md with message `docs(reference): add releases-and-updates.md`. Do not add any Co-Authored-By line.

Return the commit id and, per claim group, the source file:symbol or skill section behind it (B will check them line by line). Cite each `check <label>: <exit> <path>` line.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
