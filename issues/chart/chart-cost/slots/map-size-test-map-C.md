# Territory map: merge re-runs and worktrees without deps (intake #57)

Slot C, blind. Read 2026-10-06. Repo paths are relative to this checkout. Paths starting with `evidence/` are under `framework-evidence/issues/` (the framework copy). Epic leaf paths are shortened to `<leaf>/...` and live under `evidence/open/skill-rewrite-tooling/`.

This map names forks, evidence, pitfalls, questions and fog. It does not design or compare options.

## 1. What the operator asked, and one assumption to challenge

Ask (verbatim): "merges are causing other leaves that are in the merge process to redo the testing because the main had changed. Come up with an elegant solution to avoid that completely, while making sure everything merges correctly, no conflicts".

The ask holds two goals that pull against each other.

- "Avoid that completely" means a green run is never thrown away because main moved.
- "Merges correctly" today means the rule in `skills/merge-issue/SKILL.md:37,49`: every push is tested on the newest main.

With today's rule, every landing makes every other in-flight run stale. A re-run can only be avoided in three ways: leaves land one at a time and each tests only on its turn, several leaves are tested together in one run, or main's movement is proven unable to change the result. The first removes waste but not waiting (F6). The other two change what a green run proves (K1). No inspected source offers a fourth way.

"No conflicts" is ambiguous. It can mean "the new mechanism must never leave a broken or conflicted main" or "leaves should stop conflicting with each other". The evidence shows zero rebase conflicts in this epic (F5), so the second reading may be solving a problem that did not occur. See K10 and OQ1.

## 2. Sources

### Inspected in the repo

- S1 `issues/seeds/57-leaves-merging-at-the-same-time-each.md` (intake).
- S2 `skills/merge-issue/SKILL.md`, `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md`, `skills/implement-issue/worker-protocol.md`, `skills/watch-issues/SKILL.md`, `skills/chart-issues/SKILL.md` and `assets/shapes.md`.
- S3 `src/next.ts`, `src/phase.ts`, `src/routing.ts`, `src/config.ts`, `src/sync.ts`, `src/preflight.ts`, `src/log.ts`, `src/state.ts`.
- S4 `issues/config.yaml`, `config.yaml`, `.gitignore`, `.gitattributes`, `README.md`, `docs/guide/{merge,setup,next,limits,problems,phases,gacp}.md`.
- S5 Prior charts under `issues/chart/`: `check-reruns`, `leaf-run-stalls`, `test-runs`, `framework-test-scope`, `test-time-and-temp`, `lessons-merge-conflicts`, `akrogon-slow-phases`, `seat-stall-detection`.
- S6 Framework evidence: `evidence/config.yaml`, `evidence/log.jsonl` (first row 2026-09-11, last row 2026-10-05 16:29:31Z, framework repo only), and `review-B.md` plus `implementation/report.md` for six leaves of `skill-rewrite-tooling`.

### Outside sources (all read 2026-10-06)

Practitioner tier:

