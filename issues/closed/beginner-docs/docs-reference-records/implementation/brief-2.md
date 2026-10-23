# Brief 2: docs/reference/state-and-phases.md

Worktree: /home/ivan/.akrogon/worktrees/akrogon/docs-reference-records-u2

## 1. Goal

Write docs/reference/state-and-phases.md: every state.yaml field and every phase with who moves it. Plan decisions D1, D2, D3, D4, D5, D6, D10.

## 2. Numbered acceptance criteria

1. One table lists every top-level field of `stateSchema` in src/state.ts (slug, phase, created, repo, debate, blocked-by, sources, busy_since, busy_notified, attempts, done, fix_rounds, verdict, tab, worktree, env_names, env_generation, pane, prompted, prompted_at, delivery_error, failure, merge_stamp, batch, broadcast, frozen, frozen_cited): plain meaning in one line, and who writes it (you or the chart door at creation, or the command). Confirm each meaning by grepping its writers in src/. Fields a person sets (slug, created, repo, debate, blocked-by, sources) are shown apart from command-owned ones. `phase` changes only through `akrogon phase`.
2. Nested records get one line each plus their sub-fields in plain words: `failure` (failureSchema), `delivery_error` (deliveryErrorSchema), `batch` (batchSchema), `broadcast` (broadcastSchema). Point to src/state.ts for exact shape. For `failure.cause`: document only causes a current code path writes. At base, `cause: 'blocked'` is written by src/phase.ts transition; `attempts` is in the schema and read in src/next.ts but no writer was found. Grep to confirm; if no writer exists, do not describe `attempts` as something that happens.
3. The phase table, verified against src/routing.ts (`routing`, `requiredSlots`), src/phase.ts `transition` and skills/merge-issue/SKILL.md:

| Phase | Seats that work | Who moves it on | Allowed next |
|---|---|---|---|
| plan.positions | A and B | each seat with --slot; moves after both are done | plan.rebuttal, plan.synthesis, failed |
| plan.rebuttal | A and B | each seat, after both | plan.synthesis, failed |
| plan.synthesis | A | A | implement, failed |
| implement | A | A | check.review, failed |
| check.review | A and B; only B once fix_rounds > 0 | the required seats, each with a verdict (ready, nits, fix) | merge, check.repair, failed |
| check.repair | B | B | merge, check.fix, failed |
| check.fix | A | A | check.review, failed |
| merge | B only when the command's land run hands the attempt over, or a solo rebase | normally the command's land run moves it to merged with no seat; otherwise B's merged call (the command pushes) or B to check.fix | merged, check.fix, failed |
| merged | none | terminal | none |
| failed | none | the operator, with no --slot, to any active phase except merged | any active phase |

Also: any seat can move to failed with --reason; recovery keeps fix_rounds; a call with --slot cannot move a failed leaf. Which skill each phase runs (routing[].skill) is one column or line, linking skills/<name>/SKILL.md. Debate off starts at plan.synthesis; rebuttal on/off decides plan.rebuttal. Confirm each claim in code before writing it.
4. Embed `![<alt text describing what the picture shows>](../pictures/phases.svg)` with non-empty alt text. The picture shows the leaf phases from plan.positions through merged, the rebuttal on/off branch, debate-off start at plan.synthesis, the fix verdict loop through check.repair and check.fix, and that any boxed phase can stop in failed.
5. Plain short sentences. No dates. Example YAML, if any, writes `created: <date>` instead of a real date.

## 3. Read-first list

- Authoring sources (stale): docs/guide/state.md, docs/guide/phases.md.
- Truth: src/state.ts, src/routing.ts, src/phase.ts, src/next.ts, src/akrogon.ts (phase command flags), skills/merge-issue/SKILL.md, skills/check-issue/SKILL.md.
- Picture: docs/pictures/phases.svg. Style: /home/ivan/.claude/skills/implement-issue/ponytail.md.

## 4. Change list and needed interfaces

Add docs/reference/state-and-phases.md (new). Owns only that path. Prerequisites: none. Shared test resources: none.

## 6. Ordered steps

1. Trace each state field's writer and each phase move in src (criteria 1–3).
2. Write: intro, picture, phase table, how a phase moves (the `akrogon phase` call shape, verdicts, failed and recovery), state field table, nested records (criteria 1–5).
3. Run section 7 commands, commit.

Advisory size: 1 file, under 20 turns.

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

- `akrogon run-check --name u2-dates -- sh -c "test -s docs/reference/state-and-phases.md && ! grep -nE \"\\b(19|20)[0-9]{2}\\b\" docs/reference/state-and-phases.md"`
- Link check, list every relative link target and confirm each exists: `akrogon run-check --name u2-links -- sh -c "cd docs/reference && grep -oE \"\\]\\([^)#]+\" state-and-phases.md | sed \"s/^](//\" | grep -v \"^http\" | while read p; do test -e \"\$p\" || { echo MISSING \$p; exit 1; }; done"`
- `akrogon run-check --name u2-prettier -- bunx prettier --check docs/reference/state-and-phases.md` (report the result; if prettier reformats, run `bunx prettier --write docs/reference/state-and-phases.md` and keep the result).

Links to the other three pages of this leaf may be missing in your worktree; the link check above flags them as MISSING. That is expected for those three names only; A rechecks after all pages land. If `akrogon run-check` cannot run from your worktree, run the same command directly and paste its exit code and output.

## 8. Done-when, evidence and report

Done when the page covers every item in section 2, each claim traces to a source you name, the commands above exit 0, and one commit on your worktree holds only docs/reference/state-and-phases.md with message `docs(reference): add state-and-phases.md`. Do not add any Co-Authored-By line.

Return the commit id and, per claim group, the source file:symbol or skill section behind it (B will check them line by line). Cite each `check <label>: <exit> <path>` line.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
