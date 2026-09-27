# Plan: completion-dependents

Direct synthesis. `debate: no`, no positions or rebuttals. Built from `brief.md`, locked `design.md`, and live `src/next.ts`, `tests/next.test.ts`, guide files.

Concrete case: `first` merges in repo X. Repo X also holds ready `loose` and `second` with `blocked-by: [first]`. Repo Y holds ready `other`. After `first` completes through any of the three paths, only `second` gets a tab. `loose` and `other` get no tab and no attempts.

Fuzzy terms fixed: completion means `dispatchLeaf` returns `'completed'` (leaf in `merged` phase). Sweep means `sweepAll` across all repos. Dependent means same-repo leaf whose `blocked-by` includes the completed slug. Same-repo means `discover(repo)` for the completed leaf's repo only.

## Read-first

- `src/next.ts` (completion sites, `dispatchLeaf`, `sweep`, `sweepAll`)
- `tests/next.test.ts` (chaining tests near `tab_closed` and `merged phase closes tab`)
- `tests/helpers.ts` (fixture, `leaf`, `cli`, `fakeHerdr`)
- `tests/fake-herdr.ts` (Herdr boundary)
- `docs/guide/next.md` (completion and Manual dispatch lines)
- `docs/guide/limits.md` (Folder targeting line)
- `docs/reference-index.md` (area map)

## Decisions

D1: Add `dispatchDependents` in `src/next.ts` next to `sweep` and `sweepAll` with signature `(global, repo, completedSlug, invocation)`. It runs `discover(repo, invocation).leaves.filter((leaf) => leaf.state['blocked-by'].includes(completedSlug))` and passes the result to existing `sweep`.
D2: Replace `sweepAll` at three completion sites only: targeted single leaf (`selection.leaves.length === 1`), `tab_closed` owner, pane-hook owner. Keep `sweepAll` for `next --all` outside a repo. Keep multi-leaf selection sweep and `next --all` inside a repo unchanged.
D3: Capture `completedSlug` from the pre-dispatch identity (`selection.leaves[0].state.slug` or `owners[0].leaf.state.slug`) before calling `dispatchLeaf`, because `completeOwner` may move the completed leaf to `issues/closed`.
D4: Pass dependents through existing `sweep` to `dispatchLeaf` with `explicit=false`. Keep all gating there (dependencies, capacity, `hand_built`, `failed`). Add no new checks.
D5: Tests run the real CLI through `tests/helpers.ts` and `tests/fake-herdr.ts`, no new mocks. One new two-repo test covers all three completion paths with a fresh fixture per path. One new negative test covers a dependent with a second unmerged blocker. Rename only the `tab_closed` chaining title that says `sweeps`, because it misdescribes the new behavior.
D6: Edit `docs/guide/limits.md` and the completion plus Manual dispatch lines of `docs/guide/next.md` to state a completion starts only same-repo dependents and other leaves need a manual `akrogon next`. Qualify any `later sweeps` wording to manual passes. Do not touch the `Startup also runs a sweep` sentence in `next.md`.
D7: Accept repeat dependent dispatch when a merged leaf still sits in `issues/open` (`dispatchLeaf` returns `'completed'` again). Rely on `allocate` idempotence. Add no dedup.

## Interfaces

- New: `dispatchDependents(global: GlobalConfig, repo: Repo, completedSlug: string, invocation: Invocation): Promise<void>` in `src/next.ts`.
- Reused: `discover(repo, invocation): Inventory`, `sweep(global, repo, leaves, invocation): Promise<void>`, `dispatchLeaf(global, repo, leaf, false, invocation): Promise<DispatchOutcome>`.
- Data: `State['blocked-by']: string[]` selects dependents. Completed leaf repo comes from `selection.repo` or hook `owners[0].repo` already in hand.

## Acceptance criteria

AC1: The three completion sites in `src/next.ts` no longer call `sweepAll`. Each dispatches only same-repo leaves whose `blocked-by` includes the completed slug through `dispatchLeaf` checks.
AC2: New test with two repos: repo X has `first`, ready unrelated `loose`, and dependent of `first`; repo Y has a ready leaf. After `first` merges, each completion path (targeted `next first`, `tab_closed` hook, pane hook) gives the dependent a tab and gives `loose` and the repo-Y leaf no tab and no attempts.
AC3: New negative test: a dependent naming a second unmerged leaf stays unallocated after the first blocker completes.
AC4: Existing chaining tests `a closed tab hook from a merged leaf sweeps and starts the next leaf` and `merged phase closes tab on typed next and starts the dependent` still pass, with a title rename only where `sweeps` now misdescribes.
AC5: `docs/guide/limits.md` and `docs/guide/next.md` state a completion starts only its dependents in the same repo and other leaves start only through manual `akrogon next`. No guide line says later sweeps pick up other open leaves after a completion. The startup sentence in `next.md` is untouched.
AC6: `bun run format`, `bun run typecheck`, `bun test` pass.

## Checklist

1. `src/next.ts`: add `dispatchDependents` per D1, replace three sites per D2 with slug captured per D3, route through `sweep` per D4. Covers AC1.
2. `tests/next.test.ts`: add two-repo three-path test per D5 covering AC2; add second-blocker negative test covering AC3; keep both chaining tests green covering AC4; rename only the `sweeps` title.
3. `docs/guide/limits.md`: state dependent-only completion rule and manual start for the rest. Covers AC5.
4. `docs/guide/next.md`: state dependent-only completion rule in completion and Manual dispatch lines, qualify `later sweeps` to manual passes, leave startup sentence alone. Covers AC5.
5. Human docs affected: `docs/guide/limits.md` gets the dependent-only completion rule.
6. Human docs affected: `docs/guide/next.md` gets the dependent-only completion rule in completion and Manual dispatch lines.
7. Agent docs affected: none, no skill workflow changes.
8. Run verification below. Covers AC6.

## Verification

- `grep -n sweepAll src/next.ts` shows only the function definition and the `next --all` outside-a-repo path.
- `grep -rn "Later sweeps can consider other open leaves" docs/guide/` shows no unqualified line; both guide files mention dependents-only completion plus manual `akrogon next`.
- `bun run format` passes.
- `bun run typecheck` passes.
- `bun test tests/next.test.ts` passes, including the two new tests and the two existing chaining tests.
- `bun test` passes.

## Open limitation

A merged leaf still under `issues/open` returns `'completed'` on every later pass for that leaf, so its dependents are re-dispatched each time. `dispatchLeaf` and `allocate` make this idempotent, but it is extra work, not a single fire-and-forget chain.

## Dependencies

None. Execution needs no ordering.

## Credentials

None. Brief and design name no variables, so no `.env` presence check applies.
