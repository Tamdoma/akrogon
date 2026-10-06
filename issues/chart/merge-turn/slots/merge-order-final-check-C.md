# merge-order 1d final-shape check, slot C

Read: `slots/merge-order-1d-shape.md`, `src/phase.ts`, `src/next.ts`, `src/routing.ts`, `src/log.ts`, `skills/merge-issue/SKILL.md`, `skills/broadcast-issue/SKILL.md`. Disagreements and missing pieces only. Step numbers refer to the shape file. `fw:` is `/home/ivan/Work/infra/tamdoma/framework/`.

## Disagreements

### D1 · Step 7 leaves the stack in place, so a solo merge would land other leaves' commits

After step 3 each carried branch sits on top of the leaves below it. Step 7 says the red batch "dissolves" and each leaf merges solo. A solo merge rebases onto `<remote>/<default_branch>` (`skills/merge-issue/SKILL.md:37`). Rebasing a stacked branch onto main replays the lower leaves' commits too, because they are not on main yet. The upper leaf then pushes a lower leaf's work, including a lower leaf that is about to go red and return to `check.fix`. No guard catches it: `requireNoIssueFiles`, `requireTestChangeCitations` and `requireNonEmpty` all diff against the target only (`src/phase.ts:276,284,312`).

The same holds for a holder that dies between step 3 and the push, and for the restack in step 8.

Needed: the pre-batch head of every batch leaf is recorded before any rebase, and dissolve restores each branch to it. Done-criterion: after a red batch, `git rev-parse <slug>` equals the recorded pre-batch head for every batch leaf.

### D2 · Step 7 loops: the next holder forms the same batch again

Step 2 builds a batch from "the holder plus every leaf waiting in `merge`". After a red batch, every leaf "keeps its queue place", so the next holder start is the same holder with the same waiting leaves, which is the same batch and the same red. Step 7 says "merged solo" but nothing recorded tells the command that these leaves are now solo.

Needed: a recorded mark per leaf from a red batch that excludes it from batches until it leaves `merge`. It must live in `state.yaml`, since the turn is derived from state on every pass (step 1).

### D3 · Step 1's guard would refuse the holder's own moves of carried leaves

Step 1: "The command refuses merge work by a non-holder (merge-pass start and `merged --check`)". Steps 5 and 6 have the holder's seat run `merged --check` and `merged` with a carried leaf's slug. Those leaves are not the holder. `phaseCommand` identifies the leaf by slug only (`src/phase.ts:331`, `src/state.ts:133`), and knows nothing about which seat is calling.

Needed: batch membership recorded by the command when the holder starts, and the guard reads "holder or member of the holder's recorded batch". This also fixes "at that moment" in step 2, which is otherwise the seat's word: a leaf that enters `merge` during the 35-minute run must be provably outside the batch.

### D4 · Step 5's "trailers on that leaf's own range" is not what the code checks

`requireTestChangeCitations` compares `<target>...HEAD` for changed test files and `<target>..HEAD` for trailers (`src/phase.ts:284,294`). Before the push, for the leaf at stack position k, both ranges cover every leaf below it. The check is cumulative, not per-leaf.

This is harmless and makes step 5 simpler. Every batch leaf already passed this guard on its own range at its move into `merge` (`src/phase.ts:228` runs on every non-failed move), and a clean rebase does not change which files a leaf touches. One `merged --check` on the top leaf covers the whole stack. Reword step 5 rather than add an own-range mode.

### D5 · Step 6's "in stack order" moves the holder's own leaf first, which is the wrong end

The holder is the earliest leaf, so it is first in stack order. Once its leaf is `merged` and its pane goes idle, the hook closes its tab (`src/next.ts:846-856`, `SKILL.md:53`: "the tab closes as soon as this pane goes idle after `merged`"). If the seat stops for any reason after its own move, the carried leaves are pushed but still in `merge` with no seat finishing them.

Needed: carried leaves are moved first and the holder's own leaf last. The fallback already exists and should be named as binding: the next holder's resumed pass finds its tip already on the remote with `git merge-base --is-ancestor` (`SKILL.md:25,49`) and moves it without a check run.

## Missing pieces

### M1 · Dependents of carried leaves are never woken

`dispatchDependents` runs only when the leaf that owns the hook pane comes back `completed` (`src/next.ts:836-842`). A carried leaf's panes were idle the whole time, so no hook pass has it as owner. A leaf `blocked-by` a carried leaf waits until someone runs `akrogon next` by hand. This is separate from the turn wake in `forks/turn-release.md`.

### M2 · Carried leaves' tabs stay open

The hook closes a merged tab only when the hook pane is that leaf's own B pane (`src/next.ts:849-856`). `cleanupRepos` is not called on the hook path, only on manual, `--all` and `--resume` passes (`src/next.ts:788,795,798,811`). Carried tabs and scratch folders linger until a manual sweep. They hold no `max_active` slot, since `merged` leaves are not counted (`src/next.ts:309-311`).

### M3 · Checks in the top leaf's worktree move the holder's pane across leaves

Step 5 runs checks "in the top leaf's worktree". The holder's pane was created with `--cwd` of its own worktree, its own `TMPDIR` and its own `AKROGON_BASE` (`src/next.ts:375-386`). Two effects:

