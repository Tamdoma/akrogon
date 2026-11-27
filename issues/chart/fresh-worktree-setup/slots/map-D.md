# Territory map, slot D: fresh-worktree-setup

Goal (intake, never re-argued): "the configured `setup` has run in the worktree" is true before a seat works in it. Locks: fix the mechanism, free tests at the real boundary, extend existing records, one leaf, old records keep parsing.

## F1: When setup runs

- O1 Worktree creation only (in `src/next.ts` `ensureWorktree`, when it calls `createSparseWorktree`). Misses two live shapes: (a) first-allocation adoption of an existing worktree whose branch has its own commits (`ensureWorktree` keeps it, no create), which may have no `node_modules`; (b) akrogon later moves the worktree's HEAD (O1b below), leaving stale deps that pass `guard own-modules` because a directory exists.
- O2 Every seat start (`src/seat.ts` `startSeat`). Runs twice for A+B on one shared worktree, races the sibling seat, and still misses prompt delivery to a live idle seat (`dispatchSlot` send path never calls `startSeat`). Worst placement.
- O3 Every allocate (`allocate` calls `ensureWorktree` on every dispatch, every `phaseWake`, the start verb, and `broadcastPass`). Correct by brute force. Cost: install cost on every phase move of every leaf, inside the home `.lock` (F2). For `bun install --frozen-lockfile` that is about 2 s (intake evidence). For pi-extensions' configured setup (`npm ci` per package dir, read from its `issues/config.yaml` 2026-11-25) each run wipes and reinstalls, so every phase wake pays minutes and network. Also installs into a tree a live seat is working in.
- O4 Event-triggered at allocate, proven by a per-worktree success marker (F4). Triggers: worktree just created or replaced, first allocation adopting an existing worktree, marker missing or setup string changed, akrogon itself moved the worktree HEAD since the marker was written, top-level `package.json` present with no `node_modules`. Skips when a seat is live in the leaf (`allocate` already computes `live`; `writeLeafEnv` uses the same skip rule).
- O5 On demand only (seat or operator runs it). This is today's workaround. The blocked first Skill call is exactly a seat that cannot reliably do this. Rejected by the intake itself.

Akrogon-side HEAD moves that can change a leaf worktree's lockfile after creation:

1. `src/batch.ts` `move` (via `applyTop`) runs `git reset --keep <top>` in the leaf worktree during the merge turn (`src/next.ts` merge turn apply) and restack (`src/phase.ts` `restack`, driven from `src/land.ts`). The next seat dispatched is often a check.repair seat into that moved tree. `move` returning `dirty-ref` changes only the ref, not the files, so it should not invalidate anything.
2. `ensureWorktree` first-allocation replace: `resetLeafBranch` to the tracking sha, then recreate. Covered by the creation trigger.
3. `src/sync.ts` `git rebase --autostash` and `src/self-update.ts` act on the registered checkout, not leaf worktrees. Out of scope.
4. A seat's own rebase or dependency edits mid-task. The seat is alive and can recover, and its configured checks rerun setup under the install lock today. Drawing the line here is a chart decision (Q1), because a seat whose hook breaks mid-task after its own rebase hits the same symptom with no dispatch in between.

## F2: Where setup runs (lock, scope, env)

Facts from the code:

