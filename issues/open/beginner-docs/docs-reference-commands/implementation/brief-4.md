# Sub-brief 4: docs-reference-commands U4

Worktree: `/home/ivan/.akrogon/worktrees/akrogon/docs-reference-commands-u4` (run `bun install --frozen-lockfile` there first).

## 1. Goal

Write `docs/reference/checks.md`: checks and verification with each refusal's remedy, linking agent proof rules instead of copying them (plan D10, D11; brief done-criteria 2 and 6).

## 2. Numbered acceptance criteria

1. `docs/reference/checks.md` exists with a `# Checks` title and covers, in plain words checked against code:
   - Leaf `checks` versus `merge_checks` (and `merge_covers`, `advisory`): what runs where, which block, and that `setup` runs first.
   - `akrogon run-check`: a command a seat keeps output for; the `check <label>: <exit> <path>` line it prints and where the log lands.
   - `akrogon verify`: checks the commit out fresh in the worktree store, runs every configured check for the scope, logs each, writes one receipt to `issues/verify-runs.jsonl`, removes the checkout; reuse of a green receipt for the same tree and command set; which phase moves need a green receipt.
   - Known red: `akrogon verify --known-red` runs the merge-base fresh and links it to the red head run; when a pair passes.
   - Test-change refusals: phase moves refuse changed old test files (path rule in `src/test-files.ts`) and drift from the record written at the `plan.synthesis` to `implement` move unless a `Test-Change: <path> <source and reason>` trailer names them; the remedy.
   - `akrogon guard` refusals (`ancestors`, `own-modules`) and their remedy.
   - Which log to read: `akrogon log <path>` with the path from the `check` line or the verify output, and that it also reads packed `evidence.tar.zst` archives; `akrogon flaky` for red-then-green history.
   - A short list or table: each refusal a reader can hit here → what it means → what to do. Derive the refusals from the error messages in `src/verify.ts`, `src/run-check.ts`, `src/guard.ts`, `src/phase.ts` and `src/evidence.ts`; quote the message only if the text is literal in the code.
2. The page embeds `![<plain alt text>](../pictures/verification.svg)`, and the text matches what the picture shows.
3. Agent proof rules are linked, not copied: link `../../skills/implement-issue/SKILL.md`, `../../skills/check-issue/SKILL.md`, `../../skills/merge-issue/SKILL.md` and `../../skills/plan-issue/SKILL.md` where a rule applies (for example the proof-command and retry rules).
4. Command rows are linked to `commands.md` (same folder) and seat settings to `config.md` (same folder), both present in your worktree; any `#anchor` you use must match a real heading there.

## 3. Read-first list

- `src/verify.ts`, `src/run-check.ts`, `src/guard.ts`, `src/test-files.ts`, `src/phase.ts` (test-change and receipt guards), `src/evidence.ts` (`readLog`), `src/log.ts`, `src/flaky.ts`
- `docs/reference/commands.md` and `docs/reference/config.md` (already landed in your worktree)
- `docs/pictures/verification.svg`
- `docs/guide/setup.md`, `docs/guide/phases.md`, `docs/guide/merge.md`, `docs/guide/files.md`: authoring sources only
- `/home/ivan/.claude/skills/implement-issue/ponytail.md`

## 4. Change list and needed interfaces

- Create `docs/reference/checks.md` (owned path). Nothing else.
- Prereqs: U1 (commands.md) and U3 (config.md) have landed. Shared test resource: none. Wave 2.

## 5. Do-not, reasons and exceptions

- Link only `commands.md`, `config.md`, `../pictures/verification.svg`, skills and src files. Do not edit commands.md or config.md; a needed change there is a mismatch.
- Write for a beginner: plain, short sentences. Say what the reader sees, does and why. Exact agent procedure stays in the owning skill and is linked (`../../skills/<name>/SKILL.md`), not copied.
- Every statement must match current `src/` and `skills/` in your worktree. Where README or an old `docs/guide/*.md` page disagrees with the code, the code wins and the old claim is not carried. Reason: seat B checks each page line by line against its sources (done-criterion 6).
- No dates anywhere on the page (no years, no month names). No "was removed", "used to", "new in" or migration notes. Never name a retired command, setting or file (for example hold-fix, unhold, --red-on-base, held.yaml, run permit, run.lock, run-holder). Reason: done-criterion 6 and the retired-word scans.
- Links: only to the pages and pictures this unit's brief allows, `skills/` files and `src/` files, all as relative paths that exist in your worktree. Never link `docs/guide/` or any page not present in your worktree. Reason: the design's link rule, and tests/docs-links.test.ts fails on a missing target or heading anchor.
- Placeholders only, never real keys, real home paths or private project names.
- Do not edit any test file, README.md, docs/reference-index.md, docs/guide/*, docs/pictures/* or anything under `issues/`. Reason: other leaves own them, tests are locked after planning, and `issues/` never goes on the leaf branch.
- A worker writes and edits no test. If a planned test is red once your page is right, or a fact here contradicts the code, stop and return a mismatch naming the requirement, the actual code (path:line) and the smallest brief correction. Exception: a revised brief from A.
- Restated: beginner wording and code-checked facts because B reviews each line against source; no dates or retired names because of criterion 6; only existing relative links because docs-links fails otherwise; no test, README, guide, picture or issues edits because others own them, with the single exception of a revised brief from A.

## 6. Ordered steps

1. Read the listed src files and collect the refusals and what each means.
2. Write the page (criteria 1-4).
3. Run section 7 and fix until green.
Advisory size: 1 file, under 20 turns.

## 7. Commands

- `akrogon run-check --name u4-docs -- bun test --timeout=30000 tests/docs-links.test.ts tests/run-permit.test.ts tests/hold-retired.test.ts -t 'docs|links'`

## 8. Done-when, evidence and report

Done when every criterion in section 2 holds and the section 7 commands exit 0. Commit only your owned paths in your worktree with a conventional message (`docs(reference): ...`), no co-author line, and return the commit ID. Keep command output only through `akrogon run-check --name <label> -- <cmd>` and cite the printed `check <label>: <exit> <path>` line; read a log back with `akrogon log <path>`. You touch no test file, so no `Test-Change:` trailer applies. Stop no process by pattern (`pkill -f`, `killall`); use `akrogon stop-run <run-id>`.

Changed files and reasons: <paths and why>
Tests run: <commands and results with check lines>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
