# Sub-brief 2: docs-reference-commands U2

Worktree: `/home/ivan/.akrogon/worktrees/akrogon/docs-reference-commands-u2` (run `bun install --frozen-lockfile` there first).

## 1. Goal

Write `docs/reference/skills.md`: every skill under `skills/`, the result it gives and when to use it (plan D8, D11; brief done-criteria 2 and 6).

## 2. Numbered acceptance criteria

1. `docs/reference/skills.md` exists with a `# Skills` title and a short intro saying the difference between skills you start yourself and skills the `akrogon` command starts in a seat's pane.
2. It has one `##` section per skill folder under `skills/` (ten: chart-issues, plan-issue, implement-issue, check-issue, merge-issue, seed-issue, broadcast-issue, init-akrogon, watch-issues, learn-issues). Each section says: the result it gives you, when to use it, who starts it (you, or the command dispatching seat A/B), and links its `SKILL.md`.
3. One short line explains `skills/lesson-rule.md` as a shared rule the lesson-writing skills follow, not a skill you run, and links it.
4. Chart consultants (helpers chart-issues uses while planning) are named apart from execution seats A and B (who plan, build, review and repair leaves). Check the exact terms in `skills/chart-issues/SKILL.md` and `skills/check-issue/SKILL.md`.
5. Every claim matches the skill's own `SKILL.md` front matter and body (for example watch-issues runs a 20-minute cron in Claude Code and is started and stopped only by the operator; learn-issues and chart-issues are operator-invoked).

## 3. Read-first list

- `skills/*/SKILL.md` (front matter `description` first, then the body as needed), `skills/lesson-rule.md`, `skills/AREA.md`
- `README.md` section "Skills" (lines 210-223) and `docs/guide/cheat.md` "Pick the skill" section: authoring sources only
- `src/next.ts` for which phases dispatch which skill (grep `plan-issue`, `implement-issue`, `check-issue`, `merge-issue`)
- `/home/ivan/.claude/skills/implement-issue/ponytail.md`

## 4. Change list and needed interfaces

- Create `docs/reference/skills.md` (owned path). Nothing else.
- Prereqs: none. Shared test resource: none. Wave 1 with U1 and U3.

## 5. Do-not, reasons and exceptions

- Link no other `docs/` page (none of the other reference pages exist in your worktree yet).
- Write for a beginner: plain, short sentences. Say what the reader sees, does and why. Exact agent procedure stays in the owning skill and is linked (`../../skills/<name>/SKILL.md`), not copied.
- Every statement must match current `src/` and `skills/` in your worktree. Where README or an old `docs/guide/*.md` page disagrees with the code, the code wins and the old claim is not carried. Reason: seat B checks each page line by line against its sources (done-criterion 6).
- No dates anywhere on the page (no years, no month names). No "was removed", "used to", "new in" or migration notes. Never name a retired command, setting or file (for example hold-fix, unhold, --red-on-base, held.yaml, run permit, run.lock, run-holder). Reason: done-criterion 6 and the retired-word scans.
- Links: only to the pages and pictures this unit's brief allows, `skills/` files and `src/` files, all as relative paths that exist in your worktree. Never link `docs/guide/` or any page not present in your worktree. Reason: the design's link rule, and tests/docs-links.test.ts fails on a missing target or heading anchor.
- Placeholders only, never real keys, real home paths or private project names.
- Do not edit any test file, README.md, docs/reference-index.md, docs/guide/*, docs/pictures/* or anything under `issues/`. Reason: other leaves own them, tests are locked after planning, and `issues/` never goes on the leaf branch.
- A worker writes and edits no test. If a planned test is red once your page is right, or a fact here contradicts the code, stop and return a mismatch naming the requirement, the actual code (path:line) and the smallest brief correction. Exception: a revised brief from A.
- Restated: beginner wording and code-checked facts because B reviews each line against source; no dates or retired names because of criterion 6; only existing relative links because docs-links fails otherwise; no test, README, guide, picture or issues edits because others own them, with the single exception of a revised brief from A.

## 6. Ordered steps

1. Read each SKILL.md and note result, trigger and who starts it.
2. Write the page (criteria 1-5).
3. Run section 7 and fix until green.
Advisory size: 1 file, under 16 turns.

## 7. Commands

- `akrogon run-check --name u2-docs -- bun test --timeout=30000 tests/docs-links.test.ts tests/run-permit.test.ts tests/hold-retired.test.ts -t 'docs|links'`

## 8. Done-when, evidence and report

Done when every criterion in section 2 holds and the section 7 commands exit 0. Commit only your owned paths in your worktree with a conventional message (`docs(reference): ...`), no co-author line, and return the commit ID. Keep command output only through `akrogon run-check --name <label> -- <cmd>` and cite the printed `check <label>: <exit> <path>` line; read a log back with `akrogon log <path>`. You touch no test file, so no `Test-Change:` trailer applies. Stop no process by pattern (`pkill -f`, `killall`); use `akrogon stop-run <run-id>`.

Changed files and reasons: <paths and why>
Tests run: <commands and results with check lines>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
