# Owner roots B: footprint

Code read on main at 0a74a994. (H) marks what I checked on this host on 2026-11-22.

## Short answer

- Two of the four were live owners when I counted them, not leftovers. The consult case is `open` and the three direct-route worktrees belong to charts in progress (H). This corrects S5 and S12 in my map.
- The two real leftovers are the worker copies and the lock files.
- Smallest changes: one refusal in the phase move (item 2), one deleted lock (item 3), one script verb (item 1), three git commands in skill text and no sweep (item 4).

## 1. Watch consult folders

- Facts.
  - The bytes are `<case>/worktree`, a detached checkout the consultant makes by hand (skills/watch-issues/consultant-brief.md:29). The record files are 27 MB in the one case here (H).
  - `status` is written by hand. Nothing ties it to the worktree (skills/watch-issues/SKILL.md:60-62).
  - `match` reads closed cases to refuse a repeat consult (consults.ts:162-182, :200-210).
- Change: a `close` verb in consults.ts, beside `verbNew` (consults.ts:184). It runs `git worktree remove` without `--force` on every registered worktree under the case folder, then writes `status`. SKILL.md:60-62 names the verb as the only way to end a case.
  - Then a closed case cannot hold a worktree. If git refuses, the verb exits non-zero and the case stays open.
- Keep `<anchor>-<seq>`. One folder per anchor drops the earlier signature. A leaf that fails with cause A, then B, then A on the same heads would get a third consult. Removing cases with the watch would consult every still-failed leaf again at each watch start.
- If removal runs while the case is live: the consultant loses an uncommitted repair. Reused test: git's own refusal on modified or untracked files, under the existing `withConsultantLock` (consults.ts:216) so it cannot overlap a consultant start.
- Not covered: commits on the detached HEAD that were never pushed lose their name. The brief already requires the push as proof.
- Proof: in consults.test.ts, `close` on a clean worktree removes it and writes `closed`. With an untracked file it exits non-zero and `status` stays `open`. Host figure: no registered worktree under `consults/` beside a `status` other than `open`.
- Q1. The record (27 MB of logs and evidence here) stays after the case by rule. Trim it at `close` to `case.md`, `signature.json`, `status` and the turn files, or keep it?

## 2. `-uN` worker worktrees

- Facts (H). `one-gate-path-u1..u3` were made at 14:53-14:58. The leaf has since moved `failed` to `check.fix` (20:29), to `check.review` (21:06), to `check.repair` (21:08). The copies are still there.
  - The skill already says "with every worker worktree removed" before the move (skills/implement-issue/SKILL.md:62). Nothing checks it.
  - Reconcile's non-forced removal for a failed leaf (src/reconcile.ts:1034) did not remove them while the leaf was `failed`. Likely cause: cherry-picked worker commits count as unreachable (src/reconcile.ts:246-254). Not traced.
- Change: one refusal in `transition`, next to the `moveGuards` call (src/phase.ts:461). When `state.phase` is not `failed` and the store holds a registered `<slug>-u<N>`, refuse the move and name the paths.
  - Not inside `moveGuards`: the land's own move to `merged` also calls it (src/phase.ts:731), and a land must never go red on a leftover copy.
  - `failed` is skipped the same way `moveGuards` skips abandoned captures (src/phase.ts:402), so operator recovery is not blocked. The copies are caught at the next move out.
- Akrogon removes nothing. The seat that started the workers removes the copies, and it is the only one who knows whether a worker still runs.
- If removal runs while the owner is live: it cannot, because akrogon does not remove. A copy with unsaved work makes `git worktree remove` refuse, and the move stays refused until the seat resolves it. That is a stalled leaf with a named reason, in place of a silent leak.
- Reused test: none needed. The existing rule for finished leaves (src/reconcile.ts:1026-1034) stays as crash cover.
- Proof: a leaf in `implement` with a registered `<slug>-u1` refuses `check.review` and names the path. After `git worktree remove` the same call passes. Host figure: copies older than their leaf's last move, 3 now, 0 after.

## 3. Run lock files

