# Brief 1: cheap-check-placement U1

Worktree: `/home/ivan/.akrogon/worktrees/akrogon/cheap-check-placement-u1` (detached at leaf HEAD `c53f619`).

## 1. Goal

Land plan decisions D2, D3, D4: state the cheap-check-placement rule in three files, one addition each, so every blocking check cheap enough for a leaf's own check runs in `checks` before review — a merge command may rerun a cheap check but is never the only place it runs. Agents follow the rule; no akrogon code, config key, or check enforces it, and the edits must not imply one does.

## 2. Numbered acceptance criteria

1. `skills/init-akrogon/SKILL.md`, "Inspect and propose" paragraph: setup is told to inspect the scripts each proposed merge command runs and place their cheap checks (typecheck, lint, validators and the like) in `checks`, naming an existing cheap group command when the repo has one; it also states a merge command may rerun cheap checks on the integrated candidate but is never the only place they run.
2. `docs/guide/setup.md`, the `**merge_checks**` bullet: states a cheap check never runs only at merge, even when a merge command also runs it.
3. `skills/check-issue/SKILL.md`, `## check.review`: a new sentence tells B that a leaf diff changing a script a `merge_checks` command runs and leaving a cheap check reachable only at merge is a Fix when a script edit within the leaf can route it through a command `checks` already runs, and otherwise an `Operator actions` item naming the config line to add, which gates no done-criterion.
4. No added text states or implies akrogon code enforces the rule.

No tests are written or edited. There are no planned tests for this leaf (text-only per its standing design); section 7's changed-test command is expected to find nothing changed to run.

## 3. Read-first list

- `skills/init-akrogon/SKILL.md` — "Inspect and propose" paragraph.
- `docs/guide/setup.md` — "Repo config, the parts you'll care about" bullets.
- `skills/check-issue/SKILL.md` — `## check.review`, paragraph beginning "Start from the changed behavior".
- `skills/implement-issue/ponytail.md` in this skill folder.

## 4. Change list and needed interfaces

Owns all three paths; no prerequisite chunks, no shared test resource, no consumed output.

Edit 1 — `skills/init-akrogon/SKILL.md`. In the "Inspect and propose" paragraph, the sentence ending "…except a `check.fix` pass after a red merge ending replays the exact rejected command:" — replace its trailing colon with a period and append:

> When proposing `checks` and `merge_checks`, inspect the scripts each proposed merge command runs and place their cheap checks — typecheck, lint, validators and the like — in `checks`, naming an existing cheap group command when the repo has one; a merge command may rerun cheap checks on the integrated candidate but is never the only place they run:

(so the new sentence's colon still introduces the YAML block).

Edit 2 — `docs/guide/setup.md`, the `**merge_checks**` bullet ("lists slow commands that run only at merge … replays the exact rejected command."). Append to the bullet:

> A cheap check never runs only at merge, even when a merge command also runs it — a check cheap enough for the leaf's own check belongs in `checks`, and a merge command may rerun it on the integrated candidate but is never its only home.

Edit 3 — `skills/check-issue/SKILL.md`, `## check.review`, paragraph beginning "Start from the changed behavior". Append one sentence to that paragraph:

> When a leaf's diff changes a script that a `merge_checks` command runs and leaves a cheap check reachable only at merge, it is a Fix when a script edit within the leaf can route that check through a command `checks` already runs, and otherwise an `Operator actions` item naming the config line to add, which gates no done-criterion.

Match each file's existing sentence style. No new sections, headings, or list items in `check-issue`; the setup.md addition stays inside its bullet; the init-akrogon addition stays inside its paragraph.

## 5. Do-not, reasons and exceptions

- Do not edit any other file, add config keys, sections, commands, or checks — the design locks the change to three prose additions; scope growth is a mismatch, not initiative.
- Do not write or edit tests — this leaf's tests are locked at none; a red check returns a mismatch.
- Do not touch `issues/`, `learnings/`, `.env`, or `config.yaml` — artifacts live outside the worktree.
- Do not imply akrogon code enforces placement — locked design: agents follow the rule.
- A conflicting requirement returns a mismatch with evidence to the plan author; the exception is a revised brief from A authorizing the change.

Restated: three prose edits only, no tests, no config/env/issues edits, no enforcement claim; conflicts return as mismatches pending a revised brief.

## 6. Ordered steps

1. Read the three target sections (acceptance criteria 1–3).
2. Apply edit 1; verify with `grep -n "merge command runs" skills/init-akrogon/SKILL.md`.
3. Apply edit 2; verify with `grep -n "never runs only at merge" docs/guide/setup.md`.
4. Apply edit 3; verify with `grep -n "reachable only at merge" skills/check-issue/SKILL.md`.
5. Read each edited paragraph in full to confirm style and the untouched `check.fix` clauses.
6. Run `bun install --frozen-lockfile`, then the section 7 command.
7. Commit all three files in one commit on the detached HEAD; report the commit ID.

Advisory size: about 3 files, under 15 turns.

## 7. Commands

```sh
export AKROGON_BASE=c53f6196533289555518577f08907ec9c713721c
bun install --frozen-lockfile
: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000
```

Zero changed tests is the expected, passing result — the diff is markdown the suite does not import.

## 8. Done-when, evidence and report

All three greps return the added lines; each edited paragraph rereads cleanly; the changed-test command exits 0; the single commit contains only the three files.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
