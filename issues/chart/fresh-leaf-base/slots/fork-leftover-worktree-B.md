# Fork notes: leftover-worktree, slot B

## Q1. Under the gate, with the leftover worktree clean (or only the branch left), how does the leaf start from the tracking ref?

### Pick: a — remove and recreate

Reason: the recreation path trusts exactly one fact about the leftover — that its tree is clean — and nothing else. Everything else about the leftover is destroyed and rebuilt through the same `createSparseWorktree` every first allocation already uses: sparse config, checkout state, branch attachment, HEAD position. Probes show the fast-forward alternative cannot offer this: `git merge --ff-only` in a worktree whose HEAD is detached (or attached to the wrong branch) advances HEAD but not the branch (P8), so 1b must first check HEAD's symbolic ref and then decide what to do when it mismatches — a third path on top of its two. 1a has one path whose only branch-level variation is `-b` versus `-B`, and probing confirms `git worktree add -B` refuses while the branch is still checked out in the old worktree but succeeds the moment the old worktree is removed (P7b, P11), so the remove-first order makes the branch available in both sub-cases (worktree exists; only the branch left) with no extra logic.

Reason two: probed git behavior removes 1a's apparent obstacles. `git worktree remove` without `--force` succeeds on a porcelain-clean tree even when ignored files (`.env`, `node_modules/`, `*.log`) and empty untracked directories are present (P1, P9, P10). The files it silently deletes in that case are exactly the ones that must not survive anyway: `.env` is rewritten by `writeLeafEnv` on every allocation, and `node_modules` is rebuildable. Untracked and modified files block the removal with a fatal error (P2, P3), which is the correct hand-off to Q2's refusal: the removal failing is the signal, not a problem.

Cost: ignored build state (node_modules and any other ignored artifacts) is destroyed, so the seat's first install runs again. Low in this ecosystem (bun's global cache), and the path is rare: it fires only for a leaf whose earlier attempt left a worktree without producing a single commit. Accepted because correctness here should not depend on any state inside the leftover.

### Rejected

- b (fast-forward in place). Keeps node_modules and is one operation, but its result depends on the leftover's internal git state. Probed: a detached or wrong-branch HEAD silently absorbs the fast-forward while `refs/heads/<slug>` stays behind (P8), and the leaf then builds on the stale branch. Guarding that means a symbolic-ref check plus a recovery branch, at which point b has more paths than a and still trusts more leftover state. Also probed: in a sparse worktree an untracked file colliding with a merge-added file does not block the fast-forward — git warns and leaves the untracked file in place over the tracked path (P6c) — so ff-in-place is not even internally clean when the tree is imperfect. b's branch-only sub-case is fine in itself, but it is identical to what a does there anyway, so it is not a reason to pick b.

### Evidence

- P1/P9 (practitioner, probe in /tmp/wt-probe, 2026-11-25, git 2.56.1): `git worktree remove <path>` exit 0 on a porcelain-clean worktree holding ignored `.env`, `x.log` and `node_modules/`; the files are deleted with the tree. Empty untracked dirs likewise do not block (P10).
- P2/P3 (practitioner, probe, 2026-11-25): same command exit 128 `fatal: '<path>' contains modified or untracked files, use --force to delete it` for one untracked file or one modified tracked file.
- P5b (practitioner, probe, 2026-11-25): `git merge --ff-only` in a clean sparse worktree fast-forwards HEAD and the checked-out branch together; ignored `.env` survives.
- P6b/P6c (practitioner, probe, 2026-11-25): ff-only is not a dirtiness check — it succeeds with dirty files the merge does not touch, and in a sparse worktree it does not refuse an untracked collision (warning + file left in place). In a non-sparse worktree the same collision is refused (`untracked working tree files would be overwritten`).
- P7a/P7b/P11 (practitioner, probe, 2026-11-25): `git worktree add -b <slug>` fails when the branch exists (`a branch named '<slug>' already exists`); `-B` additionally fails while the branch is checked out in another worktree (`'<slug>' is already used by worktree at ...`) and succeeds immediately after that worktree is removed.
- P8 (practitioner, probe, 2026-11-25): with HEAD detached, `git merge --ff-only` advances the detached HEAD; the branch does not move.
- `src/next.ts:createSparseWorktree` (practitioner, code read 2026-11-25): the existing creation path is `git worktree add --no-checkout [-b <branch>] <path> <ref>` plus sparse set plus checkout, with `--force` removal cleanup on failure. It creates with `-b` only when the branch is missing; the gate's branch-exists case needs `-B` or a prior branch delete (`git branch -d` succeeds on a commit-free branch since it is merged, P12).
- `src/next.ts:ensureWorktree` (practitioner, code read 2026-11-25): today the path-exists branch only validates worktree root and common dir; nothing inspects HEAD or the branch's relationship to the tracking ref. Adoption of a branch with its own commits must keep working for the direct route (skills/chart-issues/assets/direct-route.md "Growth stop": the handoff relies on `ensureWorktree` adopting the worktree as-is).
- `src/reconcile.ts:removeWorktree`/`worktreeRemovable` (practitioner, code read 2026-11-25): the sweep already uses porcelain emptiness as the cleanliness verdict and removes with `--force` only for scratch kinds; consistent with the porcelain-based clean/dirty line this answer uses.

