# Intake: consumer-lesson-fixes

## Scope

Three framework lessons that `/learn-issues` sorted on 2026-11-17 and filed as akrogon reports, handed together by the operator under full autopilot. Proposed grouping, settled at the map: one chart in the akrogon repo holding three independent outcomes, each its own completion owner.

1. #141: nothing stops `git stash` in implement-issue worker worktrees, which share `refs/stash`.
2. #142: the `akrogon phase` Test-Change guard reports a cited test as uncited when the trailer reason wraps.
3. #143: `/learn-issues` gives a consumer-repo judgment lesson no way out when an installed akrogon standing line now carries its rule.

## Provenance

- GitHub: Tamdoma/akrogon#141
- GitHub: Tamdoma/akrogon#142
- GitHub: Tamdoma/akrogon#143
- Operator: 2026-11-17 door message (session c-akrogon, door t126)

## Source: operator 2026-11-17 door message

I just pulled three issues. You need to consolidate them and chart them out. Use two consultants for the task: slot b (pi with gpt 6.2 astra on high effort), slot c (pi with muse wonder full 1.0) and slot d ( claude code fable 5.2 medium). Full autopilot mode, even the signposts. When you're done with each chart, nudge the w-akrogon herdr tab agent so it can start akrogon next.

## Source: Tamdoma/akrogon#141

# Nothing refuses git stash in implement-issue worker worktrees, which share refs/stash

Source: Tamdoma/akrogon#141
URL: https://github.com/Tamdoma/akrogon/issues/141

Origin repo: Tamdoma/tamdoma-framework
Lesson history: learnings/history/2026-10-16-stash-shared-across-worker-worktrees.md

Unverified intake.

## Observation

Framework lesson: `refs/stash` is shared across a repo's worktrees, so `git stash` in one detached worker worktree can lift a sibling worker's stash. Nothing refuses `git stash` in worker worktrees. implement-issue SKILL.md (installed copy, around line 42) covers A's refresh only.

Found by a /learn-issues pass on 2026-11-17, which sorted this lesson (framework learnings/LESSONS.md line 29 at HEAD 5de547004a) as Checkable: the mechanism is still reachable and not stopped.

## Location

akrogon implement-issue worker worktrees

## Reproduction

Not provided beyond the paths above.

## Expected behavior

Not provided.

## Urgency

Not provided. The lesson has recorded at least one case.

## Suspected cause

Agent view, from the lesson's history file and the current code cited above. Files read by the sorting agent; spot-checked by the filer only where noted.
Not inspected: other call sites beyond those named.
Related reports: none found (keyword search on Tamdoma/akrogon, all states, limit 5).

## Source: Tamdoma/akrogon#142

# akrogon phase Test-Change guard reports a cited test as uncited when the trailer reason wraps

Source: Tamdoma/akrogon#142
URL: https://github.com/Tamdoma/akrogon/issues/142

Origin repo: Tamdoma/tamdoma-framework
Lesson history: learnings/history/2026-10-24-test-change-trailer-single-line.md

Unverified intake.

## Observation

`src/phase.ts:522,530,576` reads trailers with `%(trailers:key=Test-Change,valueonly,unfold)`. When a Test-Change reason wraps onto a continuation line, git's parser drops the whole final trailer block, the guard reports "need a citation" and the phase move blocks. Seen on rubric-scrim-pass commit 106ac8ce.

Found by a /learn-issues pass on 2026-11-17, which sorted this lesson (framework learnings/LESSONS.md line 257 at HEAD 5de547004a) as Checkable: the mechanism is still reachable and not stopped.

## Location

akrogon `src/phase.ts` Test-Change citation guard

## Reproduction

Not provided beyond the paths above.

## Expected behavior

Not provided.

## Urgency

Not provided. The lesson has recorded at least one case.

## Suspected cause

Agent view, from the lesson's history file and the current code cited above. Files read by the sorting agent; spot-checked by the filer only where noted.
Not inspected: other call sites beyond those named.
Related reports: none found (keyword search on Tamdoma/akrogon, all states, limit 5).

## Source: Tamdoma/akrogon#143

# learn-issues gives a consumer judgment lesson no way out when an installed akrogon standing line now carries its rule

Source: Tamdoma/akrogon#143
URL: https://github.com/Tamdoma/akrogon/issues/143

Origin repo: Tamdoma/tamdoma-framework

Unverified intake.

## Observation

The framework repo holds judgment lessons whose rule is now an installed akrogon standing-design line, and the lesson rule gives them no way out of `learnings/LESSONS.md`.