- Pane ownership is decided by pane id or by `pane.cwd` inside a leaf's worktree (`src/next.ts:181-187`). If the holder's pane reports a cwd inside the top leaf's worktree, `paneOwners` returns two leaves and the hook pass throws "Multiple leaves own hook pane" (`src/next.ts:833-834`). `activeCount` uses the same test (`src/next.ts:312`).
- `AKROGON_BASE` must be read from `akrogon config` in the top worktree, where `base()` returns the old main tip (`src/config.ts:148-150`). That makes `test_changed` cover every batch leaf, which is correct. The pane's env value is the holder's own stale base.

The skill currently says "B merges in the existing leaf worktree" and "code is read and edited only in the worktree" (`SKILL.md:10,16`). The shape needs a sentence that changes that rule for batches. The top worktree also needs installed dependencies, which is `forks/dependency-setup.md`.

### M4 · Carried leaves skip the parts of the merge pass that are not checks

A carried leaf's own B is never prompted (step 9). Its B's held Nits never become a `learnings/LESSONS.md` line (`SKILL.md:35`), and "commit scoped outstanding changes" (`SKILL.md:37`) never runs for it. The holder's seat did not review those leaves. See question N2.

### M5 · Briefs must be gathered for every batch leaf before the first move

`completeOwner` renames the owner folder to `issues/closed` inside the `merged` move (`src/phase.ts:178-180`). `SKILL.md:53` says gather the owner's briefs "before its folder may move". In a batch the holder must gather briefs for every batch leaf's owner before the first `merged`, since any of the moves can close an owner. Several owners can complete in one batch, so step 6's "one broadcast for each" line is right, and broadcast-issue allows it (`skills/broadcast-issue/SKILL.md:10`).

### M6 · A red batch costs one more run than 1a

Step 7 gives N+1 full runs for a red batch of N, against N under 1a. One red on 2026-10-05 had an empty repair diff (`fw:issues/open/skill-rewrite-tooling/slice-boundary-anchors/review-B.md:137,160`), so a red with no code cause is a real case. This is a stated cost, not a defect. It belongs in the fork record.

## Open for the check

**Is batch size capped, and at what?** No new setting. Every leaf in `merge` has a live tab, and new tabs are refused at `max_active` (`src/next.ts:334-337`), so a batch cannot exceed `max_active` if waiting leaves count toward it. That depends on Q2, which is still open: under the option where waiting leaves do not count, the batch has no bound. A larger batch does not raise the cost of a red, which stays at one wasted run. What grows with size is the holder seat's load: briefs, a `review-B.md` entry and a move per leaf.

**Does any guard break when B moves another leaf's phase or rebases its worktree?**

- `requireClean` (`src/phase.ts:225-226,268-272`): passes for carried worktrees after a clean rebase. It fails for the top worktree if the checks leave files behind. Seats removed a test-made `__pycache__` before the move on 2026-10-05 (`fw:.../lane-orphan-check/review-B.md:85`).
- `requireNoIssueFiles` (`src/phase.ts:227,274-279`): passes. Before the push the range is cumulative and no leaf has `issues/` files. After the push and fetch the range is empty.
- `requireTestChangeCitations` (`src/phase.ts:228,282-309`): passes, cumulative. See D4.
- `logMove` (`src/log.ts:9-15`): works. It reads `HEAD` from the carried leaf's worktree and records the holder's session, because `HERDR_PANE_ID` is the holder's pane. The log line for a carried leaf will name a session that never worked on it.
- `cleanupMerged` `git branch -d` (`src/next.ts:651`): works. Leaf branches track the remote default branch (checked in framework: `emitter-crosscheck origin/main`), and after the fetch each carried tip is an ancestor of it.
- Not a guard but it breaks: pane ownership by cwd, M3.
- Dependencies inside a batch cannot occur. A leaf is not dispatched until its `blocked-by` leaves are `merged` (`src/next.ts:607-611`), so it cannot be in `merge` beside them.

**Is the holder seat the right owner, or should the command build the stack?** The command should build, record and dissolve the stack. D1, D2 and D3 each need a value the command records: pre-batch heads, batch members and the solo mark. Rebase-or-drop and restore need no judgment, and a seat doing them works in worktrees the skill tells it not to touch (`SKILL.md:16`). The seat keeps what needs judgment or runs long: the checks, the push, the lost-reply rule, briefs, the per-leaf moves and broadcasts. The check-record runner stays Off route (`issues/chart/check-reruns/forks/check-scheduling.md:22`), so the command does not run the checks.

## New material operator questions

- **N1 · After a red batch, how do the leaves proceed?** The shape says solo, one at a time (N+1 runs). The alternative is to split the batch in half and retry, as bors does, which costs fewer runs when one leaf of many is red and more seat steps. Either way D2's mark is needed. This is a choice about cost, and the operator has not seen it.
- **N2 · May a leaf merge without its own B seat doing a merge pass?** Under 1d a carried leaf's held Nits do not reach `learnings/LESSONS.md` and its evidence is written by a seat that never reviewed it (M4). Options: accept the loss, have the holder read each carried leaf's reviews, or prompt each carried B after the move for the Nit step only.
- **N3 · Q2 now decides the batch bound.** If waiting leaves do not count toward `max_active`, batch size is unbounded and needs its own cap. The operator should answer Q2 knowing that.
