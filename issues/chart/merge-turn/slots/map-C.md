# Map C: concurrent merge re-runs and cold worktrees (Tamdoma/akrogon#57)

Slot C, blind. Written 2026-10-05. Maps A and B not read. No repo file edited.

Intake: `issues/seeds/57-leaves-merging-at-the-same-time-each.md`. Operator ask, verbatim: "merges are causing other leaves that are in the merge process to redo the testing because the main had changed. Come up with an elegant solution to avoid that completely, while making sure everything merges correctly, no conflicts".

Paths without a prefix are in akrogon. `fw:` means `/home/ivan/Work/infra/tamdoma/framework/`. `srt/` means `fw:issues/open/skill-rewrite-tooling/`.

## 1. Findings from inspected files

### What the rules say today

- F1. Merge is optimistic and unserialized. `skills/merge-issue/SKILL.md:37` orders fetch, rebase, every `checks`, then every `merge_checks`. `:39` says "ordinary git non-fast-forward refusal serializes competing pushes". `:49` repeats fetch/rebase/checks after a rejection. The only arbiter is the remote, and it speaks after the 35-minute run, not before it.
- F2. The reuse rule has no mechanical test. `skills/merge-issue/SKILL.md:51`: reuse "only when neither code nor integration changed". Nothing defines "integration changed", so the seat decides each time.
- F3. Nothing in the command knows that two leaves are merging. `src/routing.ts:35` gives `merge` to slot B with exits `merged`, `check.fix`, `failed`. `src/next.ts:626-628` dispatches every required slot as soon as a leaf is allocated. The only cross-leaf rule is `blocked-by` (`src/next.ts:607-611`) and the global cap `max_active` (`src/config.ts:15`, enforced at `src/next.ts:336`).
- F4. A released leaf wakes only its dependents. `docs/guide/limits.md:11`: "A completion starts only its dependents... Other open leaves start only through a manual `akrogon next`." Any design where a leaf waits for another leaf's merge needs a new wake path (`src/next.ts:681` `dispatchDependents` is the existing shape).
- F5. Phase moves already run under one global lock. `src/phase.ts:330` wraps every `akrogon phase` call in `withLock(<home>/.lock)` (`src/state.ts:139`, `flock -x`). Order between leaves can be decided there with no clock and no polling.
- F6. Leaf branches cannot contain `issues/` files. `src/phase.ts:274-279` (`requireNoIssueFiles`) refuses every non-failed move when `git diff <target>...HEAD -- issues` is non-empty. So a leaf's diff and an issues-only commit on main are path-disjoint by an enforced rule, not by habit.
- F7. Worktree creation installs nothing. `src/next.ts:245-278` runs `git worktree add`, then `linkEnv` (`:280-303`), which symlinks `.env` after three git safety checks. `src/config.ts:28-49` (`repoSchema`) has no setup key. `checks` is `:35`, `merge_checks` is `:36`.
- F8. Worktrees sit inside the registered checkout (`worktree_root: issues/worktrees`, `src/config.ts:31`, `fw:issues/config.yaml:3`). Node module resolution walks up to the registered checkout's `node_modules` (397M in `fw:`). This hides the missing install from most commands.

### What happened in tamdoma/framework on 2026-10-05