- Every `allocate` caller already holds the home `.lock` (`withLock(resolve(globalHome(), '.lock'))`): the `next` pass sweep, `phaseWake`, `seatCommand`, `broadcastPass` in `src/next.ts`. Setup placed in `ensureWorktree` therefore runs inside that lock unless allocate is split across the lock boundary at three call sites, with state re-read and revalidated after (leaf stopped, phase moved, worktree removed while installing). The codebase does slow work outside the lock elsewhere (merge turn `git fetch`, `restack` builds the stack outside, applies inside), but it also already holds the lock across `startSeat`, which waits up to `START_PROOF_MS` (60 s default, `src/seat.ts`). A rare-event install inside the lock is the same class as an existing cost, not a new one. An every-allocate install (O3) inside the lock is not defensible.
- Plain run: `command(['sh', '-c', setupCommand(repo.config, 'true')], worktree)` reuses the existing wrapper from `src/config.ts` `setupCommand`: `flock` on the per-worktree install lock, then `akrogon guard own-modules`. OBS1 confirms the flock target is per-worktree, so it serializes against run-check installs in the same worktree and does not serialize installs across worktrees. Env is the dispatch caller's full env (`src/shell.ts` `run` passes no env except git/gh credential repair), stdin is ignored (`spawnFiles`), and there is no deadline unless one is passed (`command` accepts `deadlineMs`, unused for setup today). Output exists only inside the thrown `CommandError` JSON.
- Run-check scope (`checkedRun` in `src/run-check.ts`, as `src/verify.ts` uses for its detached worktree): constructed env allowlist (`constructedEnv`: copied names plus `config.env`/`pass_env` values, `DBUS_SESSION_BUS_ADDRESS` cut, scratch `TMPDIR`), `refuse()` on forbidden env, systemd run unit, admission token, captured log file, timing rows. Risks at dispatch time: `leafTarget` resolves the caller by matching cwd to a recorded `state.worktree`, which does not exist yet at first allocation, so it refuses where plain run works (verify avoids this by constructing its caller directly). The cut session bus can break installs needing keyring or git credentials. A `setup` check row also pollutes check evidence for a dispatch that is not a check.
- Env pitfall either way: `writeLeafEnv` writes the worktree `.env` file, but nothing sources it into a setup process. A setup needing a private-registry token gets it only if the dispatch caller's process env holds it (plain) or it is listed in `config.env`/`pass_env` and present in the caller's env (run-check). The watcher, an operator shell, and a seat shell are three different envs dispatch can run under.
- No-setup repos: `setupCommand` with `config.setup === undefined` runs only the guard. Running it at allocate would newly fail dispatch for a repo with `package.json`, no setup, and no `node_modules`, where today dispatch succeeds and checks fail later with the guard's hint. Three of the twelve registered repos have no `setup` line (checked each `issues/config.yaml`, 2026-11-25). The invariant is "configured setup has run", so undefined setup must skip, not guard.

## F3: What a failed or slow setup does

