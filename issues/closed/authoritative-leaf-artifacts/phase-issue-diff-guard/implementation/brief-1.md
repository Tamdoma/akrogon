# Brief 1: split requireCodeOnly and gate every phase move on issues/ diffs

## 1. Goal

`akrogon phase` must refuse any move whose leaf has a recorded worktree when the branch's net diff against the configured target touches `issues/`. Today that check runs only when entering `check.review` (src/phase.ts:118). Split it so the `issues/` refusal runs on every move with `state.worktree` set, while the empty-branch refusal stays at `check.review` only. Plan decisions D1, D2, D3, D4.

## 2. Numbered acceptance criteria

1. `requireCodeOnly` in `src/phase.ts` is replaced by two exported helpers: `requireNoIssueFiles(repo: Repo, worktree: string, leafPath: string)` throwing `Issue files on leaf branch belong in ${leafPath}:\n${files}` when `git diff --name-only <target(repo)>...HEAD -- issues` is non-empty, and `requireNonEmpty(repo: Repo, worktree: string)` throwing the unchanged `Empty leaf branch: no changes against ${target(repo)}` when the unrestricted diff is empty.
2. In `transition()`, after the existing `requireClean` line and before any `saveState`/`commitMove`: `if (state.worktree !== undefined) await requireNoIssueFiles(repo, state.worktree, leaf.path);` then `if (requested === 'check.review' && state.worktree !== undefined) await requireNonEmpty(repo, state.worktree);`. `transition`'s signature is unchanged.
3. New test T1: leaf `stray` at `plan.positions` with a worktree whose branch commits `issues/open/issue/stray/positions-B.md`; `phase stray plan.rebuttal --slot B` exits non-zero, stderr contains the absolute leaf path `resolve(f.root, 'issues/open/issue/stray')` and `positions-B.md`, and state keeps `phase: 'plan.positions'`, `done: []`. After `git reset --hard HEAD~1` in the worktree the same move prints `recorded` and `done` is `['B']` (empty planning branch is not refused).
4. New test T2: leaf `empty-plan` at `plan.synthesis` with a clean empty worktree branch; `phase empty-plan implement` prints `moved implement`.
5. New test T3: leaf `recover` at `failed` with a worktree whose branch carries an `issues/` file; `phase recover implement` is refused with the leaf path in stderr and phase stays `failed`. Leaf `no-wt` at `failed` with no `worktree` field; `phase no-wt implement` prints `moved implement`.
6. The existing handoff test (~tests/phase.test.ts:127-155) and empty-branch test (~:780-795) pass unchanged.

## 3. Read-first list

- `src/phase.ts` — `transition()` guard block at :117-118, `requireCodeOnly` at :139-147, `requireClean` at :133.
- `tests/phase.test.ts` — copy the worktree/commit pattern from the handoff test at ~:127-155 (`git worktree add -b`, `mkdirSync` + `writeFileSync` under `issues/`, `git add issues`, `git commit`, `git reset --hard HEAD~1`).
- `tests/helpers.ts` — `fixture()`, `leaf(f, slug, phase, extra)`, `cli(f, args)`; `leaf` writes state.yaml under `issues/open/<container>/<slug>` and returns its path.
- `src/config.ts` — `target(repo)` at :111 returns `origin/main`; `rebuttal` defaults true (:30), so `plan.positions → plan.rebuttal` is the legal move in fixtures.
- `src/state.ts` — `Leaf = { path, state }` (:40); `leaf.path` is the authoritative folder.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`

## 4. Change list and needed interfaces

- `src/phase.ts`: delete `requireCodeOnly`; add `requireNoIssueFiles` and `requireNonEmpty` (both exported, same style as `requireClean`); rewire the two call lines per criterion 2. Keep the `Issue files on leaf branch` and `Empty leaf branch` message prefixes — existing tests assert them.
- `tests/phase.test.ts`: add tests T1, T2, T3 per criteria 3-5. Place them near the existing handoff/empty-branch tests. Reuse existing imports (`command`, `mkdirSync`, `writeFileSync`, `resolve`, `readState`, `bytes`); no new imports should be needed.
- Fixture note: worktree branches are created with `git worktree add -b <name> <worktree>` from `f.root`, so they start at the initial commit which equals `origin/main`; an `issues/` commit on that branch is the net diff the guard reads.

## 5. Do-not, reasons and exceptions

- Do not change `transition`'s signature, `commitMove`, `requireClean`, `src/next.ts`, or any file outside the two listed — the design excludes them and the diff-scope check enforces it.
- Do not weaken or edit existing tests — they are the regression surface (criterion 6).
- Do not add autocorrect, file moves, or an artifact-existence gate — foreclosed by the locked design.
- Do not touch prose/docs — that is brief-2's scope.
- Return a mismatch with evidence to the plan author instead of changing scope or an interface; the exception is a revised brief from B authorizing that change.

Restated: scope is exactly src/phase.ts + tests/phase.test.ts; any conflict with these criteria comes back as a mismatch, not a local decision.

## 6. Ordered steps

1. Write T1, T2, T3 in tests/phase.test.ts (criteria 3-5). Run the changed-test command; expect T1 and T3 to fail (move not refused) and T2 to pass — paste this red evidence.
2. Apply the src/phase.ts split and rewiring (criteria 1-2).
3. Rerun the changed-test command; expect all green including the unchanged existing tests (criterion 6) — paste this green evidence.
4. `grep -rn requireCodeOnly src tests` must be empty.

Advisory size: 2 files, under 15 turns.

## 7. Commands

```bash
export AKROGON_BASE=e624357e825e21b38a15c07a435b1ff066c6ba38
bun test --changed="$AKROGON_BASE"
```

Run from the worktree root. Do not run the full suite; B does that.

## 8. Done-when, evidence and report

All six criteria hold; red-then-green output pasted; `requireCodeOnly` gone. Scenarios use the fixture's temporary repositories with real git worktrees and commits; no real panes, GitHub or herdr.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