- F9. Six leaves entered `merge` between 12:38Z and 12:57Z (`fw:issues/log.jsonl:1547-1560`). The last one, `lane-orphan-check`, merged at 17:08Z (`:1608`).
- F10. `lane-orphan-check` ran the full suite 7 times for one unchanged patch: 1 red on missing deps, 1 by seat A after install, 5 after rebases (`srt/lane-orphan-check/implementation/merge-evidence/` has `rebased` to `rebased-5`, each `results.txt` shows 6 commands exit 0). Each `framework:verify:core` took 1830 to 1848 seconds (`srt/lane-orphan-check/review-B.md:85,98,111,124`).
- F11. Every rebase was clean and every rerun was green. `review-B.md:81` records range-diff `1: d87137bd2 = 1: 61170ccc6`. Lines 89, 102, 115, 128 each say "Push rejected non-fast-forward" naming the leaf that landed. This answers the seed's "Not inspected" item: the rejections are recorded. On this day the reruns found zero integration defects.
- F12. The seat already invented the issues-only shortcut. `srt/lane-orphan-check/review-B.md:139-147`: push rejected by `e612d10ee` (`add issues`), `git diff --exit-code 3700fc48e HEAD -- . ':!issues'` exited 0, verification reused, push succeeded. `srt/spec-mutation-anchors/review-B.md:113` did the same after `866127cd7`. Two seats, same proof, no rule that names it.
- F13. The operator's `add issues` commits contain the merge seats' own output. `866127cd7` changes `issues/log.jsonl` and `lane-orphan-check/implementation/merge-evidence/rebased-3/*`. Merge writes evidence under the leaf folder in the registered checkout (`skills/merge-issue/SKILL.md:37`), and `logMove` appends to `issues/log.jsonl` on every phase move (`src/phase.ts:137`). The lifecycle itself produces the files whose commit moves main.
- F14. All six leaves touched different files (git log of `origin/main` 13:33Z to 17:07Z: `verify-spec-contracts.ts`, `render-ready-core.ts`, `batch-size-fit.test.ts`, `spec-contracts.test.ts`, `scan-skill-shape.ts`). `spec-contracts.test.ts` is touched by two leaves (`b82c67d78`, `2897ade6a`) and still rebased clean.
- F15. Cold worktree, confirmed. `srt/lane-orphan-check/implementation/merge-evidence/results.txt`: the five `checks` commands exit 0, `framework:verify` exits 2. `review-B.md:54-56`: `Cannot find module 'markdown-it'`. `:67`: "this worktree has no `node_modules`". The five `checks` passed because of F8. `srt/slice-boundary-anchors/review-B.md:119` explains why verify fails anyway: its scratch copy links the leaf tree's dependency folder, so resolution through the parent folder does not reach it.
- F16. The env-only repair cost a full review round. For `lane-orphan-check`: `merge -> check.fix` 13:16Z, `check.fix -> check.review` 13:57Z, `check.review -> merge` 13:57Z (`fw:issues/log.jsonl:1565,1576,1578`), with the same head `d87137bd` throughout. `review-B.md:73`: "Repair diff is empty". `src/routing.ts:35` gives merge no exit for "environment was not ready".
- F17. Two SIGTERM kills are unexplained. `srt/spec-mutation-anchors/review-B.md:67-71` and `srt/slice-boundary-anchors/review-B.md:91,104`. `spec-mutation-anchors` entered merge at 12:38Z and left at 12:48Z (`fw:issues/log.jsonl:1547,1555`), about 10 minutes. That matches a harness tool-call timeout as well as it matches contention. Not established. Later runs used a detached supervisor (`slice-boundary-anchors/review-B.md:137`).
- F18. One rerun went red with no code cause. `srt/slice-boundary-anchors/review-B.md:137`: verify exit 1 after 1679 seconds on rebased head `ea53dcc`. `:160`: "Repair diff is empty and worktree clean". It then cost check.fix, check.review and merge again (`fw:issues/log.jsonl:1586-1592`). More runs mean more exposure to a flaky or contended suite.
- F19. `fw:issues/config.yaml:7-14`: five `checks`, one `merge_checks` (`verify: bun run framework:verify`). `fw:package.json:150-151` shows `framework:verify` already contains `hooks:parity`, `hooks:selftest` and `contracts:verify`, so merge runs those twice per pass.

### Existing locks that bind this work

- L1. `issues/chart/check-reruns/forks/check-scheduling.md:22-24`. `merge_checks` run only at merge. "merge runs `merge_checks` before every push". The check-record runner is Off route, with the reason "safe reuse needs declared inputs akrogon lacks".
- L2. `issues/chart/leaf-run-stalls/forks/red-criterion.md:34`. No clocks, watchdogs or polling. `:59`: merge refusing red `checks` is what protects a command from a sibling (the not-rocket-science rule).
- L3. Tension to surface, not settle here: L1's reason for foreclosing reuse was that emdash showed no savings. F10 and F12 show savings and a seat-made reuse proof. The operator may want to restate L1 for the path-disjoint case only.

