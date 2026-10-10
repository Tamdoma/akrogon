# deploy-path, slot C notes

## Q1. How landed akrogon work reaches the running command, skills and plugin

### Pick: (a) dedicated deploy checkout, fast-forwarded by the command after an akrogon push. Root stays a dev checkout.

Reason. The root checkout is three things at once: the dev tree (dirty src/next.ts, tests, skills), the issue-state working tree for akrogon's own leaves (git status shows the command's uncommitted moves under issues/), and the installed artefact (~/.local/bin/akrogon, 10 skill symlinks in ~/.claude/skills, `herdr plugin link <root>/plugin`, all from src/install.ts:15-22,52). Any option that updates the root must first reconcile whatever the operator or the door has in flight there. A separate checkout that nothing edits by hand is always clean, so a fast-forward never fails and never overwrites work. That removes the failure class instead of guarding it.

Shape:
- `install` creates or reuses `<AKROGON_HOME>/deploy` (or `~/.local/share/akrogon/deploy`), a plain clone of the same origin at `origin/<default_branch>`, runs `bun install --frozen-lockfile` there, and points the bin, skill and plugin links at it. install.ts already handles conflicts by printing removal commands (install.ts:35-43), so relinking from the root to the deploy checkout is one run of the existing command.
- After `git push` succeeds in the merged handler (origin/main src/phase.ts:476-486), when `repo.root` is the toolRoot's own repo, the command runs `git -C <deploy> fetch` then `git -C <deploy> merge --ff-only origin/<branch>` and `bun install --frozen-lockfile` when the lockfile changed. It prints `deployed <sha>` or the error. A failure here is reported, not swallowed, and does not undo the merge (the push already landed).
- `akrogon next` and `akrogon status` print one line when `<deploy>` HEAD is not `origin/<branch>` after the fetch the merge turn already does. Same check as option (c), used as the detector rather than the remedy.

Cost. One new directory, one relink per machine, about 40 lines in install.ts and the merged handler, a doc section replacing install.md:37-41 "git pull". Disk: a second checkout plus node_modules. Dev iteration changes: a local edit no longer takes effect until it lands, which is the point. For a local trial the operator can `AKROGON_HOME` or a temporary relink; that is the existing escape, not a new one.

### Rejected