### Pitfalls and what removes each

1. `-B` resetting a branch that has its own commits — data loss. Removed by the gate itself: branch commit-freedom is checked before any of this runs (`git merge-base --is-ancestor refs/heads/<slug> <trackingRef>`), and a branch with commits takes today's adoption path untouched.
2. `-B` failing because the branch is still checked out in the leftover worktree. Removed by ordering: remove the worktree first, then create (P7b/P11).
3. The removal failing on a dirty tree mid-allocation, leaving nothing created. This is the intended interlock with Q2: under 2a the dirtiness check fires before any removal, so the removal only ever runs on a porcelain-clean tree, where the only probed failure cause left is a git-level error the operator must fix anyway.
4. Recreation destroying uncommitted-but-ignored work that is neither `.env` nor rebuildable (e.g. an ignored scratch script). Not fully removable without violating signpost 3a; bounded because the tree was porcelain-clean, meaning git itself considered nothing worth committing, and the same destruction already happens when reconcile removes any finished leaf's worktree (low confidence this is complete — an ignored file can hold real work; it is accepted by the existing system everywhere else).
5. Crash between remove and create. Self-healing: next allocation finds no path and takes the creation path, converging to the same end state.
6. Sparse-merge weirdness (P6c) — irrelevant under this pick because no merge ever runs in the leftover; the tree is recreated. Listed only because it infects any future temptation to revive 1b.

### Questions the fork does not ask

- Where exactly is the porcelain check run: inside `ensureWorktree` before the remove, or is the removal attempt itself the check? Recommendation: check first and refuse with the file list, because the error must name the files (Q2) and `git worktree remove`'s fatal message does not enumerate them.
- Does the gate's commit-freedom test use the local tracking ref read before or after the check — i.e. a branch that is commit-free against a stale ref but not against a fresh one? Under Q3-a this is accepted as part of the named residual, but it should be a conscious acceptance.

## Q2. Under the gate, the leftover worktree holds modified or untracked files. What happens?

### Pick: a — refuse loudly at allocation

Reason: it is the only option consistent with how the rest of the system already treats uncommitted content. `src/reconcile.ts:worktreeRemovable` vetoes removal of any finished leaf's worktree on exactly the same condition — non-empty `git status --porcelain` — and records it as a keep entry surfacing in `akrogon leftovers` (`src/leftovers.ts`). The system-wide judgement already made is: uncommitted files are potentially irreproducible human work, and no automated pass may destroy them. A dirty leftover inside the gate is the same object in a different place; destroying it after saving a diff (b) contradicts that judgement because a diff record cannot capture the leftover faithfully (untracked binaries, ignored files, empty dirs, file modes), and carrying it forward (c) is the reported bug itself — silent contamination of the new attempt with unattributed files.

Reason two, operator frame: "Full autopilot. Don't ask me anything" favors the option where the machine never has to ask what to do with the files, and never silently decides either. Refusal is the only option that neither asks nor decides: the leaf cannot start, the error names path, files and removal step, and the same dirt keeps the worktree permanently visible in the reconcile keep-report. b is not more autopilot — it is a silent decision to discard work, with a partial backup.