## 2. Outside practice

All read 2026-10-05.

| Code | Source | Tier | What it gives |
| --- | --- | --- | --- |
| P1 | bors-ng README, https://github.com/bors-ng/bors-ng/blob/master/README.md | practitioner | Batch reviewed PRs on a staging branch, test the batch once, fast-forward main to the exact tested commit. A failed batch is bisected. A one-PR batch that fails is kicked back. Archived April 2024, points to GitHub merge queue. |
| P2 | bors-ng getting started, https://bors.tech/documentation/getting-started/ | practitioner | "if that result is 'OK', master gets fast-forwarded to reach it." Says nothing about direct pushes to master during a batch. |
| P3 | Jane Street, "Making never-break-the-build scale", https://blog.janestreet.com/making-never-break-the-build-scale/ | practitioner | Rule: "automatically maintain a repository that never fails its tests". Cost: "if verifying a pull-request takes m minutes, and you have n pull requests, the release time is going to take at least m * n minutes". Fix: "speculate en masse by merging multiple requests together". |
| P4 | GitLab merge trains, https://docs.gitlab.com/ci/pipelines/merge_trains/ | practitioner | Each train pipeline tests the MR plus all MRs ahead. A failing MR is removed and later pipelines restart. "Merge immediately" cancels and restarts the whole train. Default 20 parallel pipelines. |
| P5 | Zuul gating, https://zuul-ci.org/docs/zuul/latest/gating.html | practitioner | Speculative parallel testing: "if one fails, then changes that were expecting it to succeed are re-tested without the failed change." "In the worst case, changes are tested one at a time." |
| P6 | Mergify merge queue, https://docs.mergify.com/merge-queue/ | practitioner (vendor) | Batches, speculative checks, scopes ("Unrelated changes shouldn't block each other"), "Direct Merge: Skip the queue CI run when nothing relevant moved", two-step CI ("run heavy tests only at merge time"). |
| P7 | Aviator affected targets, https://docs.aviator.co/mergequeue/concepts/affected-targets | practitioner (vendor) | Disjoint declared targets merge "independently in any order". "The main effort required of your team is to implement a mechanism to declare which targets are affected by a change." |
| P8 | Nx affected, https://nx.dev/ci/features/affected | practitioner | Affected set from git diff plus project graph. A lockfile change marks all projects affected by default. Base should be "the latest successful commit on the main branch". |
| P9 | Bun install cache, https://bun.sh/docs/install/cache | practitioner | Linux default backend is hardlink from the global cache, "so the contents of the package only exist in a single location on disk". A warm install copies nothing. |
| P10 | Claude Code worktrees, https://code.claude.com/docs/en/worktrees | practitioner | "A worktree is a fresh checkout, so initialize your development environment there". Gitignored files are carried by a declared list (`.worktreeinclude`), not by guessing. |
| P11 | GitHub merge queue docs | not read | The docs URL returned 404 three times. Claims about it below come from training only and are marked. |
| P12 | Graydon Hoare's original post, graydon2.dreamwidth.org/1597.html | not read | 404 today (403 on 2026-10-01 per `red-criterion.md:47`). Quoted through P3. |

What the sources agree on:

- PR1. Nobody keeps the optimistic rebase-and-retry race once the suite is slow. Every system puts an ordering authority in front of the test run (P1, P4, P5). akrogon's authority (the remote's push refusal) sits behind the run (F1).
- PR2. The tested commit is the pushed commit (P1, P2). This is the same promise as L1.
- PR3. Serial order alone costs m times n wall time (P3). Batching or speculation is what buys wall time back. Speculation needs spare machines (P5). The tamdoma host has one machine, and 9 parallel verifies already slowed each other (seed, F17).
- PR4. Skipping a run is accepted only when the tool can prove nothing relevant moved (P6 "Direct Merge", P7, P8), and the proof needs declared inputs. A wrong declaration breaks main silently (P7).
- PR5. A direct push to the target that bypasses the queue invalidates everything in flight (P4 "merge immediately"). The operator's `add issues` commits are that bypass.

