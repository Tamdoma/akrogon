# Brief: lifecycle-prose

## What
Prose only: five skills, one symlink, four guide sentences. Line numbers are origin/main at 735cd63.

1. Peer questions. Delete the whole paragraph at broadcast-issue:25, check-issue:45, implement-issue:25, merge-issue:21 and plan-issue:27. Delete the `questions/<id>.md` row at docs/guide/files.html:106 and the "Blind positions cannot ask the peer" card at docs/guide/limits.html:66.
2. Footer. Both `Last operation:` and `Next:` lines stay in every skill. Delete the scrambled-context sentence: the whole line at broadcast-issue:54, check-issue:60, merge-issue:60 and plan-issue:68; implement-issue:68 keeps "The lines are printed only, with actual command results rather than assumed progress." and loses the rest.
3. Failed diagnosis. Delete merge-issue:39. check-issue:47 becomes: finish with the phase command, requesting `check.fix` for fix or `merge` for ready/nits, then print the footer and stop. phases.html:66 failed entry: "Waits. Read the reviews, then send it back with `akrogon phase <slug> implement`." problems.html:61 third cell: "Read the reviews. Fix the brief if needed. `akrogon phase <slug> <phase>`."
4. Ponytail. `skills/check-issue/ponytail.md` becomes a relative symlink to `../implement-issue/ponytail.md`. check-issue:14 is unchanged.
5. Lessons. check-issue:41 loses "committed on the leaf branch because `akrogon phase` refuses a dirty worktree" and instead says the line and history file are written under the registered checkout's `learnings/` and left for the operator to commit. merge-issue:27 gains the same location clause. implement-issue:29 and plan-issue:31 stay byte-identical.

## Why
133 closed leaves across akrogon and framework hold zero `questions/` folders. The command dispatches from state.yaml; the scrambled-context sentence describes a read no agent performs. After merge-conflict-route a merge move cannot print `moved failed`, and the three logged failures came from other phases. The two ponytail files share one md5. Lessons live in the registered checkout, and the operator commits everything else there. Operator answers 2026-09-14: 18a, 19, 20a, 21a, 22 with 30a, 23a, 31a.

## Done-criteria
1. `grep -rn "questions/" skills/ docs/guide/` is empty.
2. `grep -rn -i scrambled skills/` is empty; `grep -c "^Last operation:" skills/*/SKILL.md` and `grep -c "^Next:" skills/*/SKILL.md` each show 1 for the same eight skills as on origin/main.
3. `grep -rn "diagnosis paragraph\|A's diagnosis" skills/ docs/guide/` and `grep -rn "moved failed" skills/` are empty (seed-issue:26 and create.html:61 use the word diagnosis for intake exclusions and stay).
4. `readlink skills/check-issue/ponytail.md` prints `../implement-issue/ponytail.md` and `cmp skills/check-issue/ponytail.md skills/implement-issue/ponytail.md` exits 0.
5. `grep -rn "leaf branch" skills/check-issue/SKILL.md` is empty; `grep -n "registered checkout" skills/check-issue/SKILL.md skills/merge-issue/SKILL.md` returns exactly the two lesson lines.
6. `git diff origin/main -- skills/implement-issue/SKILL.md` touches only lines 25-26 and 68; `git diff origin/main -- skills/plan-issue/SKILL.md` touches only lines 27-28 and 68-69 (a deleted paragraph takes one adjacent blank line with it).
7. `bun test`, `bun run typecheck` and `bun run format` pass.
