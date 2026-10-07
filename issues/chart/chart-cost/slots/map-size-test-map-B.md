# Blind opening territory map, peer B

Read date: 2026-10-06. Repository snapshot: the supplied wt-B checkout, akrogon as of 2026-10-05. Independent notes, with no other slot's map read. No fork is taken here. These notes identify decisions and dependencies, not implementation options or recommendations.

## Intake and boundaries

Operator ask, verbatim: “merges are causing other leaves that are in the merge process to redo the testing because the main had changed. Come up with an elegant solution to avoid that completely, while making sure everything merges correctly, no conflicts”. Source: Tamdoma/akrogon#57, `issues/seeds/57-leaves-merging-at-the-same-time-each.md:3-16`.

Both reported conditions belong here: competing merges invalidate completed or running integration checks, and fresh worktrees lack dependencies needed by the configured checks. “No conflicts” needs a precise outcome: preserving both changes and testing their combination is possible, but eliminating arbitrary source conflicts is not established by arranging merges. “Avoid completely” also needs a domain: arbitrary uncoordinated writers and changed verification inputs prevent an unconditional promise of one check run forever. F1 establishes the writer boundary before a mechanism is selected.

Carried locks:

- L1. `issues/chart/check-reruns/forks/check-scheduling.md:20-24`: scheduling only was selected, the general check-record runner was excluded. A proves criteria, changed tests and `checks` before review. `merge_checks` run only at merge unless a named criterion needs a whole run. Merge remains the hard gate before every push on final integrated work. This map does not reopen those decisions.
- L2. `issues/chart/leaf-run-stalls/forks/red-criterion.md:32-38`: criteria that cannot pass within owned scope stop rather than passing as “pre-existing”. The stale base-probe approach was rejected. Check-scheduling supersedes the older requirement to put every broad criterion in `checks`, while retaining its green-main reason.
- L3. `red-criterion.md:8-12` also carries no clocks, watchdogs or polling, and handed-off contract changes are new intake. These are recorded constraints on any recovery contract, not permission to invent a timeout-driven queue.

All repo citations below are relative to wt-B. `E/` means the supplied copied evidence at `../framework-evidence/`, not a live framework checkout. In leaf citations, `E/.../<leaf>/` expands to `E/issues/open/skill-rewrite-tooling/<leaf>/`. Paths printed inside copied logs were treated as text and never followed. No akrogon or gh command was run.

## What the inspected evidence establishes

- E1. Push contention is confirmed beyond folder-name inference. `E/issues/open/skill-rewrite-tooling/spec-mutation-anchors/merge-evidence/rebased-1e53697b4/results.jsonl:1-8` records all five checks, full verify and trailer gate green, followed by push exit 1. Its `push.log:1-7` explicitly reports non-fast-forward rejection. `rebased-fee844f58/results.jsonl:1-8` and `push.log:1-7` show another instance. This makes coordination before expensive verification a real territory, rather than merely reducing repeated prose instructions.
- E2. Several green integration runs became unusable for competing code merges. `E/.../lane-orphan-check/review-B.md:81-128` records unchanged leaf patches, new bases, four non-fast-forward rejections and repeated full checks. The `rebased-4/results.txt:1-6` records green commands. The review records framework core durations around 1,830–1,848 seconds. `E/.../spec-mutation-anchors/review-B.md:92-113` independently records the same sequence of other leaves landing.
- E3. The broad claim that record-only changes always caused full reruns is not supported by these seats' final behavior. `E/.../spec-mutation-anchors/review-B.md:113-126` records an issues-only target advance, unchanged non-issues diff and successful evidence reuse before fast-forward push. `E/.../size-fixture-boundary/review-B.md:119-122` records an issues-and-learnings advance, unchanged code-tree evidence, reuse of full checks and rerunning short checks. Record-only pushes still caused push rejection and rebase work. Their handling was judgment-based and differed between seats.
- E4. Missing dependencies caused real merge repair round trips without source changes. `E/.../lane-orphan-check/review-B.md:49-77` records absent node_modules, unresolved markdown-it, subsequent frozen installation, unchanged head and a completed successful verification. Its raw `implementation/merge-evidence/merge-verify.log:3869` and `:6652` show the import errors. `E/.../render-ready-loud/review-B.md:107-161` records the same import failure, installation with no manifest/lock/source changes and separate successful proofs for the other failures. `E/.../size-fixture-boundary/review-B.md:91-107` confirms unchanged-head environment repair and a later frozen install.
- E5. The config distinction was already active. `E/issues/config.yaml:7-14` puts hooks and contracts in `checks`, framework:verify in `merge_checks`. The local akrogon config has four checks, including `--changed="$AKROGON_BASE"`, at `issues/config.yaml:7-11`. Nothing here proves a consumer check ignores issue records or Git history.
- E6. Lifecycle overlap is recorded. `E/issues/log.jsonl:1571-1579` places emitter-crosscheck, render-ready-loud, size-fixture-boundary, lane-orphan-check and spec-mutation-anchors in merge during overlapping periods. Completion entries at `:1580`, `:1583`, `:1584`, `:1590` establish several subsequent main advances. No copied context-acceptance leaf review/evidence folder was found, although its transitions exist at `:1561-1563`. Its dependency-failure details remain intake testimony.