## 3. Material forks

### K1. Who orders competing merges?

This is the root fork. F1 and PR1 say the order must be decided before the check run.

- K1-O1. Command-owned merge turn. One leaf per repo holds the turn. A leaf entering `merge` while another holds it is not prompted. The turn passes when the holder leaves `merge` (`merged`, `check.fix`, `failed`). Decided under the existing lock (F5). No clock (L2).
  - Removes: leaf-versus-leaf reruns, all of them. Parallel verify contention. Most exposure in F18.
  - Could break: a stuck holder now blocks every other merge in the repo. Today leaves are independent. Needs the wake path from F4. A waiting leaf with a live tab still counts toward `max_active` (`src/next.ts:309-312`), so a long queue can stop new leaves from starting.
  - Invites later: queue order rules (K4), "let me jump the queue" requests, per-repo versus per-remote identity questions.
  - Does not remove: operator commits to main (K3). Wall time stays m times n (PR3): six leaves at 35 minutes is 3.5 hours for the last one, close to what `lane-orphan-check` actually waited (F9).
- K1-O2. Seat-held lock. The merge seat takes a `flock` around fetch to push.
  - Could break: an agent seat runs many tool calls, and a lock cannot span them unless one wrapper command runs the whole fetch, rebase, checks, push sequence. That wrapper is the check runner L1 put Off route. A lock held by a seat that dies between calls is either lost early or held forever.
- K1-O3. Batch (P1). All leaves waiting in `merge` are stacked into one candidate, checks run once on the top, main fast-forwards to it, all leaves land.
  - Removes: reruns and the m times n wait. Six leaves, one 35-minute run.
  - Could break: a red batch has no owner. `skills/merge-issue/SKILL.md:43` sends "the leaf" to `check.fix`, and a batch needs bisection (P1) or a rule for which leaf is ejected. Each leaf's `review-B.md` evidence must name a commit that contains other leaves. `requireTestChangeCitations` (`src/phase.ts:282-309`) reads `<target>..HEAD`, which in a stack includes the leaves below. One seat must own a multi-leaf integration, which no current skill describes. The completion broadcast (`SKILL.md:53`) assumes one merge seat per completion.
  - Invites later: a flaky suite (F18) now fails N leaves at once.
- K1-O4. Speculative train (P4, P5). Each waiting leaf tests on top of the leaves ahead, in parallel.
  - Could break: needs N parallel suites on one machine, which is the contention already observed. A failure ahead restarts everyone behind, so the worst case is today's behavior.
- K1-O5. Keep the race, shrink the cost: check the remote again right before and during the run and abandon early.
  - Could break: watching the remote during a run is polling (L2). It reduces waste and removes none. Fails the ask "avoid that completely".

Slot C view: K1-O1 is the smallest change that removes the class for leaf-versus-leaf. K1-O3 is the only option that also removes the wait, and it can be added later on top of an existing turn (a batch is "the turn holder carries the others"). K1-O2 and K1-O5 guard the fragile part instead of removing it.

### K2. Where does a waiting leaf wait?

Only matters if K1-O1 or K1-O3 is taken.

- K2-O1. Stay in phase `merge`, undispatched, with the order held in state or derived from `issues/log.jsonl` merge-entry time. No new phase. Risk: `akrogon status` shows several leaves "in merge" with no visible reason why only one runs, and stall notices (`src/next.ts:210-228`) must not fire for a seat that was never prompted.
- K2-O2. A new phase before `merge` (queued). Visible in status and log. Costs a routing entry (`src/routing.ts:2-13`), every doc and skill that lists phases, and a migration for leaves already in `merge`.
- K2-O3. The seat is prompted at once and told to wait. Rejected by evidence: a waiting agent must poll (L2), and `SKILL.md:27` says the seat stalls for nothing.

