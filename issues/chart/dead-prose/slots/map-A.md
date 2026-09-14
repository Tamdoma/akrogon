# Map A: dead-prose

Nothing in src/ or tests/ reads the footer, the questions folder, a diagnosis paragraph, the ponytail or LESSONS.md beyond init scaffolding (src/init.ts:34). Every item is prose read by agents only, so each deletion is judged by what an agent stops doing, not by a test.

## Main forks

1. Peer-question paragraph (5 copies: broadcast:25, check:45, implement:25, merge:21, plan:27). Never fired: 0 `questions/` folders in 133 closed leaves. Options: delete all five; keep plan-issue:27 only (planning is where a real question lives); keep all.
2. Footer block. `Last operation:` and `Next:` in eight skills; five carry the scrambled-context paragraph. The command dispatches from state.yaml, never from the footer (src/next.ts). Options: keep `Last operation:` only and drop `Next:` plus the scrambled paragraph; drop the whole footer; keep as is.
3. Failed-diagnosis rule (merge-issue:37, check-issue:47). merge-issue:37 is dead after merge-conflict-route (merge → check.fix never prints `moved failed`). check-issue:47 can still fire at the review cap; 2 closed plan.md files carry a diagnosis; the three logged failures came from other phases. The log row does not encode why a leaf failed (Astra 4.5). Options: delete both; delete merge-issue:37 only and keep check-issue:47 as the only failure record; keep both.
4. Ponytail copy. Two byte-identical files, each skill reads its own. Installer symlinks whole skill folders into four harness roots (src/install.ts:11-21), so a relative symlink inside a folder resolves. Options: check-issue/ponytail.md becomes a relative symlink to implement-issue's (Astra F7); check-issue:14 reads `../implement-issue/ponytail.md` and the copy is deleted; keep both.
5. Lesson shape restated four times (implement:29, check:41, merge:27, plan:31) plus the removal-and-dating clause (implement:29) that never fired: LESSONS.md has 11 lines, none removed by an apply. Options: one shape sentence in plan-issue:31 and the others say "record a lesson as plan-issue describes"; delete the removal clause only; keep all.
6. Who commits a lesson. check-issue:41 commits on the leaf branch "because akrogon phase refuses a dirty worktree"; LESSONS.md lives in the registered checkout, which `akrogon phase` never checks. 11 lesson commits so far, by A at merge or by the operator. Options: write in the registered checkout, operator commits with the issue files; keep committing on the branch; A commits at merge only.
7. Small rounds (questions.md:27 "never cut, even for a small item"). Options: delete the "never cut" sentence and let a one-question round carry only decision-bearing parts (Astra F6); keep.
8. Corrections are dated additions. Fork `## Taken` sections already append "Operator answer (date)". Options: one sentence in SKILL.md:45 saying an operator correction is appended with its date, never edited in place; no rule.
9. Fog empty at handoff. SKILL.md:45 already says handoff is ready only when no fog requires a guess. Options: move it into the shapes preflight list as one check; keep where it is.
10. `## Forks open` in CHART.md. Every chart this session listed forks open then emptied it; a fork file without `## Taken` is the same fact. Options: remove the section from the template and let fork files carry openness; keep.
11. Standing block copied into every design.md (shapes.md:142, standing-design.md last line). Three designs this session carry the same nine lines verbatim. Options: design.md carries a one-line pointer to `skills/chart-issues/assets/standing-design.md` plus its "Current interpretation" paragraph; keep the copy for self-containment.
12. state.yaml written last within a leaf. The command detects a leaf by state.yaml; a leaf folder with state but no brief is dispatchable. Options: one sentence in the handoff step: write brief and design, then state.yaml; no rule.
13. shapes.md sample phase line. The sample state (shapes.md:151) says plan.synthesis and the sentence after it explains both starts; the operator named this as a fix. Options: sample shows both values on one commented line; leave.
14. Leaf split: one leaf for L4 (five lifecycle skills) and one for L5 (chart skill), or one leaf. No shared line.

## Practitioner questions

- Peer question: is this the only sanctioned cross-slot channel? If deleted, does a stuck B have any route other than failing the attempt? Astra H1 already notes context leakage between slots; deleting removes a channel nobody used.
- Footer: does the operator read `Next:` in the pane to know what comes next? `akrogon status` shows the same. Does any harness prompt template expect the footer text?
- Diagnosis: where does the reason for a failed leaf go if no rule asks for it? The log has no reason field.
- Ponytail: does any harness copy skill folders instead of linking them? A copied check-issue folder would carry a dangling symlink (Astra F7 "what breaks").
- Lessons: does the operator want to commit lessons by hand with the issue files, or is A's commit at merge the cheaper habit already working 11 times?
- Chart template: does removing `## Forks open` hurt resume? SKILL.md says CHART.md points to the selected fork on resume.
- Standing block: the leaf worktree of a consumer repo does not contain akrogon's skills folder; a pointer must name the installed path (`~/.claude/skills/chart-issues/assets/standing-design.md`), which exists only where install ran.

## Beginner pitfalls

- Deleting check-issue:47 with merge-issue:37 removes the only place a failure reason is written; the next failed leaf leaves plan.md silent.
- Deleting `Last operation:` along with `Next:` removes the one line the operator reads to see what a pane did.
- Turning a copy into a symlink and forgetting the installer test: tests/install.test.ts checks conflicting paths, not symlink targets.
- Moving lesson commits to the operator without saying where: a lesson written in the worktree is lost at worktree removal; it must be the registered checkout.
- Removing the standing block copy from designs already open (command-deletions-batch, merge-conflict-route): those designs stay as written; the template change applies to new charts only.
- Editing questions.md while it has uncommitted local edits (the research section): the leaf worktree starts from origin/main, so the operator commits the local edits first or the leaf conflicts with them.
