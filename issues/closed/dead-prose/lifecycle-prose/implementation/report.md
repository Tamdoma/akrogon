# Report: lifecycle-prose

Base: 735cd630afe03fe21b773aafeabdddddc88ca612 (origin/main)
Head: 4b9bce7 on branch lifecycle-prose

## Changed files and reasons

- `skills/broadcast-issue/SKILL.md`: deleted peer-question paragraph (orig :25) and scrambled-context last line (orig :54). D1, D2.
- `skills/check-issue/SKILL.md`: deleted peer-question paragraph (orig :45) and scrambled-context last line (orig :60); rewrote :41 to registered-checkout lessons and :47 to drop the moved-failed diagnosis clause. D1, D2, D3, D5.
- `skills/implement-issue/SKILL.md`: deleted peer-question paragraph (orig :25); rewrote :68 to drop the scrambled clause. D1, D2.
- `skills/merge-issue/SKILL.md`: deleted peer-question paragraph (orig :21), moved-failed paragraph (orig :39) and scrambled-context last line (orig :60); rewrote :27 to registered-checkout lessons. D1, D2, D3, D5.
- `skills/plan-issue/SKILL.md`: deleted peer-question paragraph (orig :27) and scrambled-context last line (orig :68). D1, D2.
- `skills/check-issue/ponytail.md`: replaced copy with relative symlink to `../implement-issue/ponytail.md` (mode 120000). D4.
- `docs/guide/files.html`: deleted the `questions/<id>.md` row (orig :106). D1.
- `docs/guide/limits.html`: deleted the "Blind positions cannot ask the peer" card (orig :66). D1.
- `docs/guide/phases.html`: rewrote the failed entry (orig :66) to "Read the reviews, then send it back". D3.
- `docs/guide/problems.html`: rewrote the phase:failed third cell (orig :61) to "Read the reviews. Fix the brief if needed." D3.

## Commands run

- `AKROGON_BASE=735cd630afe03fe21b773aafeabdddddc88ca612 bun test --changed="$AKROGON_BASE"` (both workers): no test files affected, 0 pass 0 fail.
- `bun test`: 217 pass, 0 fail, 12 files.
- `bun run typecheck` (tsc --noEmit): clean.
- `bun run format`: all files unchanged.
- `grep -rn "questions/" skills/ docs/guide/`: empty.
- `grep -rn -i scrambled skills/`: empty; `grep -c "^Last operation:" skills/*/SKILL.md` and `grep -c "^Next:" skills/*/SKILL.md` each show 1 for all eight skills.
- `grep -rn "diagnosis paragraph\|A's diagnosis" skills/ docs/guide/` and `grep -rn "moved failed" skills/`: empty; seed-issue:26 and create.html:61 keep their intake-exclusion "diagnosis".
- `readlink skills/check-issue/ponytail.md`: `../implement-issue/ponytail.md`; `cmp` against the target exits 0; staged mode 120000.
- `grep -rn "leaf branch" skills/check-issue/SKILL.md`: empty; `grep -n "registered checkout" skills/check-issue/SKILL.md skills/merge-issue/SKILL.md`: exactly the two lesson lines.
- `git diff origin/main -- skills/implement-issue/SKILL.md`: hunks at orig 22-29 and 65-68 only. `git diff origin/main -- skills/plan-issue/SKILL.md`: hunks at orig 24-31 and 64-68 only. implement-issue:29 and plan-issue:31 byte-identical to origin/main.

## Worker returns

- brief-1 (skills + symlink): all six criteria verified with pasted evidence; changed-tests run clean.
- brief-2 (guide): all four criteria verified with pasted evidence; changed-tests run clean.

## Known limitations

- After this leaf a failed leaf has no diagnosis paragraph; the review files are the only failure record. Accepted by operator answer 20a.
- Plan criterion 6 says the plan-issue diff touches lines 68-69; the file has 68 lines, so the actual second hunk is orig 67-68 (last line plus its preceding blank). Same scope, off-by-one in the criterion text.

## Unverified criteria

None.