Sub-question: what happens to B's work that needs no turn? Committing scoped changes, the LESSONS line (`SKILL.md:35`) and the trailer `--check` (`SKILL.md:47`) could run while waiting. Splitting the pass in two adds a second prompt per leaf.

### K3. What does a commit that touches only `issues/` do to an in-flight merge?

Present with or without a queue. The operator is a second writer to main (F13, PR5).

- K3-O1. Name the seat's proof as the rule. Reuse is allowed when the tested head and the rebased head are identical outside `issues/`: `git diff --quiet <tested-head> <rebased-head> -- . ':(exclude)issues'`, with the exception that a change to `issues/config.yaml` always forces a rerun because it defines the checks. F6 makes the rebase conflict-free by construction. F12 shows two seats already doing it.
  - Could break: L1 says checks run "before every push" on "the final rebased commit". The pushed commit's code tree is the tested tree, and its hash differs. The operator must say whether tree-equal outside `issues/` satisfies L1. A consumer whose checks read `issues/` (a repo that tests its own lifecycle records) would be wrong under this rule, so the excluded path set may need to be per-repo. `learnings/LESSONS.md` lives outside `issues/` and is operator-committed too (`SKILL.md:35`), so the same question returns for it.
  - Invites later: pressure to widen the exclude list to docs, then to "paths my leaf does not touch". That is K5.
- K3-O2. Stop lifecycle records from moving the code branch: keep `issues/` on its own branch or ref.
  - Removes the cause instead of proving it harmless. Could break: every command reads `issues/` from the registered checkout root (`src/config.ts:86` `readRepo`), charts and briefs are read by seats from that tree, and the operator's `add issues` habit changes. Largest blast radius of any option in this map.
- K3-O3. Rule for the operator: no commits to main while a leaf holds the merge turn. The command could print who holds it.
  - Could break: depends on memory. The seed lists this as today's workaround. With a queue the turn is almost always held during a busy epic, so the operator could never commit.
- K3-O4. Do nothing. With K1-O1 an issues-only commit costs one rerun for the one leaf holding the turn. F13 says such commits arrive about every 40 minutes during an epic (15:16Z, 15:53Z, 16:41Z), which is the length of one run, so a turn holder could lose repeatedly.

Slot C view: K3-O1 with the config exception. It is one git command, the invariant behind it is already enforced (F6), and seats already apply it unprompted (F12).

### K4. Queue order and fairness

Only with K1-O1 or K1-O3.

- K4-O1. First into `merge`, first served, from the timestamp of the move.
- K4-O2. Leaves that unblock dependents first (`blocked-by`, `src/next.ts:607`).
- K4-O3. Re-entry after `check.fix`: back of the queue, or keep the old place.

What each invites: O1 is explainable from the log. O2 shortens epics and makes order depend on a graph the operator must read. For O3, keeping the place lets one slow repair hold the line. Going to the back means the leaf's next run is on a newer main, which is the correct base anyway.

### K5. Path-disjoint reuse beyond `issues/`

F14 shows the six leaves touched different files, and F11 shows no rerun found anything. The tempting step is "main moved only in files my leaf does not touch, so reuse".

- K5-O1. Do not go there. Every source that skips runs requires declared inputs (PR4), L1 already recorded that akrogon lacks them, and textually disjoint changes can still break each other (a renamed export in one file, a new caller in another). `framework:verify` is a whole-repo suite, so every file is its input.
- K5-O2. Let a consumer declare inputs per check.
  - Invites later: wrong declarations that break main with green evidence (P7), plus a schema and docs surface to maintain.

Slot C view: K5-O1. With a turn (K1-O1) there is nothing left for K5 to save, because no leaf lands during another leaf's run.

### K6. How does a fresh worktree get its dependencies?

