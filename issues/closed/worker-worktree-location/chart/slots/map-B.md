# Worker worktree location: independent map B

The reported nested location follows today's worker protocol. This is primarily an instruction defect, not evidence that the seat ignored the rule. Keep the destination in `skills/implement-issue`, but define it as resolving worker paths from the registered repository and configured worktree root, with the leaf HEAD as the starting commit. The pi admission fix has already merged.

Read-only research on 2026-09-28, akrogon HEAD `1607ee7fbf4a2362340c2d6b8de4257d72684ec6`. No worker was spawned or worktree changed.

## Evidence references

Transcript references below mean physical JSONL lines:

- **T1**: `/home/ivan/.pi/agent/sessions/--home-ivan-Work-infra-akrogon-issues-worktrees-create-peer-panes--/2026-09-28T13-27-25-703Z_01a0e832-e907-743e-bc31-613ada9741b3.jsonl`.
- **T2**: `/home/ivan/.pi/agent/sessions/--home-ivan-Work-infra-akrogon-issues-worktrees-owner-defect-stop--/2026-09-28T13-27-29-001Z_01a0e832-f5e9-7359-8842-9484c4680d92.jsonl`.
- **PX**: `/home/ivan/.pi/agent/extensions/` for extension file references.

## Findings

- **F1 · The requested outcome conflicts with the installed rule.** #37 expects workers beside leaf worktrees under the registered repository's worktree store (`issues/chart/worker-worktree-location/INTAKE.md:19-36`). `skills/implement-issue/worker-protocol.md:11` instead explicitly specifies `<lane>/<worktree_root>/<slug>-u<N>` and says nesting avoids pi confirmation. The installed pi skill resolves to this repository file. `SKILL.md:21-25` distinguishes the authoritative registered root from leaf/worker checkouts but does not supply a different worker-path formula. Remove the contradictory formula and obsolete rationale, rather than adding another instruction above them.
- **F2 · owner-defect-stop used the documented nested formula.** T2:9 identifies the seat cwd as the leaf worktree. T2:35 contains the worker protocol. T2:42 describes creating the worktree at the lane path. T2:48 runs `git worktree add --detach issues/worktrees/owner-defect-stop-u1 HEAD`; T2:50 supplies the resulting nested absolute cwd to spawn. T2:60-63 repeats this for unit 2. T2:61 shows Git accepted it and started unit 2 at leaf commit `758039c`, including unit 1. The evidenced reason is following the lane-relative protocol, whose stated rationale was avoiding confirmation. There is no need to infer an intentional workaround after seeing the other seat stall.
- **F3 · create-peer-panes used a different anchor after reading the same rule.** T1:9 contains registered root `/home/ivan/Work/infra/akrogon`, configured `issues/worktrees`, and leaf cwd. T1:48 contains the nested protocol. T1:53 nevertheless creates `/home/ivan/Work/infra/akrogon/issues/worktrees/create-peer-panes-u1` with `--detach ... HEAD`; T1:55 spawns with that sibling cwd, and T1:56 eventually records a running child. The visible record establishes the choice but gives no explicit explanation for deviating from the nested formula. Do not invent one. #36 records the intervening outside-parent confirmation on precisely that path (`issues/chart/stuck-seat-recovery/INTAKE.md:93-102`, `:115-127`).
- **F4 · The confirmation rationale is obsolete in current extension source.** `PX/tamdoma-subagents/tools.ts:91-95` canonicalizes the requested cwd, admits descendants or same-repository worktrees, and otherwise throws without a dialog. `git-worktrees.ts:28-63` checks working-tree membership and equal canonical absolute common directories. The requested open leaf has moved to `PX/issues/closed/seat-subagent-freezes/same-repo-worktree-cwd/`; its brief specifies no confirmation in any session (`brief.md:3-4`, `:13-19`). `akrogon status same-repo-worktree-cwd` run in PX returned `phase: merged`, consistent with `state.yaml:1-2`. Sibling parallel admission has an existing test (`tamdoma-subagents/tools.test.ts:496-527`). This proves the current source/record, not that every already-running pi process has reloaded it.
- **F5 · Akrogon resolves lifecycle worktrees from the registered root.** The default is `issues/worktrees` (`src/config.ts:29`), registration is matched by Git common directory (`:97-116`), and `readRepo` canonicalizes the registered checkout (`:83-88`). Leaf worktree paths use `resolve(repo.root, repo.config.worktree_root, slug)` (`src/next.ts:231`, `:290`). Effective config supplies the selected `repo` and global `repos` mapping (`src/config.ts:139-144`). Workers can derive the same store from `repos[repo]` and `worktree_root`; the leaf's `git rev-parse --show-toplevel` alone is the wrong anchor. Keep starting commit selection separate from destination resolution.
- **F6 · Filesystem nesting changes cwd-based ownership.** `inWorktree` uses path containment, not Git repository identity (`src/next.ts:166-171`, `src/config.ts:92-94`). `paneOwners` uses it (`src/next.ts:656-665`), as do active-capacity and tab-recovery logic (`:264-278`, `:292-296`). Thus a pane cwd inside a nested worker can match the leaf by containment; a sibling worker cwd does not. This is a conditional consequence, not a measured misdispatch: these pi children are subagents, and their transcripts do not establish separate Herdr panes. Do not expand ownership to every worktree sharing the common directory, which would conflate different leaves.
- **F7 · Git accepts the location, but does not prescribe this policy.** The Git manual describes linked worktrees sharing repository metadata with separate HEAD/index and supports detached creation at a supplied commit. It does not state a general ban on filesystem-nested worktrees. Its submodule caveat is about submodules, not this same-repository layout. T2:61 is direct evidence that Git accepted this nested worktree. [git-worktree](https://git-scm.com/docs/git-worktree). A targeted search, `site.git-scm.com "nested" "worktree"`, found no stronger official rule prohibiting this layout. The reason to change it is the operator's location contract and predictable ownership/cleanup, not “Git cannot do that.”
- **F8 · Cleanup and resume already belong to B.** The protocol removes workers after their commits land, retains incomplete/conflicted worktrees, and resumes them after a crash (`skills/implement-issue/worker-protocol.md:11`, `:17`, `:25`). Full-suite/phase handoff requires all workers removed (`SKILL.md:45`). CLI cleanup removes the recorded leaf worktree, not an inventory of worker paths (`src/next.ts:561-566`). Sibling layout does not require a new garbage collector. Keep those existing responsibilities explicit.

## Material forks, in decision order

### Q1 · Where is the worker path anchored?

- **A (recommended): The configured store under the authoritative registered root.** Resolve `worktree_root` with the same semantics as lifecycle worktrees, then append `<slug>-u<N>`. With the default, `/repo/issues/worktrees/<slug>` and `/repo/issues/worktrees/<slug>-u1` are siblings. Create the worker from an explicit committed leaf HEAD, not registered main. This meets #37 and the now-supported same-repository admission rule (F1, F4–F5).
- **B: Keep the leaf-relative nested store.** This preserves current protocol behavior, but rejects the reported expected outcome and retains a workaround for a confirmation rule that has shipped a fix (F1–F4).

Pitfalls: Do not hardcode `issues/worktrees` when config selects another root. Absolute configured roots must remain absolute. “Inside a repo means ignored” is false as a general rule: initialization only adds the configured store to `.gitignore` when it is a descendant of the root (`src/init.ts:51-60`). Detached creation must use the leaf's current committed work, including prior waves.

### Q2 · Is a precise skill rule enough, or should akrogon create every worker directory?

- **A (recommended): Correct the single canonical worker-protocol rule and make its inputs explicit.** B resolves an absolute worker path once and uses it for creation, the sub-brief/spawn cwd, inspection and removal. Validate behavior with custom/default roots and successive waves. The observed root cause is an instruction that explicitly selects the undesired directory, not a missing worker allocator (F1–F3).
- **B: Add a CLI/helper that allocates worker worktrees and supplies the cwd.** This removes path assembly from the agent, but widens the destination into code and requires an interface for unit identity, retained worktrees and cleanup. Choose only if the operator wants command-owned worker allocation rather than the bounded rule fix.

Pitfalls: A prose fix cannot guarantee every probabilistic seat always complies. Judge an observed path/create/spawn/remove walkthrough, not a test demanding an exact sentence. Keep standalone workers sequential in the current checkout, which is an explicit separate contract (`worker-protocol.md:7`, `:11`; `SKILL.md:61-63`).

### Q3 · What happens to a worker retained at the old nested path?

- **A (recommended): Preserve and finish that recorded worker, then use the new canonical path for newly created units.** Existing recovery rules retain incomplete work and conflicts (F8). This prevents a location change from discarding edits or spawning the same unit twice. Any legacy cleanup is an attended operational step, not a new lifecycle service.
- **B: Relocate all retained workers before resuming.** This produces immediate uniformity but requires coordinating the running child's cwd, brief references and Git metadata. It is more work than the reported defect requires.

Pitfalls: Never remove an occupied path merely to satisfy the new naming rule. The `<slug>-u<N>` namespace may collide with an actual leaf named that string or a retained unit. Inspect the registered worktree and recorded task before reuse, and report a concrete collision rather than force-overwriting it. Keep the existing naming scheme unless a real collision requires a separate decision.

## Practitioner questions and bounded verification

- **P1 · Can B name both roots without guessing?** Use `repos[repo]` for the authoritative root and the actual leaf cwd/HEAD for the work being delegated. Walk through a non-default relative store and an absolute store, not only this repository's default (F5).
- **P2 · Is the selected commit the leaf's landed wave state?** T2:61 provides the positive example: unit 2 starts at `758039c`, not the original main commit. Changing the path must preserve that behavior.
- **P3 · Does a fresh pi session admit siblings without interaction?** Current code and its parallel-spawn test support this (F4). A old running process is a rollout question, not permission to restore nesting or teach watch-issues to answer dialogs.
- **P4 · Does removing a worker leave its parent leaf intact, and does a failed worker remain resumable?** Verify both outcomes against the existing protocol (F8). No polling or age-based cleanup is needed.

## Destination and locks

Keep the repository destination `akrogon/skills/implement-issue`. Clarify the outcome to: “New delegated leaf workers use the registered repository's configured worktree store, consistently across creation, spawn and cleanup, while starting from the leaf's committed HEAD; standalone and retained-work recovery remain intact.” This changes the erroneous rule rather than blaming the nested seat for following it.

No evidence here requires src/next.ts ownership changes or another pi admission leaf. The latter is already merged (F4). The restart-hung-seat Taken section explicitly applies admission in every session, removes confirmation, rejects restart/time-limit machinery and leaves watch-issues Never unchanged (`issues/chart/stuck-seat-recovery/forks/restart-hung-seat.md:27-30`). Preserve those locks. No clocks, polls or watchdogs are proposed.
