# Final-shape check, slot D

## worker-stash (#141): one defect

- The brief-template line tells the worker to `git reset --soft <start HEAD>`, but nothing gives the worker that commit. brief-template.md has no start-HEAD or base-commit wording (grep: no match), and after a WIP commit `HEAD` is no longer it. The implementer must guess where the value comes from.
- Smallest correction: the line says "the commit this worktree started at, noted with `git rev-parse HEAD` before the first edit". No new brief field.
- Everything else holds.

## trailer-message (#142): one defect, one wording fix

- Defect: the refusal's new wording says "the commit message's last paragraph". Two existing tests assert the current phrase: tests/phase.test.ts has `toContain('final trailer block')` twice (`bare.stderr`, `refused.stderr`). If the builder drops that phrase, both fail, and repairing them means editing existing test files, which needs its own `Test-Change` citations. The final shape's proof line even cites that assertion, so the two lines conflict.
- Smallest correction: the refusal keeps the words "final trailer block" and explains them ("the final trailer block, the message's last paragraph"). The five writer sites already use that term, so writer and refusal stay on one name.
- Wording: the proof is called red-first, but a flush-left wrapped trailer is already refused today. Only the new phrase is red before the fix. Say "red on the rule phrase" so the implementer does not hunt for a missing refusal.

## installed-transfer (#143): two guesses left

- The citation's sha source holds on this machine: `realpath ~/.claude/skills/learn-issues/SKILL.md` gives `~/.akrogon/releases/39e203a7.../skills/learn-issues/SKILL.md`. Missing case: a pass whose skill path is not under `releases/` (the akrogon checkout itself). Smallest correction: one clause, "a skill not resolved under `releases/` is this repo's own step and uses today's same-repo Transfer".
- The rewrite (Q4) has no stated home. Sort has five outcomes and the Printed footer counts four things (removed, transfers, seed lines, stay). The implementer must guess whether a rewrite is a sixth outcome and how it is counted. A sixth outcome would be new machinery against signposts 5a. Smallest correction: the rewrite lives inside the Transfer bullets (lesson-rule.md Transfer, SKILL.md Sort and Apply), a rewritten line counts as "stay" in the footer, and the footer text is unchanged.
- Everything else holds, including Q6 and "a checkable lesson never transfers".