- Framework `learnings/LESSONS.md` lines 146, 148, 156, 172, 178, 214 and 243 state "judge meaning, check literal paths". Their history files keep gaining cases (2026-09-30, 2026-10-01, 2026-10-08, 2026-11-04, 2026-11-14) and none carries an `Applied` or `Transferred` line.
- Since akrogon release 39e203a7 (#140), `skills/chart-issues/assets/standing-design.md` "Standing design lines" carries the model-choice line ("A script decides only what has one right answer ..."), which plan-issue and check-issue apply on every framework leaf.
- `skills/learn-issues/lesson-rule.md` Transfer: "A leaf never transfers ... a lesson whose step is not reached for its case or lives in another repo stays." `skills/learn-issues/SKILL.md` Sort: "A judgment lesson whose step lives in another repo stays and names that repo and step." So `/learn-issues` sorts all seven as Stays.
- Retire needs a removal, a loud refusal or a running guard (`lesson-rule.md` Retire). A model-read standing line is none of these.
- The same rule has no path for a lesson a standing line now contradicts. Framework lines 72 and 268 point the other way: 268 (2026-10-29) moves a model call to "the deterministic floor".

## Location

akrogon `skills/learn-issues/lesson-rule.md` (Transfer, Retire), `skills/learn-issues/SKILL.md` (Sort), as applied to Tamdoma/tamdoma-framework `learnings/LESSONS.md`.

## Reproduction

Run `/learn-issues` in the framework checkout. The seven lines sort as Stays (other repo). Seen in the framework-model-judgment chart, 2026-11-17 (framework `issues/chart/framework-model-judgment/forks/shape.md` F3).

## Expected behavior

A consumer-repo judgment lesson whose rule is carried by an installed akrogon step that runs on that repo's leaf path has a recorded way to leave `LESSONS.md`. A lesson that an installed standing line contradicts can be rewritten or retired with its reason. In the same pass, each kept add-or-tighten lesson names its one-right-answer source in its history file (framework chart signpost 8a).

## Urgency

Medium. The seven lines and the contrary 72 and 268 keep teaching seats both ways. Framework seats cite lessons when they add checks, which is the loop #140 and Tamdoma/tamdoma-framework#650 describe. Workaround: none inside the rule.

## Suspected cause

Agent view. The Transfer rule assumes the review step lives in the lesson's own repo. Akrogon lifecycle steps run on every consumer leaf but live in the akrogon repo, so no consumer judgment lesson can ever transfer into them.
Files read: akrogon skills/learn-issues/lesson-rule.md, skills/learn-issues/SKILL.md, skills/chart-issues/assets/standing-design.md (installed release 39e203a7); framework learnings/LESSONS.md.
Not inspected: whether other consumer repos hold such lessons.
Related reports: Tamdoma/akrogon#140 (delivered the standing line), Tamdoma/akrogon#95 (added the Retire exits), Tamdoma/tamdoma-framework#650 (framework half).

## Agent findings

- Local main is at origin/main (39e203a7, 0 behind, 2026-11-17).
- #141: `skills/implement-issue/SKILL.md` Shared context refresh says A "commits outstanding scoped work, never stashing or discarding it" before a refresh; nothing in `skills/implement-issue/worker-protocol.md` or the sub-brief template says it for workers. Workers run in `git worktree add --detach` worktrees at `<worktree_store>/<slug>-u<N>` (worker-protocol `## Launch and return`). Case: framework `learnings/history/2026-10-16-stash-shared-across-worker-worktrees.md` (two workers' `git stash pop` swapped edits). `src/sync.ts` uses `git rebase --autostash` on the registered checkout, not in worker worktrees.
- #142: `src/phase.ts` `citedPaths` and `emptyCommitTrailerValues` read `%(trailers:key=Test-Change,valueonly,unfold)`. The failing commit framework `106ac8ce` wraps the reason onto lines that do not start with whitespace, so git (2.56.1) does not see that paragraph as a trailer block at all. Continuation lines that start with whitespace are valid folding and `unfold` joins them. The error text says "Add each line to the final trailer block" and names no wrap.
- #143: rule text lives in `skills/learn-issues/lesson-rule.md` (Transfer, Retire) and `skills/learn-issues/SKILL.md` (Sort); `skills/chart-issues/lesson-rule.md` and `skills/implement-issue/lesson-rule.md` are copies to check. Framework half: Tamdoma/tamdoma-framework#650.
