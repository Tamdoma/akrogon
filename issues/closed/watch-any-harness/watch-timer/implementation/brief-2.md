# Sub-brief U2: SKILL.md `akrogon status` operand fix

## 1. Goal

Criterion 15 / plan D1: `skills/watch-issues/SKILL.md` line ~14 tells the watcher to run
`akrogon status <root>`, but `status` takes no root operand and errors "Missing leaf". The skill
text must say `akrogon status` run at `<root>` (cwd), never `akrogon status <root>`.

## 2. Numbered acceptance criteria

1. `skills/watch-issues/SKILL.md` contains no occurrence of the literal `akrogon status <root>`
   (the free test asserts `skill.not.toContain('akrogon status <root>')`); the check step still
   reads `akrogon status` (asserted `toContain`) and still says it runs at `<root>` in prose.
2. Line 14's phrase becomes e.g. "runs the one check of `akrogon status` at `<root>`"; line 22
   ("A check begins by running `akrogon status` at `<root>`") is already correct — leave it.
3. No other text changes: all other assertions on the file (harness names, `/new`, compaction,
   draft, no `cron`/`expir`) must keep passing.

## 3. Read-first list

- `skills/watch-issues/SKILL.md` — the file you change (only file you own); the bad text is in
  the `watch-issues <root>` invocation bullet near line 14.
- `src/` status dispatch for the contract, if you need evidence the operand is wrong: search
  `status` in `src/` — `akrogon status` reads repos; `status <root>` hits "Missing leaf".
- `tests/watch-timer.test.ts` docs case (criterion 15 block) — the red assertion you turn green;
  read, never edit.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md` — read before editing.

## 4. Change list and needed interfaces

- Owns: `skills/watch-issues/SKILL.md` only.
- Change: one surgical line edit removing the `<root>` operand; keep "at `<root>`" in prose.
- Creation commit: `061cd4320b061a8e1763fb7269093a1482d62cf5` (worker worktree cut at this head).
- Lands first: nothing (wave 1). Consumed by: the docs case and every paid cell's skill text.

## 5. Do-not, reasons and exceptions

- Edit no test and no other file — the docs set beyond SKILL.md is already green.
- Do not rephrase anything else in the skill — locked criterion-10 text; a wording the test
  needs but you think is wrong is a mismatch returned to A with evidence, never a test edit.
- Standing exclusion: never run any `git stash` subcommand — all worktrees share one stash.
  Set work aside only as a WIP commit; before returning, `git reset --soft
  061cd4320b061a8e1763fb7269093a1482d62cf5` and make the unit's one commit again.
- Restated: only SKILL.md; exactly the `<root>` operand removal; no test edits; no stash;
  mismatch instead of scope change.

## 6. Ordered steps

1. Read the two `akrogon status` sites (lines ~14 and ~22).
2. Edit line ~14 to drop the operand.
3. Run the targeted command; the docs case must pass and every other case stays untouched by
   this file's change (a red elsewhere that your diff cannot cause is reported, not fixed).

Advisory size: 1 file, ~3 turns.

## 7. Commands

- `akrogon run-check --name watch-timer-u2 -- sh -c 'flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c "bun install --frozen-lockfile --backend=copyfile" && bun test --timeout=30000 tests/watch-timer.test.ts'`
  (cite the printed `check watch-timer-u2: <exit> <path>` line)

## 8. Done-when, evidence and report

The docs case is green and no `akrogon status <root>` remains in SKILL.md; paste the `check
watch-timer-u2:` line and any other red case with its output (report, don't fix). Commit once on
top of the creation commit; the file is a frozen path, so end the message with:
`Test-Change: skills/watch-issues/SKILL.md issues/chart/watch-live-speed Corrections item 4 (criterion-15 status operand)`.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