## Open forks and their order

F1 comes first because it determines the scope of the guarantee. F2 defines the thing being integrated. F3 defines what counts as valid proof for that thing, including record-only advances. F4 and F5 settle ownership and unsuccessful progress. F6 settles whether the requested latency also includes shared-machine contention. F7 and F8 form a second branch: preparation ownership first, then preparation validity over time. They can be researched independently of merge ordering, but their evidence/failure contracts must agree with F3 and F5 before handoff.

### F1. Who owns every advance of the target branch?

**Decision:** Which writers must participate in the merge guarantee, and how far does that authority extend across repository, target branch, machine and manual entry points?

**Why it changes the outcome:** Preventing two merge seats from checking against the same old main does not prevent an operator or issue sync from advancing it during a run. An absolute guarantee about target stability depends on writer participation, not the number of agent tabs.

**Inspected evidence:** `skills/merge-issue/SKILL.md:37-51` leaves fetch/rebase/check/push to B and uses non-fast-forward refusal as serialization. `src/next.ts:774-861` and `src/phase.ts:329-334` use a global command lock for bounded dispatch and phase actions, not the whole agent-run merge interval. `src/state.ts:139-158` defines its flock lifetime. `src/sync.ts:9`, `:116-136` uses that lock but also commits eligible issues and pushes main. `docs/guide/files.md:31-56` explicitly promises issue publication from the registered checkout. `src/config.ts:28-31`, `:100-119`, `:144-149` distinguish configured target from shared Git repository identity.

**Lifetime pitfalls owned here:** P1. Treating a local coordination boundary as remote exclusion leaves another machine or direct Git writer free to invalidate checks. P2. Treating ordinary issues publication as harmless bypass leaves a known writer outside the guarantee. P3. Target configuration or remote aliases can change while work is waiting, splitting authority for the same branch or confusing separate branches. P4. Extending the current global lock across slow checks can block unrelated repos and nested phase calls that need the same lock. These are different consequences of where writer authority lives, not solved by lowering max_active.

**Practitioner questions:** Q1. Is “completely” about akrogon-owned merges only, or every main writer including sync and operator pushes? Q2. Is this a single-host product guarantee or a guarantee across hosts? Q3. What may an urgent manual push do to in-flight validation?

**Outside fact changing this fork:** GitLab documents immediate merges invalidating train work (S4), and GitHub documents queue reordering rebuilding in-progress work (S3). Thus bypass and emergency behavior belong in the scope decision now, not as a surprise after implementation.

### F2. What is the unit of integration and proof?

**Decision:** What exact integrated candidate is admitted and checked, and how its successful result maps to each leaf's landing and completion?

**Why it changes the outcome:** Independent green leaf checks do not prove the leaves work together. The unit also determines whether one failure invalidates evidence for other leaves, which commit history lands and which leaf can honestly claim merged.

**Inspected evidence:** `skills/merge-issue/SKILL.md:10`, `:37-53` defines an individual leaf worktree, rebase and push. `src/routing.ts:32-36` routes reviewed leaves independently to merge. `src/phase.ts:146-180` completes an issue/epic only from individually merged states. `src/phase.ts:274-279` forbids leaf branch changes under issues. Copied green-then-rejected evidence E1/E2 shows the current unit does not include later landing leaves.

