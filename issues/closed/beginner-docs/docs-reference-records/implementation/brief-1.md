# Brief 1: docs/reference/files.md

Worktree: /home/ivan/.akrogon/worktrees/akrogon/docs-reference-records-u1

## 1. Goal

Write docs/reference/files.md, the one lookup page for the issues/ folder layout, each record file, the worktree store outside the checkout, and the timing and flaky reports. Plan decisions D1, D2, D3, D4, D7, D10.

## 2. Numbered acceptance criteria

1. The page shows the registered checkout's issues/ layout (every folder that exists in code: check src/park.ts, src/state.ts repoInventory, src/sync.ts, src/config.ts and the picture: seeds/, chart/, open/, parked/, closed/, issues/config.yaml, and the JSONL record files) and the worktree store outside the checkout (the `worktree_store` key printed by `akrogon config`, one folder per leaf).
2. It explains each record file in a leaf folder: brief.md, design.md, readiness.yaml, state.yaml (one line, link state-and-phases.md for fields), positions-A/B.md, rebuttal-A/B.md, plan.md, implementation/ (report.md, brief-N.md, check logs), review-A/B.md. Verify each name against skills/plan-issue, implement-issue, check-issue, merge-issue SKILL.md and src. Also the issue-level files (ISSUE.md, EPIC.md) and the repo-level JSONL records in the picture (log.jsonl, timings.jsonl, merge-attempts.jsonl, verify-runs.jsonl), each traced to the src file that writes it.
3. It explains the timing report and the flaky report: what records feed them, which command prints them, what the reader sees and why it is useful. Sources: src/timing.ts, src/timing-report.ts, src/flaky.ts, src/run-check.ts, src/akrogon.ts (command names and flags).
4. It embeds `![<alt text describing what the picture shows>](../pictures/project-folders.svg)` with non-empty alt text near the layout section. The picture shows: registered checkout <repo>/issues/ with seeds/ (imported seeds, not committed), chart/, open/, parked/, closed/; records log.jsonl, timings.jsonl, merge-attempts.jsonl, verify-runs.jsonl; worktree store default ~/.akrogon/worktrees/<repo> with one folder per leaf.
5. Plain short sentences for a beginner. No dates.

Planned proof run by A later (not by you): `test -s`, a grep for the picture with alt text, the date grep, and B's line-by-line source review.

## 3. Read-first list

- Authoring sources (stale, check everything): docs/guide/files.md, docs/guide/parts.md section "Folders…".
- Truth: src/park.ts, src/state.ts, src/sync.ts, src/config.ts, src/timing.ts, src/timing-report.ts, src/flaky.ts, src/run-check.ts, src/verify.ts, src/akrogon.ts, src/AREA.md, skills/*/SKILL.md.
- Picture: docs/pictures/project-folders.svg.
- Style: /home/ivan/.claude/skills/implement-issue/ponytail.md (fewest words that are correct).

## 4. Change list and needed interfaces

Add docs/reference/files.md (new). Owns only that path. Prerequisites: none. Shared test resources: none.

## 6. Ordered steps

1. Read the sources, list each folder and file with the src file that creates or reads it (criteria 1–3).
2. Write the page: short intro, picture, layout, leaf folder records, issue and repo records, timing and flaky reports, worktree store (criteria 1–5).
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

- `akrogon run-check --name u1-dates -- sh -c "test -s docs/reference/files.md && ! grep -nE \"\\b(19|20)[0-9]{2}\\b\" docs/reference/files.md"`
- Link check, list every relative link target and confirm each exists: `akrogon run-check --name u1-links -- sh -c "cd docs/reference && grep -oE \"\\]\\([^)#]+\" files.md | sed \"s/^](//\" | grep -v \"^http\" | while read p; do test -e \"\$p\" || { echo MISSING \$p; exit 1; }; done"`
- `akrogon run-check --name u1-prettier -- bunx prettier --check docs/reference/files.md` (report the result; if prettier reformats, run `bunx prettier --write docs/reference/files.md` and keep the result).

Links to the other three pages of this leaf may be missing in your worktree; the link check above flags them as MISSING. That is expected for those three names only; A rechecks after all pages land. If `akrogon run-check` cannot run from your worktree, run the same command directly and paste its exit code and output.

## 8. Done-when, evidence and report

Done when the page covers every item in section 2, each claim traces to a source you name, the commands above exit 0, and one commit on your worktree holds only docs/reference/files.md with message `docs(reference): add files.md`. Do not add any Co-Authored-By line.

Return the commit id and, per claim group, the source file:symbol or skill section behind it (B will check them line by line). Cite each `check <label>: <exit> <path>` line.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
