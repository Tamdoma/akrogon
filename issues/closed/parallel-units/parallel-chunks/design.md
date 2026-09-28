# Design: parallel-chunks

## Binding decisions, verbatim
### wave-shape Q1: How does B know which units may run together?
Operator, 2026-09-27: "1a, 2a, 3a". Cap: "Cap 3".
A. Before delegating, B records in each brief's section 4 the chunks that must land first, the paths it owns, and any shared test resource or consumed output. B runs up to 3 chunks at once whose prerequisites have landed and whose edits and verification are independent, and runs them one at a time when unsure. No plan-issue change. Foreclosed: an `after:` field in plan.md.

### wave-shape Q2: How does a worker's result come back to the lane?
A. B commits the lane before each wave. Each worker commits its chunk in its own worktree and returns the commit ID with its report. B cherry-picks results one at a time and runs lane changed tests after each. On a conflict B aborts the pick, keeps the worker commit, and resolves it or delegates only the remainder. Foreclosed: patch apply without worker commits.

### wave-shape Q3: Where do worker worktrees live?
A. `<lane>/issues/worktrees/<slug>-u<N>`, detached at the lane head, removed after the result lands. That path is inside pi's parent root (`~/.pi/agent/extensions/tamdoma-subagents/tools.ts:96-98`, no confirm dialog) and gitignored by `src/init.ts:54-55`, so `requireClean` (`src/phase.ts:253`) passes. After a crash B inspects and resumes a retained worktree. Foreclosed: `<lane>/.akrogon-units/`, and sibling worktrees that need a pi confirm dialog.

Applied as `<lane>/<worktree_root>/<slug>-u<N>` with `worktree_root` from `akrogon config`. `init` ignores it only when it is inside the repo (`src/init.ts:53-55`, `src/config.ts:29`), so the prose says so, and removal before `akrogon phase` protects the phase call either way (B, C).

Reason for all three: A, B and C agreed after rebuttals. It is the fewest moving parts with git-native isolation.

### Off route (chart)
Seat effort stays max. No configurable cap, no port of `packet-parallel-policy.ts`, no shared-worktree parallelism. The pi-extensions concurrency change is Tamdoma/pi-extensions#4.

## Standing design
/home/ivan/.claude/skills/chart-issues/assets/standing-design.md
- Real invocation: the done-criterion 3 scenario runs real git in a temp repo, with no mocks. Its transcript is the artifact.
- Negative and edge cases: a conflicting cherry-pick, and a chunk whose prerequisite has not landed stays out of the wave.
- No vanity tests: this leaf changes skill prose, so no `bun test` asserts wording.
- No auth, secrets, browser flow or credentials apply.

## Leaf architecture
Owned: `skills/implement-issue/SKILL.md` (lines 3, 21-23, 37, 45 and the check.fix worker sentence), `skills/implement-issue/worker-protocol.md` (launch and return, failure ownership), `skills/implement-issue/brief-template.md` (section 4), `docs/guide/phases.md:87`, `skills/AREA.md:21`.
Rules to express:
- Scope: leaf passes that delegate (implement, and check.fix before the last round). Inline, standalone and the last-round self-repair stay as they are.
- Wave: at most 3 chunks with landed prerequisites and independent edits and verification. When in doubt, run it alone.
- Before a wave, B commits pending lane edits when there are any, and otherwise reuses HEAD. No empty commits (B). Workers commit only their chunk and return the commit ID with the four report contents.
- B cherry-picks one at a time, runs lane changed tests after each, then removes that landed worktree. Every worker worktree is gone before the full suite, checks and `akrogon phase` (B).
- A conflicting pick is aborted and its worker worktree kept until the remainder lands, so the commit stays reachable (C).
- Code may be read and edited in the leaf worktree and its worker worktrees (SKILL.md:21-23).
- A fresh worker worktree lacks installed dependencies. The worker installs them before its changed tests.
- SKILL.md:45 "commit the code on the leaf branch" commits any remaining edits on top of the wave commits, and no empty commit (B).
- The done-criterion 3 scenario script is temporary and deleted. Only its transcript goes in the report (C).
Excluded: `plan-issue`, `src/` command code, config keys, `tamdoma-subagents`.
Dependencies: no leaf prerequisite. Running 3 workers at once needs Tamdoma/pi-extensions#4. Until it lands, pi runs one child at a time, extra spawns queue (`manager.ts:1238`), and waves run serially with the same results. The prose can merge first (B, A).
