# Plan: lifecycle-prose

Prose-only leaf. Five skills, one symlink, four guide sentences. Line numbers are origin/main at 735cd63 and were verified against this worktree on 2026-09-14.

## Decisions

- D1: Peer questions are deleted everywhere. Remove the whole paragraph at broadcast-issue:25, check-issue:45, implement-issue:25, merge-issue:21 and plan-issue:27; remove the `questions/<id>.md` row at docs/guide/files.html:106 and the "Blind positions cannot ask the peer" card at docs/guide/limits.html:66. Each deleted paragraph takes one adjacent blank line, leaving no double blank line.
- D2: Both footer lines stay in all eight skills. The scrambled-context sentence goes: the whole last line at broadcast-issue:54, check-issue:60, merge-issue:60 and plan-issue:68, each with its preceding blank line so the file ends cleanly. implement-issue:68 keeps "The lines are printed only, with actual command results rather than assumed progress." and loses the rest.
- D3: Failed diagnosis is deleted. Remove merge-issue:39 with one adjacent blank line. check-issue:47 becomes the design's after-text. phases.html:66 and problems.html:61 third cell become the design's after-HTML.
- D4: `skills/check-issue/ponytail.md` becomes a relative symlink to `../implement-issue/ponytail.md` (`ln -sfn`, git mode 120000). check-issue:14 is unchanged; the link resolves inside every installed copy because the installer links whole skill folders (src/install.ts:11-21).
- D5: Lessons are written under the registered checkout's `learnings/` and left for the operator to commit. check-issue:41 and merge-issue:27 become the design's after-texts. implement-issue:29 and plan-issue:31 stay byte-identical.
- D6: No code or test changes. The existing suite is the regression check; the negative-test and artifact rules do not apply.

## Read-first

- `skills/broadcast-issue/SKILL.md`, `skills/check-issue/SKILL.md`, `skills/implement-issue/SKILL.md`, `skills/merge-issue/SKILL.md`, `skills/plan-issue/SKILL.md`
- `docs/guide/files.html`, `docs/guide/limits.html`, `docs/guide/phases.html`, `docs/guide/problems.html`
- `skills/check-issue/ponytail.md`, `skills/implement-issue/ponytail.md`
- `src/install.ts` lines 11-21 (folder-link evidence for D4)

## Interfaces

Literal after-texts, applied verbatim:

- check-issue:47 → `Finish with \`akrogon phase <slug> <next> --slot <A|B> --verdict <ready|nits|fix>\`, requesting \`check.fix\` for fix or \`merge\` for ready/nits, then print the footer and stop.`
- check-issue:41 → `Rerun checks only for a code change, missing evidence or a specific concern, leaving doc/index authorship with B and recording any reusable lesson found here as one active mechanism/date/history line plus a history file with case, evidence and learning, written under the registered checkout's \`learnings/\` and left for the operator to commit.`
- merge-issue:27 → `Turn a Nit A still holds and finds reusable into one line naming mechanism/date/history in the registered checkout's \`learnings/LESSONS.md\` and a history file with case, evidence and learning, left for the operator to commit, without reading the active list as pass input or adding another turn.`
- implement-issue:68 → `The lines are printed only, with actual command results rather than assumed progress.`
- phases.html:66 → `<li class="phase"><span class="pn">failed</span><span class="who">you</span><p>Waits. Read the reviews, then send it back with <code>akrogon phase &lt;slug&gt; implement</code>.</p></li>`
- problems.html:61 third cell → `Read the reviews. Fix the brief if needed. <code>akrogon phase &lt;slug&gt; &lt;phase&gt;</code>.`
- `ln -sfn ../implement-issue/ponytail.md skills/check-issue/ponytail.md`

## Checklist

Ordered; each step names its criterion.

1. Delete the five peer-question paragraphs (D1). Criterion: `grep -rn "questions/" skills/` is empty.
2. Delete files.html:106 row and limits.html:66 card (D1). Criterion: `grep -rn "questions/" docs/guide/` is empty.
3. Apply D2 footer edits in all five skills. Criterion: `grep -rn -i scrambled skills/` is empty; `grep -c "^Last operation:" skills/*/SKILL.md` and `grep -c "^Next:" skills/*/SKILL.md` each show 1 for the same eight skills as on origin/main.
4. Delete merge-issue:39 and rewrite check-issue:47 (D3). Criterion: `grep -rn "diagnosis paragraph\|A's diagnosis" skills/ docs/guide/` and `grep -rn "moved failed" skills/` are empty (seed-issue:26 and create.html:61 keep their intake-exclusion "diagnosis").
5. Apply phases.html:66 and problems.html:61 after-HTML (D3). Criterion: the rendered text matches the interface strings above.
6. Create the ponytail symlink (D4). Criterion: `readlink skills/check-issue/ponytail.md` prints `../implement-issue/ponytail.md`; `cmp skills/check-issue/ponytail.md skills/implement-issue/ponytail.md` exits 0; `git ls-files -s skills/check-issue/ponytail.md` shows mode 120000 after staging.
7. Rewrite check-issue:41 and merge-issue:27 (D5). Criterion: `grep -rn "leaf branch" skills/check-issue/SKILL.md` is empty; `grep -n "registered checkout" skills/check-issue/SKILL.md skills/merge-issue/SKILL.md` returns exactly the two lesson lines.
8. Confirm diff scope. Criterion: `git diff origin/main -- skills/implement-issue/SKILL.md` touches only lines 25-26 and 68; `git diff origin/main -- skills/plan-issue/SKILL.md` touches only lines 27-28 and 68-69; implement-issue:29 and plan-issue:31 are byte-identical to origin/main.
9. Run `bun test`, `bun run typecheck`, `bun run format`. Criterion: all pass.

## Verification

The done-criteria greps in steps 1-8 are the acceptance evidence; step 9 is the regression check. No new tests, no artifacts beyond the edited files.

## Open limitation

After this leaf a failed leaf has no diagnosis paragraph: the review files are the only failure record, so a failure with thin reviews gives the operator less to read. Accepted by operator answer 20a.

## Notes for review

None. Brief and design agree; every cited line number was verified live.
