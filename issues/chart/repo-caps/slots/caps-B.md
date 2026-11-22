# Repo caps: slot B (blind)

Line numbers are from `~/.akrogon/worktrees/akrogon/land-hold`.

## 1. Per-repo cap

- K1 Key: optional `max_active` in the repo's `issues/config.yaml` (`repoSchema`, src/config.ts:48), a positive whole number. Same word as the machine key, smaller scope. Absent means no repo limit.
- K2 Combine: a leaf with no live seat starts only when its repo's count is below the repo cap and the total is below the machine cap. Both use today's count (unfinished leaves with a live terminal, merge phase not counted). `activeCount` (src/next.ts:369) already sums one term per repo, so it returns the per-repo counts with the total, and `allocate` (src/next.ts:415) checks both. A repo cap above the machine cap is harmless.
- K3 Breaks, rollout: `repoSchema` is strict. If the key is added before the installed build knows it, `registeredRepos` (src/next.ts:127) reports the repo as `unknown`, and `activeCount` then counts the full machine cap (src/next.ts:371). Every repo stops starting leaves. Install first, then add the key.
- K4 Breaks, messages: the `capacity` wait (src/next.ts:768) and the start verb's refusal (src/next.ts:1192) name only the machine cap. They must say which cap refused. Keep the one `capacity` wait reason.
- K5 Invites: the cap is a fact about this PC stored in a git-tracked file every checkout shares. A change needs a commit on main, since the land gate refuses `issues/` files on a leaf branch. The alternative is a map beside `max_active` in `~/.akrogon/config.yaml`, where one file shows the whole split. The operator named the repo file, so I follow that and flag it.
- K6 Invites: caps per phase or per epic, and a priority key. Refuse them until a case needs one.
- K7 Unchanged: lowering a cap stops no running leaf, and a leaf with a live seat still passes (`!live`, src/next.ts:415).

## 2. The priority idea

- C1 Feasible: yes. It is one sort of the repo list in `sweepAll` (src/next.ts:790).
- C2 It acts in only one place. Repos compete for slots only in `akrogon next --all` run outside a repo. Inside a repo `--all` sweeps that repo alone (src/next.ts:1439). Nothing else starts a leaf that never ran (see 3).
- C3 Not needed once caps exist. When the repo caps add up to the machine cap or less, the machine cap never refuses anyone. Each repo fills its own share and no cross-repo order exists to decide.
- C4 It works against the cap. A strict priority gives every contested slot to the top repo, so a low repo starves whenever the top one has work. That is the problem caps solve.
- C5 Mental load: a priority number means nothing alone. To predict who gets a slot the operator must compare it with the number in every other repo's file, and ties need a further rule. A cap is read alone: "framework runs at most 6".
- C6 A priority already exists and is unstated: the order of `repos` in the machine config.
- C7 Warmer option: caps only. For slots that are still contested (caps add up above the machine cap, or a repo has no cap), the leaf that has waited longest goes first. The `capacity` wait row in `issues/timings.jsonl` already records when each leaf was refused.

## 3. Today's order when a slot frees

- T1 Nothing starts a never-started leaf on its own. A leaf refused for capacity gets no tab and no worktree (`allocate` returns before `ensureWorktree`, src/next.ts:415-416).
- T2 The automatic passes skip it. `next --wake` and `--resume` sweep only leaves that are merged or hold a tab or worktree (src/next.ts:1442-1456). `akrogon listen` runs `next --wake` on turn end (src/listen.ts:93).
- T3 A landed leaf starts only the leaves of its own repo that it blocked (`landedWake` to `dispatchDependents`, src/next.ts:1237-1265).
- T4 So a freed slot stays empty until someone runs `akrogon next`. docs/use/park-pause-stop.md:39 says the same.
- T5 Order inside that pass: repos in `repos` map order of the machine config (`Object.entries(global.repos)`, src/next.ts:130), merged leaves of all repos first, then the rest repo by repo (`sweepAll`, src/next.ts:790-800). Inside a repo: merged first, then most waiting dependents (`sweep`, src/next.ts:830-836). The first repo in the map takes every free slot before the second is looked at. Waiting time plays no part.

## 4. Recommended shape

Add the optional repo key `max_active` and check it in `allocate` next to the machine cap, with one count function returning both numbers and refusal text that names the cap that refused. Add no priority key. Tell the operator to set repo caps that add up to the machine cap or less, which removes cross-repo order as a question, and print the split in one status line (for example `framework 4/6, akrogon 2/3, machine 6/9`) so an oversubscribed setup is visible. If A also builds the refill the operator's "oldest one waiting" implies, make it one step in the existing wake pass: after a leaf leaves the count, start the longest-waiting `capacity` leaf that fits both caps. Without that refill, the order question changes nothing, because per T1 to T4 no slot is refilled automatically today. Decide the refill first, since it is the larger change and the cap works without it.