Cost: a leaf in this state stalls until a human removes or commits the files. This is real (B's original objection in the opening map stands) but bounded: the state is rare (a withdrawn attempt that left edits), the fix is one command, and the alternative costs are silent contamination or silent destruction, both worse under the operator's stated simplicity-and-clarity frame because both produce systems nobody can reason about after the fact.

### Rejected

- b (save the diff, reset, continue). Violates signpost 3a (no new record kinds; there is no existing record shaped for a tree snapshot, and a diff does not capture untracked binary or ignored content). Worse, it destroys state reconcile explicitly preserves everywhere else, creating two contradictory rules for the same object. Its only advantage — no stall — is bought with irreversibility.
- c (carry the files into the new attempt). This is the incident: four unattributed uncommitted test edits sat in the new attempt with no record, one conflicted on the manual repair. It keeps the failure class.

### Evidence

- INTAKE.md "Source: Tamdoma/akrogon#156" (operator-tier intake, read 2026-11-25): four files held uncommitted test edits from the earlier withdrawn attempt; the recovering seat had to save the diff by hand and rewrite one conflicting file.
- `src/reconcile.ts:worktreeRemovable` (practitioner, code read 2026-11-25): `git status --porcelain` non-empty → keep with reason 'uncommitted changes', clears text telling the operator to save changes. The same refusal logic the pick proposes for allocation already exists for teardown.
- `src/leftovers.ts` (practitioner, code read 2026-11-25): kept entries that are not in-use surface in the operator-facing `akrogon leftovers` listing; a dirty leftover is visible there independent of the leaf's dispatch errors.
- P2/P3 (practitioner, probe, 2026-11-25): git itself refuses to remove such a worktree without `--force`; the pick aligns allocation with git's own protection instead of overriding it.
- Signposts "## Taken" 3a and the operator door message in INTAKE.md "Source: operator door message 2026-11-24" (operator tier, 2026-11-24): no new record kinds; full autopilot; simplicity, clarity, elegance.
- learnings/history/2026-11-24-leaf-worktree-stale-base.md section "## Learning" (practitioner, read 2026-11-25): "leftover uncommitted files from an abandoned attempt then sit in the new attempt's tree without any record" — names c as part of the failure.

### Pitfalls and what removes each

1. The refusal is not loud in practice: `dispatchLeaf` catches the throw and reports one JSON line on the pass's stderr, and automatic passes run from `akrogon listen` where stderr is journal output nobody watches (src/next.ts:report, src/listen.ts — the listener, not interactive output, drives passes). Partly removed by what already exists: the dirty worktree is a permanent reconcile keep entry shown by `akrogon leftovers`, and every pass re-raises the error rather than swallowing it once. Not fully removed — whether a notice is warranted is a system-wide allocation-error question, listed below.
2. The refusal repeats forever with no escalation and consumes no attempt budget, unlike seat failures. Accepted today for the existing `ensureWorktree` throws ("Not a worktree root", "Unrelated worktree"), so this is a pre-existing shape, not a new one; if it is wrong, it is wrong for all of them together.
3. The error must actually name the files: `git status --porcelain` output is the list, and the removal step is `git worktree remove --force <path>` after inspection. Removed by writing the refusal message against porcelain output rather than relying on git's fatal text, which does not enumerate files (probed P2).
4. A dirty leftover that also fails the gate (branch has commits) takes the adoption path and keeps its files — the refusal must live strictly inside the gate. Removed by ordering the checks: gate first, dirtiness second.
5. Reboot-or-crash timing: a seat that dies mid-work leaves a dirty tree; if that leaf is later withdrawn and re-handed commit-free, the refusal blocks work the operator may consider clearly worthless. Accepted cost — the machine cannot distinguish worthless from precious uncommitted work, which is the entire premise of reconcile's veto.

### Questions the fork does not ask

- Should allocation refusals of this kind (operator action required, no retry value) produce an hc notice the way blocked and failed leaves do, instead of stderr alone? This generalizes beyond this leaf: "Unrelated worktree" has the same visibility problem.
- Is withdraw — the verb the intake could not find and the map confirms does not exist — itself the missing mechanism? If abandoning a leaf had a teardown path that removes commit-free worktrees after operator confirmation, most dirty leftovers would never exist. Out of scope here, but it is the upstream half of the failure class.

## Q3. Does the first allocation fetch the remote before reading the tracking ref?

### Pick: a — no fetch, name the staleness residual

Reason: the dependency invariant this chart actually needs is already closed without a fetch. The leaf base must hold what the design says has merged, and anything akrogon itself merges lands through a lane that fetches first: `mergeTurn` runs `git fetch` before building each batch and `finishPush` fetches before confirming the push (`src/next.ts` mergeTurn, `src/phase.ts:finishPush`), so by the time a dependency leaf is `merged`, the local tracking ref already holds its commits. A first allocation that starts from the local ref therefore always holds akrogon-merged dependencies. What a fetch would add covers only content pushed outside akrogon's lanes — operator pushes, other machines, other tools — and even there it covers it only up to the fetch instant: a push one second later reproduces the same miss. The class "base behind origin by some epsilon" cannot be removed, only shrunk, and in this system it is already small for the case that matters.

Reason two, cost: the fetch is not free of failure-shape consequences. Placed in allocation it either hard-fails the allocation when the network is down — a new failure mode for a path that today is purely local in the reuse case — or warns and continues, in which case it is a soft step whose absence of effect is silent, the exact shape signpost 1a argues against adding. Meanwhile creation already pays a network proof: `checkBase` with `remoteRequired` true runs `git ls-remote` for a fresh worktree (`src/preflight.ts:checkBase`, called with `mustCreate` in `src/next.ts` dispatchLeaf), so the "allocation never touches the network" complaint applies only to the reuse path, which is the rare one this whole fork exists for.

Reason three, scope: the chart scope sentence says the base holds "the current tracking ref" — the ref as it stands — and the merged opening map records the residual naming as part of the design space. A residual that is named, small and bounded beats a mechanism that shrinks it further at the price of a network call inside dispatch.

Confidence: medium. This is the question where reasonable weighting diverges (C picked yes in the opening map). If the operator regularly pushes to framework repos from outside akrogon — or pulls main by hand in the registered checkout, which `akrogon sync` does fetch — the residual is not theoretical, and 3b with warn-and-continue semantics is defensible at low cost. I still pick a because the invariant the chart needs is already closed and the residual is honest to name.

### Rejected

- b (one `git fetch <remote>` before a first allocation). Shrinks the residual window for externally pushed content but cannot close it (post-fetch pushes), adds a network dependency or a warn-and-continue soft step to the dispatch path, and duplicates what the merge lane already guarantees for the dependency case that motivated the chart. Its cost is small but its benefit is bounded by construction, which fails the remove-the-class test.

### Evidence

- `src/next.ts` mergeTurn and reconcileBatch (practitioner, code read 2026-11-25): both run `git fetch <remote>` before reading or building on the tracking ref; mergeTurn treats fetch failure as warn-and-continue with existing refs, the precedent for what 3b's soft variant would look like.
- `src/phase.ts:finishPush` (practitioner, code read 2026-11-25): fetches before verifying the pushed candidate is an ancestor of the tracking ref — post-push ref freshness is enforced, so merged dependencies are in the local ref.
- `src/preflight.ts:checkBase` and its call in `src/next.ts` dispatchLeaf (practitioner, code read 2026-11-25): creation allocations already pay `ls-remote`; reuse allocations verify only the local ref. `localBase` is `git rev-parse --verify` of the local tracking ref.
- `src/sync.ts:integrate` (practitioner, code read 2026-11-25): `akrogon sync` fetches the default branch every time it runs, another refresh path outside the merge lane.
- INTAKE.md "Observation" (operator-tier intake): the incident's 1271-commit staleness was the leftover's HEAD versus the current local tracking ref — the local ref itself was fresh (the seat fast-forwarded to it). Nothing in the incident involved a stale tracking ref; the fetch question is purely about the residual.
- Opening map, issues/chart/seat-turn-idle/slots/map-merged.md section "fresh-leaf-base (#156)" (practitioner, read 2026-11-25): C yes / D no split; D's ground is the scope sentence "current tracking ref".
- Model-knowledge (low confidence, unverified on this host): typical fetch cost for these repos is sub-second to a few seconds; irrelevant to the pick but relevant if 3b is chosen.

### Pitfalls and what removes each

1. A leaf allocates after a long merge silence in a repo where origin moved externally: base misses real upstream commits. Accepted as the named residual; bounded because any akrogon merge, land verification, or `akrogon sync` in between refreshes the ref. If operationally the residual proves frequent, 3b is the documented fallback and the cost of switching is one call site.
2. The creation path's `ls-remote` proves the remote branch exists but says nothing about the local ref's freshness, so even a brand-new leaf can start behind origin. Same residual, same acceptance; noted so nobody believes creation is fresher than reuse.
3. Warn-and-continue fetch (if 3b is later taken) silently doing nothing offline — a guard-shaped non-fix. Avoided by the pick itself.

### Questions the fork does not ask

- Should the residual be written down where operators read it — the leaf docs or the akrogon.yaml/config reference — rather than only in this chart's records? A residual that is named in a fork file but nowhere else is not really named.
- If 3b is ever taken: one fetch per allocation or one per pass per repo? Successive first allocations in one pass would otherwise fetch repeatedly for no benefit.

## Cross-cutting observation

The three picks interlock into one mechanism with a single trust decision: inside the gate, porcelain-clean is the only fact ever read from the leftover. Clean — destroy and rebuild through the one creation path. Dirty — refuse and preserve, matching reconcile's existing treatment of the same object. Outside the gate (branch has commits) — adopt as-is, preserving the direct route's growth-stop handoff. No new record kinds, no new verbs, one new check. That is the shape signposts 1a/3a and the operator's autopilot words point at, and it is worth the design holding this sentence as its test.