**Lifetime pitfalls owned here:** P5. Two patches can apply cleanly and still break behavior together. P6. If proof covers several leaves, partial landing, removal or changed membership must not leave a leaf credited for a candidate that no longer exists. P7. Completion/broadcast ownership must remain truthful even if integration and proof no longer operate one leaf at a time.

**Practitioner questions:** Q4. Is an intermediate main state between each leaf required to pass all checks, or is only a combined landing state exposed? Q5. Does one leaf need independent attribution and recovery when its neighbor fails? Q6. What changes to reviewed patches require renewed review rather than integration-only evidence?

**Outside fact changing this fork:** The bors team's semantic-conflict example (S2) makes “clean Git merge” insufficient. Jane Street's first-hand experience (S1) makes proof unit and linear merge throughput distinct questions. No choice of batching, serial work or speculative work is made here.

### F3. What makes previous verification valid for the final candidate?

**Decision:** Define the identity and lifetime of successful evidence, including what a target change limited to issues records actually changes for configured commands.

**Why it changes the outcome:** This decides whether record-only main advances require new full runs, whether reuse complies with the final integration gate, and what invalidates evidence after source, command, base, dependency or environment changes. It cannot be answered by asserting every path under issues is inert.

**Inspected evidence:** `skills/merge-issue/SKILL.md:37`, `:47-51` requires refreshed base, all checks, trailer gate and fast-forward push, with reuse only if code and integration are unchanged. L1 retains the final gate. `src/config.ts:35-37` stores arbitrary command strings without declared inputs. `src/config.ts:86-92` loads authoritative `issues/config.yaml`, itself inside the reportedly inert directory. `issues/config.yaml:11` and `src/config.ts:148-164` make Git base a command input. `E/.../render-ready-loud/review-B.md:109-111` records a shared origin/main ref changing during a check without changing its worktree HEAD. E3 shows existing, inconsistent reuse judgments.

**Lifetime pitfalls owned here:** P8. An issues-only config edit changes the verification contract despite leaving application files unchanged. P9. A Git-history-sensitive check can observe a new base even with identical source trees. P10. Another worktree fetch can change shared refs while a command is running. P11. A shared .env target, external service or tool version can change without a source commit. P12. Evidence without a completed successful exit cannot become green by inspecting a promising log tail. Shared-input validity belongs here, while installed-dependency refresh belongs to F8.

**Practitioner questions:** Q7. Which checks read issue data, config, Git refs/history or outside state? Q8. Does the final-commit lock permit reuse when relevant inputs are equivalent but SHA differs, as the current skill exception suggests? Q9. What evidence would make that equivalence reviewable without reviving the excluded general runner? If a new reusable-record system becomes necessary, that is an explicit scope change to L1, not an assumed choice.

**Outside facts changing this fork:** Git documents shared refs and per-worktree HEAD (S6). Bazel's own caching limitations show why missing tool/environment inputs matter (S7). These establish validity traps, not a proposal to add affected-only execution or a cache.

### F4. What owns waiting, admission and recovery over the entire merge lifetime?

**Decision:** Define when a reviewed leaf owns a merge attempt, when that ownership ends and what advances waiting leaves after each relevant event.

**Why it changes the outcome:** A coordination mechanism that prevents duplicate work can still strand the next leaf, starve it or permit two active owners after restart. “Phase is merge”, “B is running” and “candidate is admitted” are not currently separate recorded facts.

**Inspected evidence:** `src/routing.ts:35` has merge and its exits, with no separate waiting phase. `src/next.ts:589-628` dispatches each eligible leaf. `src/next.ts:674-692` sweeps and starts explicit dependents. Hook handling at `:835-842` redispatches the event's owner, while `:801-812` resumes allocated work. `docs/guide/next.md:38-40`, `:86-100` says completion starts only dependents and unrelated work waits for manual dispatch. `src/phase.ts:113-137` commits phase state before later diagnostics and completion can fail. `skills/merge-issue/SKILL.md:25`, `:49`, `:53-57` covers resumed merges, lost push replies, completion and cleanup.

**Lifetime pitfalls owned here:** P13. Releasing ownership while an old detached check/push process remains alive permits two attempts. P14. Crashing after successful push but before merged state can lead to duplicate work or false recovery unless remote ancestry is reconciled. P15. A waiting leaf with a live tab must not reserve progress forever simply because allocation exists. P16. Existing targeted hooks will not automatically wake an unrelated waiter. P17. Cleanup or owner-folder moves can remove records needed by a recovering candidate.

