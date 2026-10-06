# Map A: concurrent merge re-runs (Tamdoma/akrogon#57)

## Mechanism (inspected)
- skills/merge-issue/SKILL.md:37 fetch, rebase, run every `checks` then `merge_checks`; :39 "ordinary git non-fast-forward refusal serializes competing pushes"; :49 repeat fetch/rebase/checks after rejection; :51 reuse "only when neither code nor integration changed" with no mechanical decider.
- src/routing.ts:35 `merge` has one slot (B). src/next.ts:567 dispatchLeaf prompts required slots for any leaf whose deps are merged; nothing limits how many leaves of one repo are in `merge` at once.
- src/sync.ts:136 `akrogon sync` pushes issues-only commits to `<remote>/<default_branch>` ("sync issues"/"add issues"), so bookkeeping moves the same branch merges race on.
- src/phase.ts:227 `requireNoIssueFiles`: a leaf branch never changes `issues/`. So a rebase over issues-only commits leaves the tree outside `issues/` identical to what was tested.
- But checks are defined in `issues/config.yaml` (src/config.ts:91). An issues-only commit can change which checks run.
- src/next.ts:245 ensureWorktree: `git worktree add` + linkEnv, no install. framework `merge_checks.verify` needs node_modules, `checks` apparently do not.
- Framework evidence: lane-orphan-check 4+ rebase reruns, spec-mutation-anchors 4 rebase folders; main history 13:56-19:07 shows 3 "add issues" commits interleaved with code merges; 9 concurrent verify runs at 13:07Z.

## Outside practice (read 2026-10-05)
- Graydon Hoare / bors, "not rocket science rule": the landed commit is the tested commit; bors tests one merge at a time. (via typesanitizer.com/blog/not-rocket-science.html, janestreet blog)
- GitHub merge queue docs (docs.github.com ... managing-a-merge-queue): speculative `gh-readonly-queue` branches test PR2 on top of PR1; concurrency cap 1-100; batching; failure ejects and rebuilds later groups.
- GitLab merge trains (docs.gitlab.com/ci/pipelines/merge_trains/): parallel speculative pipelines, cap default 20, min 1 = sequential; a failure cancels and restarts every later pipeline.
- Jane Street, "Making never break the build scale": speculation and batching improve constants only; fast incremental builds mattered more.
- kunchenguid/firstmate#4453: same symptom on one machine (one PR ran full checks 4 times in a day, load 40 on 24 cores). Proposal: local landing queue per base branch, serialize only update+check+merge, release the turn only after verified merge or failure exit; "a simple serialized queue is enough at the volume of a single-machine fleet".
- Synthesis: speculation pays when CI capacity is wide and separate from the dev machine. akrogon runs every suite on one machine, so parallel speculative runs compete for the same CPU (the 9 concurrent verifies) and a failure restarts later runs. A serial turn is the practitioner answer at this scale.

## Forks
F1. How are merges serialized?
- 1a (A recommends) per-repo merge turn in dispatch: `akrogon next` prompts B for at most one leaf per repo in `merge`; others wait unprompted in `merge`; turn frees when the holder leaves `merge` (merged, check.fix, failed). Later: one stuck holder blocks the repo's merges, so status must name the holder and stall routing must free it.
- 1b speculative train (GitLab/GitHub style). Breaks: on one machine parallel runs slow each other; restart cascade on failure; needs a cross-leaf integration branch actor akrogon does not have.
- 1c batch all waiting leaves into one run. Breaks: failure attribution needs bisect; violates one-leaf-one-seat model.
- 1d lock inside the skill (git ref or file). Breaks: agent-held lock survives a crashed seat; prose lock is not mechanical.

F2. What may an issues-only move of main reuse?
- 2a (A recommends) mechanical reuse: the seat (or a command) compares tested base and new base with `git diff --quiet <tested> <new> -- . ':(exclude)issues'` plus unchanged `checks`/`merge_checks` in `issues/config.yaml`; equal means rebase and push without rerun, recorded in review-B.md. Pitfall: config.yaml change alters the suite, so it must be compared. Pitfall: a consumer check that reads `issues/`. Invites: violates literal not-rocket-science (pushed SHA differs from tested SHA) though trees outside issues/ are identical.
- 2b `akrogon sync` waits for the merge turn. Breaks: operator sync blocked for a full suite; manual operator commits still race.
- 2c move issues/ off the code branch. Removes the class but is a large migration of every repo and command. Off route candidate.

F3. Fresh worktree deps.
- 3a (A leans) repo config `setup` command (e.g. `bun install --frozen-lockfile`), run by ensureWorktree on creation and by merge after every rebase (lockfile can change on rebase). Two call sites.
- 3b no akrogon code: consumers prefix the needing check, e.g. `verify: bun install --frozen-lockfile && bun run framework:verify`. One place, covers rebase, but each consumer must know; A-seat tests still lack deps.
- 3c setup as first `checks` entry. Relies on map order; reruns every check pass.

F4. Queue order and visibility: FIFO by move-into-merge time (log.jsonl). `akrogon status` shows "waiting for merge turn, holder <slug>".

F5. Does a waiting merge leaf keep its tab and count toward max_active? Keeping is simplest and resumes fast; costs capacity slots during long queues.

## Pitfalls over lifetime
- Stuck holder blocks every merge in the repo (R1). Needs status line and existing stall/failed routing to free it.
- Operator code commit to main still forces a rerun. Correct and rare.
- A check that reads issues/ would make 2a unsound. Rule must say checks may not depend on issues/ besides config.
- A rebase conflict in a queued leaf only appears at its turn. Acceptable, same as today.
- Implement-time `checks` runs still run in parallel across leaves (firstmate's second feature, full-check limit). Separate; candidate Off route or Fog.
- SIGTERM 143 on merge checks: cause unknown, separate.
