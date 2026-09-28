# Review A: parallel-chunks

Base: `755babc1e1c4f0e539c78562f38771d899f30d2a`. Reviewed head: `0c8352f473a7b3538ce39498e2f3fc7c806fbc8f` on `parallel-chunks`. Worktree clean.

Debate was off (`debate: "no"`); no positions-A/rebuttal-A expected. Diff: 5 prose files, 13 insertions, 13 deletions.

## Criteria evidence

- C1: worker-protocol.md launch-and-return states the wave rule with literal cap 3, landed prerequisites, independence, run-alone-when-unsure, detached worktree at `<lane>/<worktree_root>/<slug>-u<N>`, checkpoint-or-HEAD with no empty commit, commit-ID return, serial cherry-pick, per-pick changed tests, per-pick removal, all gone before full suite/checks/`akrogon phase`. Failure ownership covers `--abort`, kept worktree, resolve-or-remainder, crash resume. brief-template.md section 4 carries the record. SKILL.md scope and check.fix sentences name the delegated-leaf scope and exclusions. `grep -rniE 'sequential|one worktree|in this worktree' skills/ docs/` returns zero hits; the remaining "one after another" phrase is scoped to standalone, matching D6.
- C2: `docs/guide/phases.md:88` and `skills/AREA.md:21` state the same rule (waves up to 3, own worktree, cherry-pick). One line each per checklist 5.
- C3: report transcript shows checkpoint hash, two `worktree add --detach`, two worker commits, two serial cherry-picks, two `worktree remove`, conflicting pair with `cherry-pick --abort`, empty `git status --porcelain` on the lane, kept worktree `git log --oneline -1` listing its commit. Residue check documented; nothing added under `tests/` (diff stat confirms).
- C4: `bun run format` rerun in this worktree, exit 0, all files unchanged. `bun run typecheck` rerun, exit 0. `bun test` not rerun: the diff is prose-only, and the report pastes 306 pass / 0 fail. Per the review rule, checks rerun only for code change, missing evidence, or a specific concern; none apply.

## Live-surface claims verified

- `.gitignore:1` contains `issues/worktrees/`; `src/init.ts:53-55` adds the worktree_root entry only when it resolves inside the repo; `src/config.ts:29` defaults `worktree_root` to `issues/worktrees`. Prose claim accurate.
- pi parent-root no-confirm rule confirmed at `tamdoma-subagents/tools.ts:96` (`isSameOrDescendant(manager.parentRoot, cwd)`). Prose claim accurate.
- All paths named by `skills/AREA.md` (the five edited docs plus the reference index) exist from the repo root.
- `docs/reference-index.md` pointers unchanged and still valid for the skills area.

## Report accuracy

"Sequentially in the leaf worktree" for this pass is accurate: the pass ran under the pre-change protocol and pi serializes spawns until pi-extensions#4 (plan open limitation). The temp-lane `.gitignore` deviation is disclosed in the transcript note and mirrors the real repo; acceptable.

## Findings

None.

## Verdict

`ready`. All four criteria verified by diff inspection, live-surface checks, grep sweep, and two rerun blocking checks.

## Merge pass

Rebase target: `origin/main` at `de77b034720ed6377a702fe09feba26de540d447`. Prior reviewed head `0c8352f473a7b3538ce39498e2f3fc7c806fbc8f`; rebased head `86edcc3` (clean rebase, no conflicts, so no range-diff required). Post-rebase `AKROGON_BASE` = `de77b03...`.

Checks at rebased head:

- `bun run format` → exit 0, all files unchanged.
- `bun run typecheck` → exit 0.
- `bun test` → 306 pass, 0 fail, 14 files, 98.46s.
- `bun test --changed=de77b03...` → 5 changed files, no test files affected, 0 pass / 0 fail.

B Nits N1 (dangling `scripts/observe.ts` pointer, pre-existing at base) and N2 (stale wording in point-in-time root docs) are out-of-scope per B's own reasons; nothing reusable turned into a `learnings/` entry.
