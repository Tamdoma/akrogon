# Sub-brief 2: repo-cap guide pages

## 1. Goal

Update the six guide pages to describe the cap as machine ceiling plus optional repo share. Plan decision D6. Worktree: /home/ivan/Work/infra/akrogon/issues/worktrees/repo-cap.

## 2. Acceptance criteria

1. docs/guide/install.html: the "Why max_active" box states the optional per-repo share.
2. docs/guide/limits.html: the capacity card states the optional per-repo share.
3. docs/guide/next.html: the no-tab step names the repo-cap condition.
4. docs/guide/in-practice.html: the "compete for the same seats" answer names the repo key as the opt-out.
5. docs/guide/cheat.html: the `<repo>/issues/config.yaml` comment line names max_active.
6. docs/guide/setup.html: the repo config example shows a commented optional `max_active` line.

## 3. Read-first list

- /home/ivan/Work/infra/akrogon/issues/open/repo-active-cap/repo-cap/plan.md (D6, limitation R1).
- The six files above; match each page's existing voice, markup and `<span class="c">` comment style.
- src/config.ts repoSchema for the key name; the config output key is `repo_max_active`.
- ponytail.md in this skill folder.

## 4. Change list and needed interfaces

Text-only edits. The repo key is `max_active` inside `<repo>/issues/config.yaml`; it is optional, a positive integer, absent means no repo limit, and the global `max_active` remains the machine ceiling. Repo caps summing past the global produce no warning.

## 5. Do-not

- Do not fix the stale `max_active: 0` pause advice in in-practice.html line ~124 or cheat.html line ~82; that is plan limitation R1, report only.
- No markup restructuring, no new pages, no style.css changes.
- No files under `issues/` on this branch; do not commit.
- Return a mismatch with evidence instead of changing scope; the exception is a revised brief from B.

Restated: only the six named text edits; anything beyond comes back to B as a mismatch.

## 6. Ordered steps

1. Edit the six pages per criteria 1–6.
2. Run the changed-test command.

Advisory size: 6 files, under 15 turns.

## 7. Commands

`bun test --changed="c090787a05e86d1a32418e21b5b10161fd501efc"` — run from the worktree with `AKROGON_BASE=c090787a05e86d1a32418e21b5b10161fd501efc` in the environment.

## 8. Done-when, evidence and report

All six edits in place; command result pasted. Guide pages are text-only; the existing Playwright specs cover the shell, no new browser test needed.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