- K6-O1. A repo config key holding one setup command, run by `ensureWorktree` after `git worktree add` (`src/next.ts:267-274`), next to `linkEnv`.
  - Removes the class for every seat and phase, not just merge. Could break: dispatch now runs a consumer command that can fail or hang, so `ensureWorktree` needs a failure path that names the command and output. The install goes stale when a rebase changes the lockfile, so "once at creation" is not enough (P8 treats a lockfile change as affecting everything). Runs under the global lock unless moved out, which would stall every `akrogon phase` call during a slow install.
  - Invites later: requests for teardown hooks, per-phase setup, caching.
- K6-O2. Skill text: every seat runs the repo's install before its first check.
  - No code. Could break: three skills plus worker briefs must all carry it, and a seat that forgets recreates F15. Guarded, not removed.
- K6-O3. Link `node_modules` from the registered checkout, like `.env` (`src/next.ts:280-303`).
  - Could break: a leaf that changes dependencies would mutate or mis-test a shared folder. Package-manager specific. F15 shows framework fixtures already fight over `node_modules` links (EEXIST, `lane-orphan-check/review-B.md:67`).
- K6-O4. Consumer-owned: the repo makes its own check commands self-sufficient (for example a first `checks` entry that installs with a frozen lockfile). No akrogon change.
  - With a warm cache the install is near free (P9). It also covers the stale-lockfile case because it runs on every check pass. Could break: every new consumer must discover this, and `skills/init-akrogon` would need to propose it. `checks` order is config key order, which nothing documents as a guarantee.
- K6-O5. Placement fix for F8: worktrees outside the registered checkout, so a missing install fails at the first command instead of at merge.
  - Makes the fault loud and early. Does not fix it. Changing `worktree_root` semantics affects existing worktrees (`docs/guide/setup.md:69`).

Slot C view: K6-O1 or K6-O4 remove the class. K6-O4 is the fewest moving parts and handles lockfile drift for free. K6-O1 is the answer if the operator wants akrogon to own it for all consumers. The lockfile-drift question must be answered for O1 before it is chosen.

### K7. What does merge do when the red is the environment, not the code?

F16: a missing install cost check.fix, a full A pass and a re-review, all with an empty diff.

- K7-O1. With K6 solved, leave routing alone. The cold-worktree case no longer occurs.
- K7-O2. Let B repair an environment-only red in place and rerun, with the proof that the head did not change.
  - Could break: "environment-only" becomes a judgment that hides real reds. `red-criterion.md:59-60` chose that red is never waved through.
- K7-O3. Skip re-review when check.fix returns the same head. Mechanical (`head` is already in `issues/log.jsonl`).
  - Could break: check.fix that legitimately changes nothing but should have (A gave up) would go straight back to merge.

Slot C view: K7-O1. Take K7-O3 only if empty-diff rounds keep appearing after K6 lands (F18 is one such case from a different cause).

### K8. Does the turn holder's run survive the harness?

F17 is unexplained. If long suites die at a tool-call timeout, a queue makes it worse: the holder fails, the turn passes, the next leaf dies the same way.

- K8-O1. Establish the SIGTERM cause before or alongside the queue work (check harness tool timeouts against the 10-minute gap in F17).
- K8-O2. Tell the merge seat to run `merge_checks` detached and wait on the result, as later seats did unprompted (`slice-boundary-anchors/review-B.md:137`).
- K8-O3. Treat as separate intake.

Slot C view: K8-O1 as a question for the handoff, because the answer changes whether serial runs complete at all.

## 4. Practitioner questions over the work's lifetime