- P1 Yaron Minsky, Jane Street, "Making 'never break the build' scale", 2014-07-06. https://blog.janestreet.com/making-never-break-the-build-scale/
- P2 Zuul project gating docs (OpenStack's gate). https://zuul-ci.org/docs/zuul/latest/gating.html
- P3 bors-ng home and docs. https://bors.tech/ and https://bors.tech/documentation/

Vendor documentation tier:

- P4 GitHub Docs, "Managing a merge queue" (enterprise-server 3.20 page). https://docs.github.com/en/enterprise-server@3.20/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue
- P5 GitLab Docs, merge trains. https://docs.gitlab.com/ci/pipelines/merge_trains/
- P6 Aviator docs, affected targets. https://docs.aviator.co/mergequeue/concepts/affected-targets
- P7 Aviator docs, batching. https://docs.aviator.co/mergequeue/concepts/batching
- P8 Bun docs, auto-install. https://bun.sh/docs/runtime/autoimport
- P9 Cursor docs, worktrees. https://cursor.com/docs/configuration/worktrees
- P10 pnpm docs, git worktrees. https://pnpm.io/git-worktrees

Tried and not readable: Graydon Hoare's "not rocket science" post (https://graydon2.dreamwidth.org/1597.html, 404 today, a prior chart recorded 403) and the bors forum thread on batching (404). Not read at all: Mergify, Graphite, Bazel and Nx docs. Search snippets for them were seen but are not used as evidence here.

## 3. Findings

### How merge works today

- F1 Merge is seat prose, not command code. B fetches, rebases onto `<remote>/<default_branch>`, runs every `checks` then every `merge_checks`, runs `akrogon phase <slug> merged --slot B --check`, pushes fast-forward only, and repeats fetch, rebase and checks after a rejected push (`skills/merge-issue/SKILL.md:37,47,49`). The only thing that orders competing leaves is git refusing a non-fast-forward push (`:39`). `docs/guide/merge.md:15` says the same.
- F2 Dispatch has no merge order. `src/routing.ts:35` gives merge one seat (B) and three exits. `src/next.ts:623-628` allocates and prompts. `src/next.ts:607-611` only holds a leaf back for `blocked-by`. All leaves of this epic have `blocked-by: []`, which the chart rule allows "even when files overlap" (`skills/chart-issues/assets/shapes.md:120`).
- F3 akrogon never runs check commands. Seats run them through their own shell (`issues/chart/test-runs/forks/heavy-run-slot.md:12`). The command only sees phase moves.
- F4 The reuse rule is one clause of prose: "an unchanged successful check run is reused only when neither code nor integration changed" (`skills/merge-issue/SKILL.md:51`). Nothing mechanical defines "integration changed".

### What the framework evidence shows (2026-10-05)

- F5 Every rebase in the epic was clean and every recorded `git range-diff` was `=`. No post-rebase re-run found an integration defect. Two leaves edited the same test file (`.claude/skills/test-verify/test/spec-contracts.test.ts`) and still rebased cleanly. Sample size is about 11 re-runs, so this is weak proof of safety.
- F6 Leaves landed at 13:14, 14:12, 14:53, 15:36 and 16:28Z (`evidence/log.jsonl`). That is one landing per 41 to 58 minutes. One full attempt takes about 37 to 40 minutes (verify 1991 to 2034 s plus short checks and selftest). So main already moved at about the speed of one leaf per suite run. Ordering alone would have saved machine time and removed luck, but the last of six leaves would still land about six suite runs after the first. P1 states the same arithmetic: "if verifying a pull-request takes `m` minutes, and you have `n` pull requests, the release time is going to take at least `m * n` minutes".
- F7 About 11 green full runs were discarded only because another push landed first: render-ready-loud 1, size-fixture-boundary 2, spec-mutation-anchors 3, lane-orphan-check 4, slice-boundary-anchors 1. In total about 26 completed `framework:verify` runs and about 6 incomplete ones served 5 landings. These counts come from review text, not process logs.
- F8 Wall time from first merge entry to `merged`: spec-mutation-anchors 230 min, size-fixture-boundary 159, render-ready-loud 125, emitter-crosscheck 91, context-acceptance 78. lane-orphan-check and slice-boundary-anchors were still open at the last log row.
- F9 The problem is older than this epic. On the night of 2026-10-04 to 05, six leaves entered merge between 23:12 and 00:27Z and took 63 to 227 minutes to land (`evidence/log.jsonl`). Their evidence folders are not in the copy, so the cause is not confirmed.
- F10 Reds at merge are common. Rows from 2026-10-01 on show 26 `merge → check.fix` moves against 40 `merge → merged`. Rows from 2026-09-11 on show 42 against 269. So 26 of the 42 happened in October. The cause of the jump was not inspected.
- F11 Parallel suites barely slowed each other on the long stage. `framework:verify:core` took 1783 to 1882 s in every run, alone or beside others. `selftest` went from about 113 s to 150 to 165 s. The seed's "parallel suites slow each other down" is true for selftest and about 2 to 5 percent for core.
- F12 Seats already skip re-runs after issue-record commits, each by its own rule. `spec-mutation-anchors/review-B.md:113` used an empty `git diff ... -- . ":(exclude)issues"` and pushed `2897ade6a` although the suite ran on `fee844f58`. `size-fixture-boundary/review-B.md:119-120` excluded `issues/**` and `learnings/**`, compared a tree hash and re-ran only the four short checks. This contradicts the seed's "seats re-run" in part. It also means a commit reached main whose SHA was never tested.
- F13 Record commits still cost something when the run is reused. The push is rejected, the seat must fetch, rebase, decide, re-run `--check` and push again. Three such commits landed at about 15:16, 15:53 and 16:41Z (S1).

### Who writes to main besides leaves

- F14 Two writers move main with record files: the operator's `gacp` (`git add .`, commit "add issues", pull with rebase, push, `docs/guide/gacp.md`) and `akrogon sync` (`src/sync.ts:116-136`, commit "sync issues"). Both run in the registered checkout on the default branch. Merge seat B also writes `learnings/LESSONS.md` into the registered checkout during merge and leaves it "for the operator to commit" (`skills/merge-issue/SKILL.md:35`).
- F15 Leaf branches cannot contain `issues/` files. `requireNoIssueFiles` refuses them (`src/phase.ts:274-280`). So leaf commits and record commits touch separate paths by construction, with one exception: `learnings/` is not under `issues/`.
- F16 `issues/config.yaml` holds the check commands and sits under `issues/`. `readRepo` reads it from the registered checkout's working copy (`src/config.ts:86-91`), not from the commit under test.

### Fresh worktrees without deps

- F17 `ensureWorktree` runs `git worktree add`, links `.env`, and saves state (`src/next.ts:245-278`, `linkEnv` at `:280-303`). It installs nothing. `repoSchema` has no setup key (`src/config.ts:28-49`). `README.md:107` says init "does not install dependencies".
- F18 The skills already assume an install method that is defined nowhere. The base-run rule says "installing dependencies there with the leaf's installation method" (`skills/implement-issue/SKILL.md:38`).
- F19 Three kinds of fresh worktree exist: the leaf worktree (`ensureWorktree`), implement worker worktrees (`skills/implement-issue/worker-protocol.md:11`, up to three), and detached base-run worktrees (`skills/implement-issue/SKILL.md:38`). Only the first is created by the command.
- F20 The missing deps hid until merge. Worktrees live at `<registered root>/issues/worktrees/<slug>` (`src/config.ts:31,128-129`), inside the registered checkout. P8: Bun auto-installs only when "no `node_modules` directory in the working directory or higher" exists. Reports give two different explanations for the masking: "Bun ran test runners from its global cache" (`render-ready-loud/implementation/report.md:55`) and "deps resolved from the main checkout's ancestor `node_modules`" (`slice-boundary-anchors/implementation/report.md:67`). The short `checks` passed and the first tool that needed a real local install (`skills:typecheck` inside `framework:verify`) failed.
- F21 The failure was expensive and the fix was cheap. One red verify ran 1408 s before reporting because the script does not stop on error. The repair was `bun install --frozen-lockfile`, "599 packages, 482 ms" (`lane-orphan-check/implementation/report.md:42`), with no code change. Each red still cost `merge → check.fix → check.review → merge`.
- F22 Deps failure shaped the concurrency. All seven first merge attempts on 2026-10-05 ended in `check.fix` between 12:21 and 13:24Z. Five involved missing `node_modules` (the seed's four plus `emitter-crosscheck/review-B.md:59`). Two were killed runs (F24). The repairs added full base runs under the base-run rule and sent the leaves back into merge together between 13:33 and 14:30Z. That explains most of the roughly nine concurrent suites in S1.
- F23 Seats patched it differently. emitter-crosscheck's B installed inside merge. render-ready-loud re-ran `bun install --frozen-lockfile` after each rebase.

### Reds that were not the leaf's code

- F24 Unexplained kills: spec-mutation-anchors verify exit -15, slice-boundary-anchors exit 143. A later slice-boundary-anchors run exited 1 after 1679 s with no kept diagnosis and went green on the same head (`slice-boundary-anchors/review-B.md:137-160`). A base run hung in `hooks:selftest` "under load" (`spec-mutation-anchors/implementation/report.md:42`). Orphaned processes from an interrupted run raced the next run's lint (`emitter-crosscheck/implementation/report.md:46`).
- F25 The suite leaves an untracked Python `__pycache__`, which makes `requireClean` (`src/phase.ts:268-272`) refuse `--check`. One seat pushed before clearing that refusal, "an ordering error" (`emitter-crosscheck/review-B.md:101`).

### What practitioners do (only facts that change the map)

- F26 Every inspected queue tests a leaf together with the leaves ahead of it, not alone on the newest main. P4: "grouped into a `merge_group` with the latest version of the `base_branch` as well as changes from pull requests ahead of it in the queue". P5: "Pipeline 2 tests merge request A and B together against the target branch." P2: "it assumes that all jobs will succeed and tests them in parallel accordingly".
- F27 A failure ahead costs the entries behind it. P5: "`B` is removed from the train. The pipeline for `C` is canceled, and a new pipeline starts". P2: "changes that were expecting it to succeed are re-tested without the failed change." P7: failed batches are "put into two bisected batches". So a queue removes re-runs caused by success and adds re-runs caused by failure.
- F28 A direct push to the target branch resets the queue. P5: merging immediately cancels all train pipelines and restarts the train. Record commits (F14) are exactly that kind of push.
- F29 Skipping tests for unaffected changes needs a declared input model. P6: "The main effort required of your team is to implement a mechanism to declare which targets are affected by a change." The prior lock gave the same reason for refusing reuse (L1).
- F30 Worktree tools declare setup in config and run it at creation. P9: `.cursor/worktrees.json` with `setup-worktree`, and "We do not recommend symlinking dependencies into the worktree. This can cause issues in the main worktree." P10: a shared content store makes later installs "nearly instant".

## 4. Forks

Order matters. K0 first. Then the deps group (K11 to K15), because it is cheap, it caused the herd (F22), and the re-run forks cannot be judged on clean data until it is fixed. Then K1, which sets what K2 to K10 may do.

### K0. One chart or two, and which repo owns what

- Decides: whether deps setup and merge re-runs are one decision set, and whether suite length belongs here.
- Why it changes the outcome: the multiplier in every count above is a 34-minute suite owned by the framework repo. `issues/chart/framework-test-scope/forks/leaf-gate.md` is open and already lists "a merge queue that runs the full suite on batches before main changes" as a candidate. Two charts could lock opposite answers.
- Evidence: F6, F22, L9. akrogon's own config has four short checks and no `merge_checks` (`issues/config.yaml`), so the mechanism must cost nothing there.
- Depends on: nothing. Blocks: K1, K8.

### K1. What one green run is allowed to prove

- Decides: whether a green run counts only for the exact tip it ran on, or also for a combination of several leaves, or also after main moved in ways that cannot matter.
- Why it changes the outcome: this is the only fork that can meet "about once". Under the current rule the best possible result is zero wasted runs and a wait of about n times the suite length (F6). Any other answer rewrites the lock "merge is the hard gate on the final rebased commit" (L1).
- Evidence: `skills/merge-issue/SKILL.md:37,49,51`, F5, F6, F7, F26, P1.
- Depends on: K0. Blocks: K2, K3, K5, K6, K8, K9.

### K2. What "the tested commit" means

- Decides: whether the gate is on a commit SHA or on file content outside some path set.
- Why it changes the outcome: two seats already pushed a SHA that was never tested (F12). If that stays allowed, the rule must be written down and checked by one owner. If it is not allowed, record commits must stop moving the gated branch (K4), or every record commit costs a full run.
- Evidence: `spec-mutation-anchors/review-B.md:113`, `size-fixture-boundary/review-B.md:119-120`, `skills/merge-issue/SKILL.md:51`, L1, L2.
- Depends on: K1. Blocks: K3, K4.

### K3. Which paths cannot change a check result, and who says so

- Decides: the set of paths whose change keeps a green run valid, and whether akrogon fixes it, the repo declares it, or a tool derives it.
- Why it changes the outcome: the seed's cause 1 is "nothing mechanical decides that". Two seats used two different sets (F12). A wrong set lets an untested change through the gate silently.
- Evidence: F12, F15, F16, F29, `issues/chart/check-reruns/forks/check-scheduling.md:22` ("safe reuse needs declared inputs akrogon lacks").
- Depends on: K2.

### K4. Whether record commits move the gated branch while leaves are merging

- Decides: where and when `issues/` and `learnings/` commits land relative to leaf pushes.
- Why it changes the outcome: even with K3 answered, each record commit rejects one in-flight push and adds a rebase, a decision and a second `--check` (F13). In a queue, a direct push restarts everything (F28).
- Evidence: F14, `src/sync.ts:116-136`, `docs/guide/gacp.md`, `skills/merge-issue/SKILL.md:35`, `.gitattributes` (`learnings/LESSONS.md merge=union`), L7.
- Depends on: K2, K3.

### K5. Who owns the landing step

- Decides: whether landing stays seat prose (F1) or some part moves into the command, and which part: order, the rebase, the check run, the push.
- Why it changes the outcome: today N seats each decide alone, and the only shared signal is a rejected push after 34 minutes. An ordering error under prose already happened (F25). But the command cannot resolve a conflict or judge a red, and it never runs checks today (F3).
- Evidence: `skills/merge-issue/SKILL.md:25,39,41,47,49`, `src/phase.ts:225-235`, `src/routing.ts:35`, F3, F25.
- Depends on: K1. Blocks: K6, K7.

### K6. Landing order, and what happens behind a red or conflicted leaf

- Decides: which leaf goes first, whether order is fixed at merge entry, and what leaves behind a failed one do.
- Why it changes the outcome: 26 of 67 merge exits in October were `check.fix` (F10, the other exits were 40 `merged` and 1 `failed`). With a failure rate that high, the rule for "the one ahead of me failed" is used often, not rarely. Practice differs here (F27).
- Evidence: F8 (first to enter merge was last to land: spec-mutation-anchors entered 12:38Z, landed 16:28Z), F10, F27, `docs/guide/limits.md` (no priority field).
- Depends on: K1, K5.

### K7. What a leaf that is waiting to land looks like to akrogon

- Decides: whether waiting is a visible state, and how the next leaf is woken.
- Why it changes the outcome: today a leaf is either prompted or busy. Every existing mechanism misreads a third condition (R2 to R6).
- Evidence: `src/next.ts:196-229` (Busy notice after one hour), `:305-318,334-337` (`max_active`), `:481-493,527-551` (idle seat prompted again after 2 minutes), `:607-611` (dependents wait for `merged`), `docs/guide/next.md` (`next` is one pass, not a background worker), L5.
- Depends on: K5, K6.

### K8. How many heavy runs may run at once

- Decides: whether to reopen the heavy-run slot that was ruled out on 2026-10-02.
- Why it changes the outcome: that ruling says "Reopen only as new intake with a traced load failure" (`issues/chart/test-runs/forks/heavy-run-slot.md:30`). This intake brings kills, a hang and orphan races (F24) but no trace of who caused them, and core duration barely moved (F11). If K1 and K5 make merge runs serial by construction, the remaining overlap is implement and `check.fix` base runs.
- Evidence: F11, F22, F24, `config.yaml` (`max_active: 12`), `issues/chart/test-runs/forks/timeout-cause.md:50` (three parallel runs were fine, "Not a measured maximum").
- Depends on: K0, K1, the deps group.

### K9. What merge does with a red that is not the leaf's code

- Decides: the route for a killed, hung, flaky or environment red at merge.
- Why it changes the outcome: every red goes `merge → check.fix → check.review → merge` (`skills/merge-issue/SKILL.md:43`, `src/routing.ts:35`). That is two extra phases plus a base run, and by then main has moved. If landing is ordered or combined, such a red also hurts the leaves behind (F27).
- Evidence: F10, F21, F24, `skills/implement-issue/SKILL.md:78-80`, L4.
- Depends on: K1, K6. Shrinks after the deps group, since five of seven first reds were missing deps.

### K10. What "no conflicts" requires

- Decides: whether this chart must prevent leaves from conflicting, or only guarantee that a conflict never reaches main unreviewed.
- Why it changes the outcome: prevention would change chart rules (`skills/chart-issues/assets/shapes.md:120` allows overlapping parallel leaves). Handling keeps B's current conflict rule (`skills/merge-issue/SKILL.md:41`) but must say who resolves when the command or a combined run meets a conflict.
- Evidence: F2, F5 (zero conflicts seen), `skills/merge-issue/SKILL.md:41,45`.
- Depends on: OQ1, K5.

### K11. Where the setup step is declared and who runs it

- Decides: whether the repo declares a setup command, and whether the command or a seat runs it.
- Why it changes the outcome: with no declaration, each seat finds the gap alone, at the most expensive point (F21, F23). A seat-run step repeats today's failure shape. A command-run step runs inside `ensureWorktree`, which is under the global lock (R14).
- Evidence: `src/next.ts:245-278`, `src/config.ts:28-49`, `skills/implement-issue/SKILL.md:38`, `README.md:107`, F30.
- Depends on: K0.

### K12. Which worktrees get setup

- Decides: leaf worktree only, or also worker worktrees and base-run worktrees.
- Why it changes the outcome: only the leaf worktree is command-made (F19). Worker and base-run worktrees are seat-made, so one command hook does not reach them. Base runs were part of the 2026-10-05 load.
- Evidence: F19, F22, `skills/implement-issue/worker-protocol.md:11`.
- Depends on: K11.

### K13. When setup runs again

- Decides: once at creation, after each rebase, or when a named input changes.
- Why it changes the outcome: a leaf worktree lives for hours and is rebased many times. Another leaf can land a lockfile change. One seat already reinstalled after every rebase (F23).
- Evidence: F23, `skills/merge-issue/SKILL.md:37`.
- Depends on: K11.

### K14. What happens when setup fails or is slow

- Decides: whether a failed setup blocks the leaf before a seat starts, and where the error shows.
- Why it changes the outcome: `ensureWorktree` runs before any prompt and inside `withLock` (`src/next.ts:774`). A network failure or a slow cold install there stalls every repo's dispatch. A silent failure repeats F20.
- Evidence: `src/next.ts:245-278,774`, F21 (482 ms warm, cold not measured).
- Depends on: K11.

### K15. Whether worktrees keep resolving modules from the registered checkout

- Decides: whether a worktree inside the registered checkout may keep falling back to the parent `node_modules`.
- Why it changes the outcome: this fallback hid the missing install through implement and review (F20). After K11 it would also hide a failed or stale setup, and it can resolve the registered checkout's versions instead of the leaf's.
- Evidence: `src/config.ts:31,128-129`, F20, P8, P9.
- Depends on: K11. Independent of K1.

## 5. Lifetime pitfalls

Each names the fork that owns it.

- R1 (K5) The global lock at `<AKROGON_HOME>/.lock` wraps `next`, `phase`, `sync` and `park` (`src/next.ts:774`, `src/phase.ts:330`, `src/sync.ts:9`). Any command step that holds it during a 34-minute run freezes all dispatch in all repos.
- R2 (K7) An idle seat that is not done is prompted again after 2 minutes (`src/next.ts:481-493,527-551`). A leaf that waits by going idle gets its merge prompt again.
- R3 (K7) A seat that waits by blocking looks busy. After one hour it gets the Busy notice (`src/next.ts:196-229`) and `skills/watch-issues/SKILL.md:36-40` judges it as stalled.
- R4 (K7) Waiting leaves hold `max_active` slots (`src/next.ts:305-318`). A long queue can starve new work. The reverse is also a trap: freeing the slot lets more leaves pile into the queue.
- R5 (K6, K7) Dependents start only at `merged` (`src/next.ts:607-611`). Any order that delays a prerequisite delays its whole chain.
- R6 (K7) No clocks, watchdogs or polling is a standing lock (L5), and `next` is a single pass. Something must wake the next leaf when a landing ends, and it cannot be a timer.
- R7 (K6) The leaf whose turn it is can die: tab closed, usage limit, parked, crashed seat. A turn held by a seat across tool calls is not a process, so the flock's release on exit does not cover it. Everyone behind then waits forever.
- R8 (K1, K6) In a combined run, one bad leaf fails the run for all. Finding the culprit costs more runs (F27). With F10's red rate this may cost more than it saves.
- R9 (K9) A flaky or killed run (F24) in an ordered or combined scheme punishes leaves that did nothing wrong. Practice is to eject and re-test, which re-creates the re-run.
- R10 (K3) `issues/config.yaml` defines the gate and lives under `issues/` (F16). A rule that treats `issues/` as inert lets a change to the check commands pass without a run. The config is also read from the working copy, so the gate definition is not tied to the tested commit at all.
- R11 (K3, K4) `gacp` runs `git add .` (F14). A commit named "add issues" is not guaranteed to contain only records. A rule must judge the diff, not the message or the author.
- R12 (K2) An untested SHA on main (F12) weakens bisect, revert and audit, and it breaks the reason given in `issues/chart/leaf-run-stalls/forks/red-criterion.md:59-61`, which relies on merge refusing red `checks` on what lands.
- R13 (K4) B writes lesson lines into the registered checkout during merge (F14). So merging itself produces the record commits that disturb merging.
- R14 (K14) Setup inside `ensureWorktree` runs under the global lock before any seat exists. There is no seat to report a failure and no artifact folder rule for it.
- R15 (K13) Deps go stale when a rebase brings a new lockfile. A setup that ran once then gives a red that looks like a code failure.
- R16 (K15) With the parent `node_modules` reachable, a failed or skipped setup still passes the short checks. The fix would look done while the failure is only hidden again.
- R17 (K11, K12) Sharing one `node_modules` by symlink lets a leaf's install change the registered checkout's tree (P9 warns about this). The `.env` symlink (`src/next.ts:280-303`) is the only shared file today.
- R18 (K5, K10) The command cannot resolve a conflict. If the command rebases, a conflict must go back to a seat, and B's resolution today reaches main with a recorded range-diff but no second review (`skills/merge-issue/SKILL.md:41`).
- R19 (K8, K9) Seats run long checks through detached runners because of tool time limits. Cancelling a run that became pointless leaves orphan processes that race the next run (F24).
- R20 (K5) `requireClean` refuses on files the suite itself generates (F25). Any stricter ordering of `--check` and push meets this on every framework landing.
- R21 (K0, K1) akrogon's own repo has four short checks and no `merge_checks`. A mechanism sized for a 34-minute suite must not add steps or waiting there.
- R22 (K4, K6) `akrogon sync` and `gacp` push to the default branch outside any leaf order (F14). An order that only leaves respect is still broken by them.
- R23 (K1) F5's zero integration failures comes from one epic whose leaves mostly touched separate files. A rule built on it meets its first real cross-leaf break later, in a different repo.

## 6. Existing locks this intake touches

- L1 `issues/chart/check-reruns/forks/check-scheduling.md:22-24`. Locks: `merge_checks` run only at merge and "before every push". Off route: the check-record runner, because "passing-record reuse showed no savings, and safe reuse needs declared inputs akrogon lacks". K1, K2 and K3 reopen this. New evidence since the lock: F7 (about 11 discarded green runs) and F12 (seats already reuse).
- L2 `issues/chart/leaf-run-stalls/forks/red-criterion.md:59-61`. Criteria cite only blocking `checks` because merge refuses red checks on what lands. K1 and K2 must keep that true or reopen it. Its lock list at `:34` repeats "no clocks, watchdogs or polling".
- L3 `issues/chart/test-runs/forks/heavy-run-slot.md:30`. Heavy-run slot ruled out on 2026-10-02 pending "a traced load failure". K8. This intake has no trace.
- L4 `issues/chart/test-runs/forks/base-red-rule.md:83-87`. A killed run is incomplete and goes to `failed`, with "No merge-issue change". K9.
- L5 No clocks, watchdogs or polling (`leaf-run-stalls`, `seat-stall-detection/CHART.md:15-16`). K7.
- L6 `issues/chart/test-time-and-temp/CHART.md` Off route: "fixture `node_modules` copies" and "Post-merge main health runs". K11 and K1 must not bring these back by another name without reopening.
- L7 `issues/chart/lessons-merge-conflicts`. Union merge for `LESSONS.md`, with `gacp` and `sync` rebase logic unchanged. K4.
- L8 `issues/chart/akrogon-slow-phases` Off route: "Fewer required proofs or checks: the check-reruns lock stands". K1.
- L9 `issues/chart/framework-test-scope/forks/leaf-gate.md` (framework repo, open). Lists a batch merge queue as a candidate. K0.

## 7. Questions

### For the operator

- OQ1 Does "no conflicts" mean leaves must stop conflicting, or that a conflict must never reach main unresolved? (K10)
- OQ2 Is waiting acceptable when no machine time is wasted? Six leaves at 34 minutes each is about 3.4 hours for the last one under the current rule. (K1)
- OQ3 May a commit land whose SHA was not tested when only record files differ? Two already did. (K2)
- OQ4 May operator record commits wait while leaves are landing? (K4)
- OQ5 Should this chart also cover the 34-minute suite, or does `framework-test-scope` own it? (K0)

### For practitioner research in the fork rounds

- Q1 With a suite this long and a red rate like F10, what batch or train size do teams settle on, and what red rate makes combining a loss? (K1, K6)
- Q2 Does the commit that lands in each queue keep the exact SHA that was tested? P4 and P5 were not read closely enough to say. (K2)
- Q3 How do teams declare paths that skip the gate, and what failures followed from wrong declarations? (K3)
- Q4 How do queues treat a flaky red: retry in place, eject, or bisect? (K9)
- Q5 Who resolves a conflict found by the queue, and is the resolution reviewed again? (K10)
- Q6 How do queues treat direct pushes to the target branch other than restarting? (K4)
- Q7 What do bors batching and bisection actually do? The pages read name `max_batch_size` only. (K1)
- Q8 How do worktree-per-agent tools handle a failed setup and a lockfile that changes after creation? (K13, K14)
- Q9 Are concurrent `bun install` runs against one global cache safe? (K12)
- Q10 What do Bazel or Nx affected-only users require before they trust a skipped test? Not read. (K3)

## 8. Fog and what was not measured

- G1 No process-level record of the roughly nine concurrent suites. The count comes from the seed and from review text.
- G2 Who sent SIGTERM to the two killed runs is unknown (F24). So is the cause of the exit 1 after 1679 s.
- G3 Whether any framework check reads `issues/` or `learnings/` was not checked. K3 needs it.
- G4 The two explanations for masked deps disagree (F20). Which one is true was not tested.
- G5 `context-acceptance` evidence and all B session logs were not available. Push rejections were counted from review text only.
- G6 The real rate of integration breaks after a clean rebase is unknown. Zero in about 11 is a small sample from one epic (F5).
- G7 Install cost with a cold cache, and in repos that do not use Bun, was not measured.
- G8 Why `merge → check.fix` jumped in October was not inspected (F10).
- G9 The 2026-10-04 night herd was seen only in the log (F9).
- G10 The log ends at 16:29:31Z. The seed's tail (16:41 to 16:53Z) was not verified.
- G11 Evidence file times are all the copy time, so run times come from the log and review text.
- G12 Only the framework repo was looked at. Behavior in other registered repos is unknown.
- G13 Graydon Hoare's original post and bors batching details were not readable. Mergify, Graphite, Bazel and Nx were not read.

## 9. What matters most

- M1 Fix deps first (K11 to K15). It is the cheap condition, it failed five of seven first merges, and it created the herd.
- M2 K1 is the root of the re-run condition. Ordering alone removes about 11 wasted runs per epic but does not shorten the wait, because main already moved at about one leaf per suite run (F6). Only a change to what a green run proves can meet "about once" and "not hours", and that reopens lock L1.
- M3 The record-commit part is smaller than the seed says. Seats already skip the re-run, with two different unwritten rules and an untested SHA on main (F12). The decision needed is to make one rule and one owner (K2, K3, K4).