**Practitioner questions:** Q10. What event makes the next waiting merge runnable? Q11. What proves a former owner has stopped before another takes over? Q12. What order must survive retries, failure, parking or operator recovery? Urgent reordering is a real invalidation event under S3, so its contract belongs here.

### F5. Who handles conflicts and unsuccessful validation without unnecessary repair rounds?

**Decision:** Define which outcomes are integration work, preparation failure, code repair, incomplete verification or an operator blocker, and how each affects other waiting candidates.

**Why it changes the outcome:** Missing packages and terminated checks currently return to A despite no code change. A source conflict may legitimately need edits and new proof. These cannot be collapsed into a successful retry or suppressed to meet the one-run goal.

**Inspected evidence:** `skills/merge-issue/SKILL.md:27`, `:41-45`, `:49-51` distinguishes operator blocks, conflict resolution, red checks and other push errors. `src/routing.ts:34-35` makes a merge red route through check.fix and review. `src/phase.ts:125`, `:252-255` increments/caps handoffs from check.repair, not direct merge-to-check.fix moves. Thus the configured cap does not bound repeated environment-driven merge repair loops. `E/.../spec-mutation-anchors/review-B.md:59-88` records SIGTERM and unchanged-head repair proof, explicitly with unknown termination origin. E4 records dependency-only repairs.

**Lifetime pitfalls owned here:** P18. Removing retries by accepting stale proof breaks the carried gate. P19. Repeated infrastructure/environment handoffs can circulate without a code repair or cap. P20. Failed or removed earlier candidates can invalidate downstream integrated work. P21. Syntactic conflict resolution can change reviewed behavior, so no-conflict promises must not conceal unreviewed resolutions. P22. A killed run is incomplete, not a passing run or evidence of a base defect.

**Practitioner questions:** Q13. Which failures can the integration owner resolve in its existing pass, and which genuinely need A or the operator? Q14. What must happen to later candidates when an earlier candidate changes or leaves? Q15. What does “no conflicts” require for arbitrary overlapping edits?

**Outside fact changing this fork:** GitLab and Zuul explicitly invalidate work depending on failed candidates (S4/S5). A universal no-rerun guarantee therefore depends on what failures and changed membership it covers.

### F6. What resource contention does the requested outcome include?

**Decision:** Is the intended guarantee only about merge-induced invalidation, or also about slow verification competing with other implementation, review, install and merge work on the same machine?

**Why it changes the outcome:** Preventing stale successful merge runs does not establish a 40-minute completion target if unrelated suites still compete for CPUs, browser fixtures or services. Conversely a global leaf limit changes all development concurrency, not just merge work.

**Inspected evidence:** `src/config.ts:13-19` defines global max_active. `src/next.ts:305-338` counts active leaves and applies the limit only when allocating a new tab. Existing tabs continue progressing. `docs/guide/next.md:90-94` explains this is not agent-process capacity. `skills/implement-issue/SKILL.md:40-43` already distinguishes safe overlap and shared resources. The nine simultaneous verify processes and quiet-machine timing are reported in the seed at `:9-14`, not measured by this pass.

**Lifetime pitfalls owned here:** P23. Merge scheduling can leave non-merge suites competing for the same resources. P24. A global throttle can unnecessarily stop unrelated repositories while still allowing many subprocesses inside one admitted leaf. P25. Shared fixture/resource collisions can produce failures that look like code defects. Copied size-fixture-boundary review `:99` labels load-based attribution as inference.

**Practitioner questions:** Q16. What process/resource boundary must remain uncontended for the requested latency? Q17. Is there a latency or throughput requirement beyond eliminating redundant integration runs? S5 establishes resource windows as a separate concern, without selecting a resource policy here.

### F7. Who prepares a fresh worktree before its first dependency-consuming command?

**Decision:** Define the preparation contract, its owner and earliest required point, including whether it covers leaf, delegated-worker and detached-base worktrees.

**Why it changes the outcome:** A freshly created checkout is not a runnable project environment. A prep step that exists only after the first red merge check retains the reported wasted round trip. Installing akrogon itself is not installing each consumer worktree.

