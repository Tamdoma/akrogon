Paths are relative to akrogon main unless absolute. Sources read 2026-09-27. Changes apply only to delegated leaf implementation. Inline, standalone and effort stay unchanged.

## Q1

Recommend B-owned waves, with predecessors and owned paths recorded in existing brief section 4. Alternative: put a structured dependency graph in the plan. Pitfall: verification dependencies matter even with disjoint edits. Evidence: `/home/ivan/Work/infra/tamdoma/framework/issues/open/satellite-network-simplify/satellite-render/satellite-build/implementation/brief-4.md:21` consumes renderer outputs and expectations. `skills/plan-issue/SKILL.md:57` already requires genuine ordering dependencies, so leave it unchanged.

Exact prose: replace the sequential delegation clause at `skills/implement-issue/SKILL.md:37` with “For delegated leaf implementation, B runs waves of at most two units whose prerequisites have landed and whose edits and verification are independent, using the worker protocol.” Append at `skills/implement-issue/brief-template.md:21`: “For delegated leaf implementation, name prerequisite units, owned edit paths, and any shared interface or test resource that requires ordering.”

## Q2

Recommend worker commits, serial cherry-picks. Alternative: binary patches, which need extra handling for untracked files and recovery. Pitfalls: dirty parent prerequisites disappear from new checkouts, and clean cherry-picks can still break interfaces. Current `skills/implement-issue/SKILL.md:45` postpones commits until completion. [Git worktree documentation](https://git-scm.com/docs/git-worktree) confirms checkout uses a commit.

Exact replacement for `skills/implement-issue/worker-protocol.md:11`, scoped to delegated leaf implementation: “B commits accepted lane edits before each wave and creates each worker worktree from that HEAD. Each worker commits only its unit and returns its commit ID, report and changed-test evidence. B cherry-picks accepted results one at a time, resolves integration defects, removes completed worker worktrees, and runs lane changed tests before the next wave. Interrupted workers retain their worktree and resume only the remainder.” Preserve existing report judgment and final full-suite rules.

## Q3

Recommend nested `<lane>/.akrogon-units/<unit>` worktrees. Alternative: sibling worktrees with explicit Pi approval. Pitfalls: recursive scanners, missing dependencies, accidentally staging nested repositories. Pi `~/.pi/agent/extensions/tamdoma-subagents/tools.ts:95–103` admits descendants automatically but requires UI outside. `src/phase.ts:251–254` refuses leftover untracked directories.

Exact append at `skills/implement-issue/worker-protocol.md:7`: “For delegated leaf implementation, use detached worktrees under `<lane>/.akrogon-units/<unit>`, provision required dependencies, and bind brief paths and commands to that worker root. Never stage the worktree container. Remove completed worktrees and the empty container before lane checks and handoff.” At `skills/implement-issue/SKILL.md:21,23`, extend permitted code locations to “the leaf worktree and its delegated worker worktrees.”