- Facts.
  - 12,690 files now. 12,686 are `akrogon-l<hash>.slice`. 8,782 are dated today (H).
  - The per-slice lock has three users: `awaitTurn` (src/admission.ts:174), `cancelWaitingRun` (:211) and `stopSlice` (src/reconcile.ts:224-229).
  - It protects one thing: a run must not register in a slice while reconcile checks `liveRuns` and stops that slice.
  - Every admission already takes the home `admission.lock` shared (src/admission.ts:51-57). The state-home move takes it exclusive.
- Change: delete the per-slice lock. `stopSlice` takes the home `admission.lock` exclusive. `withAdmissionLock` loses its `slice` argument and the inner lock (src/admission.ts:52, :55).
  - Same exclusion, with a lock that already exists. No file per slice is ever created again.
  - `stopSlice` has no repo at one of its call sites (src/reconcile.ts:1373), so the per-repo line lock does not fit. The home lock needs no argument.
  - `runs/locks` then holds one `line-<repo>` per registered repo.
- One-time removal: widen the retired-lock rule (src/reconcile.ts:1507-1516) from two exact names to every entry of `runs/locks` that does not start with `line-`. It already keeps a file while a process holds it open.
- What breaks.
  - A slice stop now pauses admissions on the whole host for as long as the stop takes. Run units have `TimeoutStopSec=5` (src/scope.ts:43, :64). Admissions poll once a second anyway. A slice is stopped only when it has no live run record and no live tab.
  - Mixed releases: an old reconcile takes only the slice lock and a new admission takes only the home lock shared, so the two do not exclude each other until the old process ends. The exposed case is a new run starting in a finished leaf's slice.
  - tests/state-home.test.ts:112, :352 assert that slice lock files exist. tests/run-permit.test.ts:917 creates one.
- Proof: the existing race test in tests/run-permit.test.ts with the lock path changed. Host figure: `ls ~/.akrogon/runs/locks | wc -l` equals the number of registered repos after one reconcile pass, and stays there after a full suite run.

## 4. Chart direct-route worktrees

- Facts.
  - They are already owner-named and removed by the calls that end the attempt: landing step 8 and abandon (skills/chart-issues/assets/direct-route.md:19, :28). `k1-compile-cache` went that way.
  - They are full checkouts, 168 MB real each in akrogon, because step 1 uses a plain `git worktree add` (direct-route.md:7). Chart files and check logs live in the main checkout, not in the worktree (H).
  - None of the three live ones is locked, though step 1 says `--lock --reason`, and `land-own-reds` is a detached HEAD (H). For this kind reconcile keeps the worktree whether locked or not (src/reconcile.ts:1050-1055).
- Change: sparse only. Step 1 becomes the three commands `createSparseWorktree` runs (src/next.ts:252-265): `git worktree add --no-checkout -b <slug> <path> <base>`, `git -C <path> sparse-checkout set --no-cone '/*' '!/issues/'`, `git -C <path> checkout`. 168 MB becomes about 5 MB.
  - Drop `--lock --reason` and the two `git worktree unlock` steps. The lock has no reader and the door does not use it.
- No reconcile rule. Reasons:
  - Reconcile cannot tell a live attempt from a dead one. There is no state file and no pane that must sit inside. The agent rule works because its lock reason carries a pid and start time (src/reconcile.ts:680-693). A chart outlives door sessions, so a pid proves nothing here.
  - The only liveness record is the `Direct attempt` section of CHART.md. Parsing skill prose in reconcile ties code to a text format.
  - No leftover has been seen. A dead one is already listed every pass as `unmanaged worktree`.
- If removal ran while the owner is live: the door would lose the attempt's uncommitted work, with no test to prevent it. That is the reason to add none.
- What sparse could break: a direct task that edits files under `issues/` in the worktree. Leaves already forbid that (`requireNoIssueFiles`, src/phase.ts:405).
- Proof: after one new direct attempt, `btrfs filesystem du -s` of its worktree is under 10 MB and the worktree has no `issues/` folder. Landing step 8 still leaves `git worktree list` without it.