- Q1. Does "avoid that completely" include the wait, or only the repeated runs? A turn (K1-O1) removes the repeats and keeps the m times n wait (PR3). Only a batch (K1-O3) removes the wait.
- Q2. Does tree-equal outside `issues/` satisfy L1's "final rebased commit"? (K3-O1.)
- Q3. Can any consumer's checks read `issues/`? akrogon tests its own lifecycle. If yes, the exclude rule needs a per-repo switch.
- Q4. Who clears a stuck turn holder? `failed` releases it. A seat that is busy forever does not. Is the existing busy notice (`src/next.ts:215-222`) enough when it now blocks a whole repo?
- Q5. Do hand-built leaves (`src/next.ts:585-588`) and operator code pushes respect the turn? They cannot be forced to. The fast-forward rule at `SKILL.md:49` must stay as the backstop for them.
- Q6. Is the turn per registered repo or per remote and branch? Two leaves in different registered checkouts of one remote would race again. `src/config.ts:118` already refuses multiple registered checkouts for one git common dir, which covers the usual case.
- Q7. Should waiting leaves count toward `max_active`? (`src/next.ts:309-312`.)
- Q8. Should `checks` commands that are subsets of a `merge_checks` command run twice at merge? (F19.) A config matter for framework, not an akrogon rule, and it is 3 of 6 commands per pass.
- Q9. After a turn exists, is line 51's "neither code nor integration changed" still needed, or does K3-O1 replace it? Two reuse rules in one skill will drift.
- Q10. Which docs move together? `docs/guide/merge.md:15` ("If another leaf lands first, B fetches, rebases and checks again"), `docs/guide/problems.md:43`, `docs/guide/limits.md:11`, `docs/guide/phases.md:14`, `docs/guide/setup.md:53-56`. L1's "good enough" reading requires every place a rule lives to change together.

## 5. Pitfalls

- R1. A queue hides a flaky suite's cost less, not more. F18 shows a red with an empty repair. In a queue that leaf goes to the back and everyone behind waits one more run.
- R2. Partial resolution (F8) means a leaf that changes dependencies can pass `checks` against the registered checkout's old packages. Any K6 option must be tested with a leaf that edits the lockfile.
- R3. The lifecycle feeds its own invalidation (F13): merge evidence and `log.jsonl` are written into the tracked `issues/` tree during merge. Any rule keyed on "main unchanged" fails as soon as the operator commits. K3 must be settled even if K1 is.
- R4. `issues/config.yaml` is inside `issues/`. A blanket exclude would let a change to the check list itself ride through unverified.
- R5. `akrogon phase <slug> merged` runs after the push (`SKILL.md:53`). If the turn is released on `merged`, a seat that pushed and then died holds the turn while main has already moved. Release must be recoverable from remote ancestry (`SKILL.md:49` already uses `merge-base --is-ancestor` for lost replies).
- R6. A leaf sent to `check.fix` from merge must release the turn at once. Its repair can take an hour (F16).
- R7. Batching changes the unit of proof. Today each leaf has a `review-B.md` with checks on its own rebased head. Auditors of closed issues will read evidence that names a commit containing other leaves.
- R8. Setup at worktree creation under the global lock (F5, K6-O1) would freeze every seat's `akrogon phase` call for the length of an install.
- R9. A queue removes the natural experiment that proved the rebase is safe. Today every leaf's patch is tested on the exact main it lands on, and that stays true under a turn. It stops being true only if K5 is taken.
- R10. Operator wording says "no conflicts". A turn does not prevent rebase conflicts. It makes them appear once, at the start of the holder's turn, on the final base. `SKILL.md:41` (resolve, record range-diff, then check) stays as is.

## 6. Slot C position in one place

1. K1-O1: a command-owned merge turn per repo, decided under the existing lock, with a wake path like `dispatchDependents`. Leaves `SKILL.md:49` as the backstop.
2. K3-O1: name the issues-only proof as the rule, with `issues/config.yaml` excluded from the exclusion. Needs the operator's ruling on Q2.
3. K6-O4 or K6-O1 for dependencies. Decide after the lockfile-drift question.
4. K5-O1, K7-O1: do not add affected-only reuse or new red routing.
5. Ask Q1 first. If the wait matters as much as the repeats, K1-O3 (batch) is the follow-up, and it builds on the turn.
6. K8-O1: find the SIGTERM cause, because serial 35-minute runs must be able to finish.
