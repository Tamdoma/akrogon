# Worker brief 2: member-receipts docs and skill lines

## 1. Goal

Update user docs and seat-skill lines so they describe member receipts: concurrent `merge_checks`, per-command receipt reuse on the same tree, and `--known-red` reading base-side green receipts instead of always running the base fresh.

## 2. Numbered acceptance criteria

1. `skills/merge-issue/SKILL.md`, `skills/check-issue/SKILL.md`, `skills/implement-issue/SKILL.md`, `skills/chart-issues/SKILL.md`: every phrase claiming the base run is made fresh (e.g. "runs the base fresh at the head's merge-base") now says the base run reuses per-command green results on the base tree and runs only what lacks one; where the file already describes the command list or receipt, per-command reuse is stated once per file at the verify description, not repeated.
2. `docs/reference/checks.md`: the "Prove a commit with akrogon verify" and "Known red" sections describe merge members running at the same time after the `checks` stage, `reused` receipt entries naming the source run, per-command green reuse for `requireGreenReceipt`, and the exit-0-never-covers base rule. Update the "A merge runs every `checks`..." line in "What runs where" and the `merge_checks` row of the table.
3. `docs/reference/commands.md` verify row, `docs/reference/config.md` `merge_checks` row, `docs/reference/files.md` (`verify-runs.jsonl` rows: receipt gains optional `reused`; `akrogon flaky` line notes reused entries add no observation), `docs/use/merge-and-announce.md` step 1.
4. `src/AREA.md` verify paragraphs and `tests/AREA.md` verify line updated for member concurrency and reuse. Keep `src/AREA.md` bullet style and under 40 lines; keep sections exactly Commands, Key files, Non-obvious patterns, See also if the file uses them.
5. `bun test tests/docs-links.test.ts` stays green.

## 3. Read-first list

- `docs/reference/checks.md`, `docs/reference/commands.md` line 49, `docs/reference/config.md` lines ~55–90, `docs/reference/files.md` lines ~65–95, `docs/use/merge-and-announce.md` step ~20, `src/AREA.md` lines ~6–33, `tests/AREA.md` line ~17
- The four SKILL.md files at the base-run phrases (`grep -n "runs the base fresh" skills/*/SKILL.md`)
- `~/.pi/agent/skills/implement-issue/ponytail.md` — read before editing
- Behavior source of truth: `src/verify.ts` doc claims must match "merge members run concurrently after all checks pass", "a green result on the same tree under the same name and command text is reused and its receipt entry carries `reused: <source run id>`", "a base entry with exit 0 never covers a red head command".

## 4. Change list and needed interfaces

Owns: the files in criteria 2–4 plus the four SKILL.md files. Nothing else. This is a docs-only unit — no src or tests edits; the code lands from another worker.

## 5. Do-not

- Do not touch `src/`, `tests/`, `package.json`, issues/, learnings/.
- Do not describe root-state guards, framework config, or `run-check` merge_checks refusal details beyond what already exists in these files — a sibling leaf owns those.
- Do not invent semantics: if a claim is not in section 3's behavior list or the design note below, leave it out.
- Keep edits minimal and same-voice; these docs are terse.
- Return a mismatch instead of widening scope; the exception is a revised brief from A.

## 6. Ordered steps

Advisory size: ~10 files, under 40 turns.

1. Grep the four SKILL.md files for "runs the base fresh" and "fresh" near verify; rewrite each sentence per criterion 1.
2. Edit `docs/reference/checks.md` per criterion 2.
3. Edit commands.md, config.md, files.md, merge-and-announce.md per criterion 3.
4. Edit `src/AREA.md` and `tests/AREA.md` per criterion 4.
5. `bunx prettier --check` the edited docs if prettier covers them (`prettier --check docs src skills` errors on existing drift elsewhere; run it only on your edited files).
6. `bun test tests/docs-links.test.ts`.

## 7. Commands

- `bun test tests/docs-links.test.ts --timeout=30000` (run `bun install --frozen-lockfile` first)
- `bunx prettier --check <your edited files>`

Keep output through `akrogon run-check --name <label> -- <cmd>` and cite the printed `check <label>: <exit> <path>` line.

## 8. Done-when, evidence and report

All criteria 1–5 shown; commit describes the doc update; no src/tests changes in the diff; worktree clean after commit.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