**Inspected evidence:** `src/next.ts:245-277` creates or validates the leaf worktree, links .env and records it, with no dependency preparation. `src/next.ts:338`, `:625-628` places this inside allocation before prompts. `src/config.ts:28-49` is strict and has no setup field. `docs/guide/setup.md:35-39` explicitly says tooling selection does not install its runner. `skills/implement-issue/worker-protocol.md:11` already assigns installation to delegated workers, and `skills/implement-issue/SKILL.md:38` requires dependencies in detached baseline probes. E4 establishes missing leaf installation rather than missing declarations.

**Lifetime pitfalls owned here:** P26. Preparing only the main checkout leaves fresh leaves broken. P27. Preparing only leaves leaves worker/base probes materially different. P28. Generic consumer commands may install more than Bun packages or require private registry access. P29. Setup inside the global dispatch lock can make slow network work stop every other command. P30. A partial setup must not leave state that later dispatch treats as ready. F5 owns failure routing, F7 owns when readiness is earned.

**Practitioner questions:** Q18. Which project preparation command and inputs are authoritative, and who owns them? Q19. Which worktree types are in scope for the runnable-environment promise? Q20. What observable result distinguishes prepared from merely allocated?

**Outside fact changing this fork:** Bun's documented install executes project lifecycle scripts and may execute trusted dependency scripts (S8). Therefore installation has effects and prerequisites beyond the existence of node_modules. This must shape ownership before a generic setup contract is designed.

### F8. When does installed preparation stop being valid?

**Decision:** Define when a retained worktree's prepared environment must be refreshed after integration, repair, manifest/lock/tool configuration changes or interrupted installation.

**Why it changes the outcome:** One installation on worktree creation can solve today's missing package while leaving tomorrow's rebase running old dependencies. Copying a success marker or finding a node_modules directory does not establish it matches the candidate being tested.

**Inspected evidence:** `src/next.ts:251-277` reuses existing worktrees. `skills/merge-issue/SKILL.md:37-51` repeatedly rebases after integration changes. `E/.../render-ready-loud/review-B.md:165` and `E/.../size-fixture-boundary/review-B.md:107` explicitly install frozen dependencies after rebase. `src/next.ts:280-302` shares the registered checkout's .env through a symlink, while `:652-659` defers removal of completed worktrees until owner records have moved.

**Lifetime pitfalls owned here:** P31. A dependency-changing predecessor can invalidate the successor's earlier installation. P32. Shared mutable installed directories couple worktrees with different dependency revisions. P33. Frozen dependency resolution is not proof of identical native build products, tool versions, lifecycle-script effects or outside environment. P34. Interrupted setup or removed local packages can make a once-prepared worktree unready without a manifest change. These traps must be covered without assuming a general cache or automatic fallback.

**Practitioner questions:** Q21. Which candidate inputs define preparation validity? Q22. What happens after partial setup, worktree reuse and dependency-changing integration? Q23. How is equivalent material preparation established for leaf versus detached-base diagnosis? S8 verifies the frozen-lock semantics, not reproducibility of every external effect.

## Outside research used to establish forks, scope and lifetime traps

All sources below were read 2026-10-06. They establish decision territory only. Option research and comparison wait for the owning fork's round.

