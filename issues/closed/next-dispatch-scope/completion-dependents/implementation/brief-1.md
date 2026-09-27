# Brief-1: dependent-only completion dispatch

## 1. Goal

Make `akrogon next` completion passes start only same-repo dependents. Covers plan D1, D2, D3, D4, D7.

## 2. Numbered acceptance criteria

1. `src/next.ts` defines `dispatchDependents` that selects same-repo leaves whose `blocked-by` includes the completed slug and passes them to `sweep`.
2. The three completion sites (targeted single leaf, `tab_closed` owner, pane-hook owner) call `dispatchDependents`, not `sweepAll`. `next --all` outside a repo still calls `sweepAll`.
3. New two-repo test: repo X has `first`, ready `loose`, dependent `second` (`blocked-by: [first]`); repo Y has ready `other`. After `first` merges, each path (targeted `next first`, `tab_closed` hook, pane hook) gives `second` a tab and gives `loose` and `other` no tab and no attempts.
4. New negative test: dependent naming `first` plus a second unmerged leaf stays unallocated after `first` completes.
5. Existing chaining tests still pass. Only rename the `tab_closed` title if `sweeps` misdescribes.

## 3. Read-first list

- `src/next.ts` lines 560-711 (`sweep`, `sweepAll`, `nextCommand` completion sites)
- `src/next.ts` lines 496-563 (`dispatchLeaf`, `completed` return)
- `tests/next.test.ts` near `a closed tab hook from a merged leaf` and `merged phase closes tab on typed next`
- `tests/helpers.ts` (`fixture`, `leaf`, `cli`, `fakeHerdr`)
- `tests/fake-herdr.ts` (Herdr boundary)
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`
- Copy pattern: existing `sweep` function and the `tab_closed` test setup for hook env.

Open the grounding index only if this list leaves a gap.

## 4. Change list and needed interfaces

- `src/next.ts`: add `async function dispatchDependents(global: GlobalConfig, repo: Repo, completedSlug: string, invocation: Invocation): Promise<void>` next to `sweep`. Body: `await sweep(global, repo, discover(repo, invocation).leaves.filter((leaf) => leaf.state['blocked-by'].includes(completedSlug)), invocation)`.
- `src/next.ts`: at each of the three completion sites, capture `completedSlug` from pre-dispatch identity before `dispatchLeaf`, then on `outcome === 'completed'` call `dispatchDependents(global, repo, completedSlug, invocation)`. Repos: `selection.repo` for targeted, `owners[0].repo` for hooks.
- `tests/next.test.ts`: add two-repo three-path test and second-blocker negative test using real CLI plus `fakeHerdr`. Reuse `configure(f, {repos})` pattern from `next --all inside a checkout sweeps only that repo`.
- Reused: `discover(repo, invocation): Inventory`, `sweep(global, repo, leaves, invocation)`, `dispatchLeaf(..., explicit=false, ...)`. No new gating.
- No preceding worker output.

## 5. Do-not, reasons and exceptions

- Do not change `next --all` behavior, Herdr startup, `plugin/`, or CLI flags. Reason: owned by startup-resume or out of scope. Exception: revised brief from B.
- Do not add capacity, dependency, `hand_built`, or `failed` checks outside `dispatchLeaf`. Reason: `sweep` already routes through them. Exception: revised brief from B.
- Do not edit `docs/guide/`. Reason: owned by brief-2. Exception: revised brief from B.
- Do not rename tests beyond the one `sweeps` title. Reason: brief allows rename only where misdescribed. Exception: revised brief from B.
- Return a mismatch with evidence to the plan author instead of changing scope or an interface. Exception: a revised brief from B authorizing that change.
- Restated: exclusions protect locked scope and peer ownership; each lifts only on a revised brief from B.

## 6. Ordered steps

1. Write the two-repo three-path test in `tests/next.test.ts` for criterion 3. Use one test with fresh fixture per path or a loop over the three paths. Run changed tests to show red (unrelated leaves start).
2. Write the second-blocker negative test in `tests/next.test.ts` for criterion 4. Run changed tests to show red or confirm current wait behavior.
3. Add `dispatchDependents` in `src/next.ts` for criterion 1.
4. Replace the three completion sites in `src/next.ts` for criterion 2, capturing slug before dispatch. Keep `--all` outside repo on `sweepAll`.
5. Rename only the `sweeps` chaining title if needed and run changed tests for criterion 5 until green.
6. Verify `grep -n sweepAll src/next.ts` shows only the definition plus the `--all` path.

Advisory size: about 2 files and under 10 turns. Work clearly beyond it returns a mismatch with evidence, not a hard cutoff.

## 7. Commands

Run only this changed-test command:

```sh
AKROGON_BASE=1a21e22e0056a7e9d6b5e35a5a395b867847a844 bun test --changed="1a21e22e0056a7e9d6b5e35a5a395b867847a844"
```

B runs the full suite separately. Do not run `bun test`, `bun run format`, or `bun run typecheck`.

## 8. Done-when, evidence and report

Done when criteria 1-5 hold with changed-test output pasted. Scenarios use temp repos, real files and processes, herdr replaced at the `fakeHerdr` boundary only. No real panes, install roots, GitHub, or herdr socket. Tests assert observable tabs and attempts, not wording except literal commands and fixed refs.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
