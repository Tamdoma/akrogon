# Leaf draft review, slot C

Disagreements only. Evidence paths are relative to /home/ivan/Work/infra/akrogon unless absolute.

## F1. guard-retires-lesson criterion 2 is false as stated and not fixable within ownership

Measured 2026-10-10 in a scratch repo with `learnings/LESSONS.md merge=union`: base L1,L2,L3; branch removes L2; main adds a line adjacent to L2. Both `git merge` and `git rebase` produce L1,L2,L2b,L3,L4: the removed line comes back. With the added line non-adjacent (appended at the end) the removal survives. So "the removed line stays removed ... adjacent to it" (guard-retires-lesson/brief.md:13) fails whenever main gained a neighbouring line, which is the framework's normal case because its file prepends newest lessons at the top (framework learnings/LESSONS.md:1-3) and the newest lesson is the most likely to be retired.

The leaf owns no surface that can change this: the attribute is written by the `akrogon` command (skills/init-akrogon/SKILL.md:81, `.gitattributes:1`), and dropping union reintroduces conflicts on concurrent appends. The design's own bug-shaped-risk line (design.md:34) says the test fails first "if the risk is real"; it is real, so the criterion needs a different owner or shape. Least-cost shape: the merge seat re-checks the retired line after the rebase and removes it again before push (skills/merge-issue/SKILL.md:41 already runs on `HEAD` in the worktree after rebase), with the history `Applied` entry as the record of which line must be absent. Whichever owner is chosen, criterion 2 must name it and the test must not be a plain union-merge test, since the union driver's behaviour is git's, not the leaf's.

## F2. Overlapping ownership with no dependency

- `skills/implement-issue/SKILL.md:31` is owned by lesson-write-rule (brief.md:4,8: write site) and by guard-retires-lesson (brief.md:6: "applying a lesson in the leaf diff"). It is one sentence holding both halves.
- `skills/check-issue/SKILL.md` lines 59 and 89 are write sites owned by lesson-write-rule; guard-retires-lesson owns the same file's review bar (brief.md:6).
- `skills/chart-issues/SKILL.md:31` is a write site owned by lesson-write-rule; guard-retires-lesson owns chart-issues SKILL.md and assets/shapes.md.
- `docs/guide/learn.md:18` ("Run `/learn-issues` to remove lessons ... and get a seed line") is the single sentence targeted by both lesson-write-rule criterion 6 and guard-retires-lesson criterion 6, and learn.md is also owned by seed-owner-routing (routing paragraph, learn.md:38).

guard-retires-lesson has `blocked-by: []` (state.yaml:6) and starts at the same phase as the others. Two leaves rewriting implement-issue:31 and learn.md:18 in parallel either conflict at merge or one rewrite drops the other's rule. Shapes requires cross-leaf promises to have one owner (shapes.md, Leaf files: "Cross-leaf claims name an owner"). Fix: guard-retires-lesson `blocked-by: [lesson-write-rule]`, with the retirement sentence added to the shared rule file lesson-write-rule creates, or split line ownership explicitly in both briefs.

## F3. seed-owner-routing owner test fails for relative paths

Criterion 1 (brief.md:12) and the interface (design.md:40) resolve "the path the failure names" with `readlink -f` and test whether it lies under the akrogon root. A framework seat names `skills/check-issue/SKILL.md` (that is the wording of lesson-write-rule criterion 5, brief.md:18). From the framework cwd that path does not exist and `readlink -f` returns `/home/ivan/Work/infra/tamdoma/framework/skills/check-issue/SKILL.md` (no such directory, verified 2026-10-10), which is outside the akrogon root, so the report routes to Tamdoma/tamdoma-framework. Only the installed form `~/.claude/skills/check-issue/SKILL.md` resolves into akrogon (symlinks verified: `~/.claude/skills/check-issue -> /home/ivan/Work/infra/akrogon/skills/check-issue`). The owner test must say "exists relative to the akrogon root, or resolves under it", and criterion 1 and lesson-write-rule criterion 5 must use the same path form.

Also: akrogon has no root `akrogon.yaml` (verified), so routing falls to origin `https://github.com/Tamdoma/akrogon.git`. The brief's "else its GitHub origin" covers it; state it in criterion 1 so the fresh-agent run does not record a false "missing routing" stop.

## F4. seed-owner-routing criterion 2 is ambiguous about scope

"When the akrogon command is missing ... the pass stops visibly ... and does not fall back" (brief.md:13). Read literally, a missing command stops every report, including consumer-code reports that never needed akrogon's root. Lifecycle 1a says only "invalid target fails visibly" for akrogon-owned reports. Bound the stop to reports the owner test routes to akrogon.

## F5. lesson-write-rule criterion 1 collides with learn-issues and with criterion 6

- Criterion 1 (brief.md:14): "a sweep finds no second copy of the rule in skills/ or docs/". The checkable/guarded/stays definitions already live in skills/learn-issues/SKILL.md:18-22, and the new rule needs "a lesson a simple check could catch" (brief.md:4). Either the rule file points at learn-issues' Checkable definition by reference, or the sweep finds a second copy on day one. Name which.
- Criterion 6 (brief.md:19): learn.md "describes the rule". A description by meaning is what criterion 1's sweep by meaning rejects. Say learn.md links the rule file and names the outcome only.

## F6. Docs sweep scope differs across leaves

seed-owner-routing criterion 6 covers "every other docs/ line"; lesson-write-rule and guard-retires-lesson criterion 6 name only learn.md. docs/guide/cheat.md:149 ("Triage lessons | learn-issues | Guarded lines removed, seed lines for checkable ones") states the old outlet and is in neither leaf's owned files. Add cheat.md:149 to the owner of the lesson outlet (lesson-write-rule), or widen its criterion 6 the way seed-owner-routing's is.

## F7. guard-retires-lesson consumes seed-owner-routing output without a dependency

Its trigger is "a seed whose body names a lesson history path" (brief.md:4, design.md:39). That body field is produced by seed-owner-routing criterion 4 (brief.md:15). Shapes requires the door to write what a dependent consumes for every `blocked-by`. Either add `blocked-by: [seed-owner-routing]` with the consumed field named under What, or state that the trigger works on hand-written seeds and needs no producer.

## F8. guard-retires-lesson criterion 2 names the proof form

Beyond F1, "proven by a test that runs the real git merge" (brief.md:13) puts the test form inside the criterion. shapes.md Leaf files: a criterion states the observable result, never a test file or assertion; the form belongs in design.md:34, where it already is.