- S1. Practitioner: Yaron Minsky, Jane Street, [Making “never break the build” scale](https://blog.janestreet.com/making-never-break-the-build-scale/), published 2014-07-06. First-hand build-bot experience shows that independently testing against one tip does not allow several successful candidates to land unchanged. Sequential integration also imposes throughput limits. This separates F2's proof unit from F6's capacity requirement and retains the pre-integration green gate.
- S2. Practitioner: bors-ng team, [About semantic conflicts](https://bors.tech/essay/2017/02/02/pitch/), published 2017-02-02. Individually passing changes may break their combination without a text conflict. This limits the meaning of “no conflicts” in F2/F5.
- S3. Primary: GitHub engineering/product documentation, [Managing a merge queue](https://docs.github.com/en/enterprise-cloud@latest/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue). Required checks run on integrated merge-group candidates, with CI-specific triggers. Reordering rebuilds in-progress work. This establishes F2/F3 candidate identity and F4 reordering consequences. It does not establish that this direct-push product should adopt PRs, provider CI or GitHub hosting.
- S4. Primary: GitLab team, [Merge trains](https://docs.gitlab.com/ci/pipelines/merge_trains/). Candidates include predecessors. A failing or removed predecessor restarts later pipelines, and immediate merges interrupt train work. This establishes F1 bypass scope and F5 invalidation over the lifetime of work. Availability and provider setup were not evaluated.
- S5. Primary practitioner-maintained system documentation: Zuul team, [Project gating](https://zuul-ci.org/docs/zuul/latest/gating.html). Correct gating checks integration order. Failed assumptions invalidate downstream jobs, and parallel work consumes resources even when eventually discarded. This establishes F5 recovery and F6 resource scope, not a proposed speculative system.
- S6. Primary: Git maintainers, [git-worktree manual, Refs and Details](https://git-scm.com/docs/git-worktree). HEAD is per worktree, remote tracking refs are shared. This establishes F3's moving-ref lifetime trap. A worktree lock prevents pruning, which is a different responsibility from protecting target-branch integration.
- S7. Primary: Bazel team, [Remote caching, Known issues](https://bazel.build/remote/caching). Changes during builds and untracked tool/environment differences can invalidate reuse assumptions. This establishes F3's input-boundary question. No affected-only or cache design is proposed.
- S8. Primary: Bun team, [bun install](https://bun.sh/docs/pm/cli/install). Frozen installation uses locked versions and refuses manifest/lock disagreement. Installation also runs project lifecycle scripts and trusted dependency scripts. These establish F7's execution-effects boundary and F8's refresh question. The current online docs are not proof of the exact installed Bun version on 2026-10-05.

Practitioner synthesis: Jane Street and bors establish the common requirement to prove combined changes before exposing them. GitHub, GitLab and Zuul expose lifetime consequences when an integration order changes. They do not support a blanket promise of no rechecks after arbitrary predecessor failures or outside writes. The facts shape F1–F5 before researching mechanisms. Resource limits and equivalent check inputs remain separate decisions.

## Fog and measurements not made

- G1. The actual writer inventory is unknown: direct operator Git, sync, other hosts, automation, branch protections and bypass permissions were not measured. F1 is answerable as a policy decision, but its eventual enforcement proof needs this inventory.
- G2. No Git history or process sample was supplied for the exact three operator “add issues” commits, so their timestamps, full changed paths and causal relation to each run remain seed claims. E3 proves at least two record-only advances and reuse judgments. It does not prove every metadata push is safe for every configured command.
- G3. No check input audit was performed. The copied config declares command strings, not which files, Git refs, environment, services or tools each reads. Consumer package manifests, lockfiles and framework verification implementation are outside the copied surfaces. Their dependency declarations are established here by review testimony and repair results, not independently parsed source.
- G4. Nine concurrent verifies, quiet-machine wall time, CPU/memory pressure, resource collisions and the N-squared growth estimate were not independently measured. E2 confirms repeated ~30-minute core runs, not a scaling benchmark or exclusive cause of latency.
- G5. The cause of SIGTERM is still unknown. No agent session or prohibited session directory was inspected. No claim ties process termination to merge contention. Incomplete verification remains a distinct outcome under F5.
- G6. A context-acceptance evidence folder was absent from this copy. Its lifecycle events are present, but its claimed installation failure cannot be inspected here. Lane-orphan-check, render-ready-loud and size-fixture-boundary independently establish the condition without it.
- G7. No crash/restart, lost-reply, cross-host ownership, simultaneous sync, dependency-changing rebase or fresh-worktree experiment was run. These are lifetime scenarios requiring proof after the relevant forks settle, not established behavior of a proposed solution.
- G8. No latency/throughput target, rejection frequency, acceptable waiting time or urgency policy is supplied. “About once” in the seed and “avoid completely” in the operator ask are not identical acceptance criteria. F1/F5 define the repeat domain, F6 defines performance scope.

## Off route and next handoff boundary

This pass does not change code, create charts/leaves, reopen the general check-record runner, move full checks back into review, redesign test suites, introduce provider merge services or fix framework test failures. Those are not automatic consequences of the intake. The work may need changes to sync because it is an inspected target writer, but F1 must first establish its participation.

The merge and worktree-preparation outcomes are separately observable. An integration change does not inherently depend on shipping setup first, and setup does not inherently depend on choosing merge ordering. Their contracts must meet at candidate validity and unsuccessful-run handling. Only the selected architecture can justify concrete leaf dependencies.

Most consequential next fork: F1, the authority over target writers. Without its answer, neither a complete no-rerun promise nor an honest lifetime contract can be written.