(b) fast-forward the root when clean, warn otherwise. Today it would warn and do nothing: src/next.ts, docs/guide/next.md, skills/chart-issues/assets/questions.md and peer-wait.ts are dirty locally and also changed on origin (git diff --name-only origin/main lists all four), so `--ff-only` refuses. The root is dirty whenever the door or the operator works in it, which is most of the time the command is in use. The "clean" branch of (b) rarely runs and the "warn" branch is option (c). It also keeps the root as the installed artefact, so a half-finished local edit stays live for every seat (the brief's "untested local code on a stale base" case).

(c) warn only. Correct as a sensor, wrong as the remedy: it keeps the operator as the pump. LESSONS.md:18 (2026-09-27) recorded the same lag for the chart door and no guard followed, and the lag recurred at 52 commits. A warning the operator has already ignored once is not a fix. Keep the warning inside (a).

(d) status quo. Measured cost: the eight merge-throughput leaves and two lesson-guards leaves landed today (akrogon log 06:44 to 09:09Z) and framework still runs the 10-07 command; merge is 58% of framework leaf wall time and the fixes for it are inert. Every day without the pull is a day of the busy-window behaviour of 10-08 (bounce rate 31-67%/day since 10-02).

(e) not in the brief, rejected: run the command from the leaf worktree that merged it (`issues/worktrees/<slug>`). Worktrees are swept after merge (merge.md:55), and seats call `akrogon` from PATH (merge-issue SKILL.md:43,45), so there is no stable path.

### Timing, rollback, uncommitted root edits

- Switch timing. Each `akrogon` call is a fresh `bun src/akrogon.ts` run (src/akrogon.ts:1), and a seat reads SKILL.md when its skill is invoked. So a fast-forward takes effect at the next invocation, mid-leaf. That is acceptable when state stays readable across versions. origin/main's state.ts diff adds only optional fields (`started`, `recorded`, `excluded`) and strips `solo` from the saved record; no required field was added. The hold file is new (src/hold.ts under globalHome). So a mid-leaf switch today is safe. The rule for the future: state schema changes stay additive-optional, which the existing zod parse already enforces on read. Do not add "pause seats during deploy"; it adds state for a problem the schema rule removes.
- Plugin. The herdr plugin is linked by path (install.ts:52) and its hooks exec `akrogon` from PATH (plugin/pull.sh, plugin/next.sh), so relinking the plugin to the deploy checkout and relinking the bin are both needed once; afterwards fast-forwards need no herdr restart. Confirm `herdr plugin link` tolerates a relink to a new path; if not, `install` prints the removal step as it does for other conflicts.
- Rollback. `git -C <deploy> reset --hard <previous sha>` plus `bun install`. Record the previous sha in the `deployed` line so the operator has it. No new command; a landing that breaks the command is fixed forward by a leaf, as any other defect.
- Uncommitted root edits (human prerequisite). Someone must decide per file: src/next.ts and its three tests (the `waiting: <slug> on <dependency>` change, docs/guide/next.md) are a feature in progress and should become a leaf or be stashed; questions.md and peer-wait.ts are the chart door's own in-flight edits and belong to A; learnings/LESSONS.md and the two history files are lessons to commit; issues/ changes are the command's own moves and are never hand-reconciled. Under (a) this reconciliation stops being a prerequisite for deployment at all: the deploy checkout does not care what the root holds. It remains a prerequisite for the operator's own `git pull` of the dev tree.

### Evidence

- Primary, 2026-10-10: `~/.local/bin/akrogon -> /home/ivan/Work/infra/akrogon/src/akrogon.ts`; ~/.claude/skills/{chart-issues,...} -> same root; `git status -sb` = behind 52; `git merge-base --is-ancestor main origin/main` true (ff possible); `git diff --name-only origin/main` includes the four dirty files; origin/main changes no issues/ files.
- Primary, code: src/install.ts:11-52 (links and conflict handling), origin/main src/phase.ts:476-486 (push success branch, where the deploy step attaches), src/config.ts:171-172 (`AKROGON_HOME ?? toolRoot`), plugin/herdr-plugin.toml (hooks exec from PATH), origin/main src/state.ts diff (optional fields only).
- Operator material: docs/guide/install.md:37-41 ("The links point back to this checkout. Update it with: git pull"); learnings/LESSONS.md:18, 2026-09-27, stale door checkout, no guard.
- Measured, 2026-10-10 (map C): framework merge phase 58% of leaf wall time since 10-07; akrogon log shows the throughput leaves merged 06:44-08:36Z; `ls src/attempts.ts src/hold.ts` absent locally.
- Model knowledge, no stronger source searched: the "separate immutable deploy tree, dev tree never serves traffic" split is the standard practice behind every release/deploy pipeline. Not cited to a named practitioner.

### Pitfalls and what removes each

- P1 deploy checkout drifts because `bun install` fails after a lockfile change. Removed by running install only on lockfile change, printing the error, and the `next`/`status` line that shows deploy HEAD vs origin.
- P2 a bad landing takes effect immediately for all consumers. Removed by the merge gate itself (checks on the stack top) plus the recorded previous sha for `reset --hard`. Do not add a canary; one operator, one host.
- P3 operator keeps editing the root and expects it live. Removed by install.md replacing "git pull" with "landed work deploys itself; local trials use AKROGON_HOME or a temporary relink".
- P4 two machines. Each runs `install` once; the merge-turn fast-forward only updates the machine that ran the merge. The `next`/`status` line covers the other machine, and `akrogon install` can re-run the fast-forward. Accept this; no sync mechanism.
- P5 the merged handler's deploy step runs while another seat is mid-invocation. Bun reads files at start, so an in-flight process keeps its already-loaded modules; a lazy import during the swap is the only risk. Removed by `git merge --ff-only` being near-atomic per file and by keeping imports static (they are).
- P6 skills linked per directory: a new skill folder on origin (skills/lesson-rule.md is a file, fine; a new skill directory would need a link). Removed by making the deploy step call the same link routine install.ts:11-22 runs, which already enumerates skills/.

### Questions the fork does not ask

- Q-a Should the deploy fast-forward also run on `akrogon next` when deploy HEAD is behind the fetched origin, so a merge done on another machine or by hand deploys here too? Cheap, uses the fetch the turn already does. I would say yes, same ff-only rule.
- Q-b Is framework's own `issues/` state also committed to akrogon's root checkout (the "add issues" commits are local-only moves)? If the root's issues/ state is committed by the command on main and pushed by leaves, the dev checkout being behind also means the issue state view is behind. Not verified; worth one look before the handoff.
- Q-c Who owns the dirty src/next.ts `waiting` change right now: is it a leaf, or the operator's experiment? It must not ride into the deploy tree uncharted.