- Failed, if it throws inside `allocate`: the existing shape is already right. `dispatchLeaf` catches per leaf, `report` records it once, outcome `skipped`, the pass continues with other leaves, `nextPass` sets exit code 1. No seat starts, no attempt or loss is charged (correct, it is not the seat's fault), and the next pass retries. `seatCommand` has no catch, so the start verb fails loudly to its caller. Do not dispatch the seat anyway (that is the bug), do not move the leaf to `failed` (a network flake is transient), do not delete the worktree (an adopted one may hold commits, and a fresh retry reuses a partial install).
- Ordering inside `ensureWorktree` decides the recorded state on failure. If setup runs before the final `saveState`, a first-allocation failure leaves no `worktree:` in state.yaml, matching the existing refusal shape asserted in `tests/first-allocation.test.ts` (`expectRefusal`). If it runs after, the leaf looks allocated and capacity counting (`capRefusal` keys on `worktree === undefined`) changes.
- Retry keying is the trap in O1: if "already ran" is inferred from worktree existence, a setup that failed after creation never retries and the next pass seats into the broken tree. The success marker (F4) must be written only after setup exits 0.
- Slow: setup runs serially inside the sweep, so one leaf's multi-minute install delays every later leaf in that pass and every other `.lock` caller (phase moves, land claim, reconcile). With O4 triggers this happens a bounded number of times per leaf lifetime. A hung setup (registry stall, prompt on stdin which is ignored, or a setup that itself calls an akrogon verb needing the home `.lock`) blocks the whole system with no deadline. That is the strongest argument for an explicit deadline decision (Q2).
- A permanently failing setup retries on every pass with no backoff: report output each time plus repeated registry load, at whatever cadence the watcher runs passes. Acceptable for one leaf now, worth naming.

## F4: How "setup has run" is recorded

- O6 A field on the leaf `State` record (`src/state.ts` `stateSchema`). It is a `strictObject`: new writes become unreadable to an older installed binary during rollout. Worse, state.yaml lives under `issues/` and syncs, so the record can claim setup ran on a machine where it never did. Setup proof is machine-local, worktree-local state.
- O7 A marker file in the worktree's own git dir, at the path `git rev-parse --git-path <name>` already used for `akrogon-install.lock`, holding the setup string it ran. OBS2: it survives checkout, stays out of `git status`, and is deleted by `git worktree remove`, so its lifetime is exactly the worktree's. No schema change, old binaries ignore it, old records parse (signpost satisfied trivially). `move` in `src/batch.ts` clears it when it returns `worktree` (files actually moved). Content equality against `repo.config.setup` makes a config change rerun setup once.
- O8 No record, infer from `node_modules` existence (the `guard own-modules` shape in `src/guard.ts`). JS-only, top-level only (OBS1: a subdir-only `package.json` passes with no deps installed), and existence says nothing about freshness after a HEAD move. Fine as one extra trigger inside O4, useless as the proof.
- A content fingerprint of setup inputs (lockfile hash, tree hash) was considered and rejected: akrogon is generic and cannot know which files an arbitrary setup reads, and a HEAD/tree fingerprint reruns a wiping `npm ci` setup after every seat commit.

## F5: Which worktrees are in scope

- Leaf worktrees via `ensureWorktree` are the intake. Putting setup in `createSparseWorktree` instead would also hit verify's detached target (`src/verify.ts`, which already runs setup through `checkedRun`, so it would run twice) and batch stack builds (`src/batch.ts` `buildStack`, no seat, pure git work, pure slowdown). Placement must be the leaf path only.
- Worker worktrees (basename `-uN`, recognized in `src/run-check.ts` `leafTarget`) are created by a seat, not by `ensureWorktree`, and chart direct-route and consultant seats start in a caller's folder (`src/seat.ts` `launch`). Whether the invariant extends to them is unsettled (Q4). They share the symptom class in a Claude-hook repo.

## Practitioner pitfalls over the work's lifetime

- P1 Setup scripts grow. A repo that later adds a browser download or a codegen step to `setup` silently makes every fresh dispatch slow and network-dependent. Nothing in the config schema bounds what `setup` may do.
- P2 Setup is not guaranteed clean. varhop's configured setup is unfrozen `bun install` (read 2026-11-25), which can rewrite a lockfile and dirty a fresh worktree before the seat starts. That already happens at first check today, but at dispatch it also interacts with `move`'s dirty detection and first-allocation leftover rules on any redispatch.
- P3 Sparse checkout excludes `issues/` (`createSparseWorktree`). A setup referencing files under `issues/` fails at dispatch. Same exposure exists in checks today, so any such repo is already broken there first.
- P4 Plan-phase cost shifts earlier. Leaves abandoned after planning currently may never pay install time or `node_modules` disk. Under any creation-time option they always do. That is the price of plan seats' hooks working, and it is also the point of the fix.
- P5 Disk pressure multiplies per worktree exactly as it does at first check today (no new class), but failures from a full disk now surface as dispatch failures instead of check failures.
- P6 A leftover adopted worktree can carry `node_modules` built at another absolute path (copied store, moved home). Marker absence at first allocation reruns setup and repairs this. Existence-based inference (O8) would not.
- Model knowledge, marked as such: that `npm ci` deletes `node_modules` before installing, and that frozen bun installs are cache-warm and idempotent, are general tool behavior I did not re-verify against vendor docs. Local searches that found nothing stronger: `setup:` across all twelve registered repos' `issues/config.yaml` (the actual commands, cited above), and grep for `setupCommand|withSetup` across `src/` (only config, run-check, verify call it). No web sources were needed for the mechanism forks.

## Observations

- OBS1 Install lock scope and guard reach. Command: throwaway `git init` repo plus linked worktree under `mktemp -d`, `git rev-parse --git-path akrogon-install.lock` in both, then `bun /home/ivan/Work/infra/akrogon/src/akrogon.ts guard own-modules` in (a) the linked worktree with top-level `package.json` and no `node_modules`, (b) a repo whose only `package.json` is in a subdir. Versions: bun 1.4.5, git 2.56.1, 2026-11-25. Result: main lock path `.git/akrogon-install.lock`, linked lock path `<main>/.git/worktrees/linked/akrogon-install.lock` (per-worktree). Guard (a) exit 1 with the missing-modules message, (b) exit 0. Cleanup: temp dir removed, verified absent. Limits: proves lock locality and the guard's top-level-only reach, nothing about install speed.
- OBS2 Git-dir marker lifetime. Command: in a throwaway repo and linked worktree, write a file at `git rev-parse --git-path akrogon-setup-done`, run `git checkout`, check `git status --porcelain`, then `git worktree remove`. Versions as OBS1, 2026-11-25. Result: marker survives checkout, status stays clean, marker gone after worktree removal. Cleanup: temp dir removed, verified absent. Limits: proves lifetime for plain git operations, not against `git clean -fdx` style tools that some setups run inside the working tree (the marker is outside the working tree, so those do not reach it).

## Recommended direction

O4 + O7 + plain run, in one leaf:

1. In `ensureWorktree`, after `writeLeafEnv` and before the final `saveState`, if `repo.config.setup` is defined, no seat is live, and any O4 trigger holds, run `command(['sh', '-c', setupCommand(repo.config, 'true')], path)` and write the marker only on success. A failure throws and takes the existing per-leaf report path, leaving a first allocation unrecorded.
2. Marker at the worktree's git-path, content the setup string. `src/batch.ts` `move` deletes it when the worktree files actually move. The marker-path helper belongs with the install-lock naming (config or guard), not as a new import cycle: `src/batch.ts` already imports from `src/next.ts`.
3. Skip entirely when `setup` is undefined.

Cost: one helper plus one call site and one delete, no schema or record change. Runtime cost moves from first check to first dispatch for fresh trees (about 2 s framework per intake, unbounded for a wiping multi-package setup), paid again only on the listed events. Residual risk accepted: installs inside the home `.lock`, caller-env dependence, no captured log file beyond the error JSON, and a seat's own mid-task HEAD moves stay uncovered (Q1 decides if that blocks retiring the lesson).

Free test at the real boundary, extending the `tests/first-allocation.test.ts` shape (real `akrogon next`, fake hc core, temp git repos, fixture `issues/config.yaml` with a marker-writing setup such as `mkdir -p node_modules && touch <abs path>`, a tracked `package.json`):

1. Fresh dispatch: setup marker and `node_modules` exist in the worktree and the plan task is delivered (`delivered()`), proving order (setup before seat).
2. Setup `exit 7`: `next` exits nonzero, no seat start (`seatStarts` empty), no `worktree:` in state.yaml, error carries the setup failure. Fix the config and redispatch succeeds into the same worktree, proving retry is keyed on success not existence.
3. Second dispatch of the same leaf (next phase wake shape) does not rerun setup (counter file setup appends to). Changing the setup string reruns it once.
4. Criterion-4 adoption shape (existing worktree, branch with own commits, no deps): dispatch runs setup.
5. No `setup` configured with a `package.json` present: dispatch behaves exactly as today.
6. HEAD-move invalidation: after a successful dispatch, drive `move`'s worktree case (or delete the marker plus `node_modules` to simulate the guard trigger) and prove the next dispatch reruns setup before seating.

## Questions the intake does not settle

- Q1 Does "stops it on every path" (the lesson-retire bar) include a seat breaking its own hooks by rebasing or editing deps mid-task, where no dispatch intervenes and only its next configured check reruns setup? If yes, no dispatch-time placement retires the lesson and the chart should say so.
- Q2 Does setup get a deadline inside the home `.lock`, and what value? No existing setup run has one, but none holds the global lock either. A hang currently needs an operator kill.
- Q3 Is a multi-minute wiping setup (pi-extensions `npm ci` per package) acceptable at leaf creation, given it now also runs for leaves that die in planning? If not, that repo's setup, not akrogon, may be the thing to change.
- Q4 Do worker (`-uN`) worktrees and chart direct-route worktrees need the same guarantee? They are created outside `ensureWorktree`, so covering them is a second mechanism, which the one-leaf signpost pushes against.
- Q5 Should a repo with `package.json` and no configured `setup` get the guard's hint surfaced at dispatch (warning, not failure), or stay silent until checks? The guard message already tells operators to set `setup`, but only check runs ever print it.

Most important point: key the rerun decision on a per-worktree success marker in the git dir, triggered by creation, adoption, config change, akrogon's own HEAD moves, and missing top-level modules. That is the only option set above that proves the intake invariant on every akrogon-controlled seating path without paying install cost on every allocate.
