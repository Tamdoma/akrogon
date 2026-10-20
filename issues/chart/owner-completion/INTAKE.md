# Intake: owner-completion

## Scope

A merged completion owner always closes its sources and moves into `issues/closed` on retry: without needing a surviving leaf worktree (#103) and without failing when the same owner name already sits in `issues/closed` (#108).

Part of a six-chart pass opened 2026-10-18 over seeds #102-#108; sibling charts: paid-proof-bounds, merge-stacks, owner-completion, state-unknown-keys, criterion-outcomes, sync-identical-ignored. No dependency between them.

## Provenance

- GitHub: Tamdoma/akrogon#103
- GitHub: Tamdoma/akrogon#108
- Operator: 2026-10-18 chart-issues invocation
- Operator: 2026-10-18 split round answer

## Source: operator 2026-10-18 invocation

> Let's check all of the issues that were pulled and chart them out. Use slot b and c consultants that are already active. We're searching for the most elegant systemic issues. Always better to remove redundancies and complicated code first before adding and stacking new code.

## Source: operator 2026-10-18 split round

> 1a | 2a | 3a | 4a

Round answered 2026-10-18: 1a fold #103 and #108 into one chart; 2a order #107, #104, #103+#108, #102, #105, #106; 3a leave the two flaky tests out; 4a no framework replay-resume chart now.

## Source: Tamdoma/akrogon#103

# Merged leaves with GitHub sources never complete: "Sourced completion requires a worktree" after the merged worktree is removed

Source: Tamdoma/akrogon#103
URL: https://github.com/Tamdoma/akrogon/issues/103

Origin repo: Tamdoma/tamdoma-framework

Unverified intake.

## Observation

On 2026-10-18, `akrogon next --all` in the framework repo printed one error per merged leaf that has a GitHub source, 20 in total. For example:

```
{"slug":"component-loader","error":"{\"error\":\"Sourced completion requires a worktree\",\"slug\":\"component-loader\",\"sources\":[\"Tamdoma/tamdoma-framework#276\"]}"}
```

Other leaves with the same error include coverage-roles (#242), meta-summary-table (#243), landing-composition (#273), admin-csp (#274) and account-access (#185).

These leaves are `phase: merged`, but they stay under `issues/open`. Their issue/epic folders never move to `issues/closed`, and their GitHub source issues stay open. The same error was logged earlier in the night for leaves that had just merged. As a result, `issues/open` holds about 25 merged leaves next to 28 live ones, so `akrogon status` and watch output are mostly finished work.

## Location

akrogon completion after merge, in release `~/.akrogon/releases/9e0df5b049fdcbe71bdd85d55e28d2955f9c2595`:

- `src/pull.ts:184-206` (`closeSources`)
- `src/phase.ts:195-225`, the completion path that calls it
- `src/reconcile.ts:584-590` (`removeMergedWorktree`)

Run through `akrogon next --all` and post-merge completion.

## Reproduction

1. Merge a leaf whose `state.yaml` has `sources:` listing a GitHub issue.
2. Let reconcile remove its merged worktree.
3. Run `akrogon next --all`, or merge the last sibling.

Completion throws "Sourced completion requires a worktree" every time. Seen for 20 leaves.

## Expected behavior

A merged leaf with sources completes: its sources close with the merge commit, and its folder moves to `issues/closed` once all siblings are merged.

## Urgency

The repo's open tree fills with finished leaves, which hides live work from operators and watches. Source issues on GitHub stay open after the work merged. No workaround is known short of closing the sources and moving folders by hand.

## Suspected cause

Supported hypothesis:

- **Main condition:** `closeSources` throws when `leaf.state.worktree` is undefined (`pull.ts:186-189`), because it reads the merge commit with `git rev-parse HEAD` inside the worktree (`pull.ts:190`).
- **Contributing condition:** after a merge, `removeMergedWorktree` removes the worktree and saves `worktree: undefined` to state (`reconcile.ts:584-586`). Once that runs, every later completion attempt for that leaf fails, including the one that would close its sources and move its folder (`phase.ts:215-220`).

Whose view: agent. The reporter saw the errors and the merged leaves left under `open`.

Files read: the lines above in the installed release. This is not the akrogon source checkout, and its match to `/home/ivan/Work/infra/akrogon` HEAD was not checked.

Not inspected:
- Whether the first completion right after merge ever succeeds before reconcile runs.
- The order of `removeMergedWorktree` and completion in the merge flow.
- Whether `state.yaml` keeps the merge commit anywhere else.

Related reports:
- Tamdoma/akrogon#5 (closed): a failed source closure at merge cannot be recovered because the folder moves first. It is related but covers a different failure.
- Searched Tamdoma/akrogon, all states, limit 8, with "Sourced completion", "closeSources worktree" and "source closure merged". Only #5 came back.

## Source: Tamdoma/akrogon#108

# Merged leaves of a reopened epic never complete: "Completion destination exists" when issues/closed/<epic> is already there

Source: Tamdoma/akrogon#108
URL: https://github.com/Tamdoma/akrogon/issues/108

Origin repo: Tamdoma/tamdoma-framework

Unverified intake.

## Observation

In framework, epic `satellite-plan-fit` was completed once, so `issues/closed/satellite-plan-fit/` exists (EPIC.md, brand-override, page-draw-preview, evidence.tar.zst). New leaves were later charted under `issues/open/satellite-plan-fit/`: dilutor-fit, hub-child-links, neutral-identities, persona-text-bounds, pool-parity and replay-cases. All six are now `phase: merged`, but both `akrogon next --all` and `akrogon next issues/open/satellite-plan-fit/pool-parity/pool-parity` fail for each leaf with:

`Completion destination exists: /home/ivan/Work/infra/tamdoma/framework/issues/closed/satellite-plan-fit`

`akrogon status` keeps listing the six merged leaves as open.

## Location

Leaf completion, `src/phase.ts` `completeOwner` (release b5a877c1c21d, line 201).

## Reproduction

Complete an epic so it moves to `issues/closed/<epic>`. Chart new leaves under `issues/open/<epic>`. Merge all of them, then run `akrogon next --all`. Fails every time for every leaf of that epic.

## Expected behavior

The newly merged leaves complete into the existing closed epic, and `akrogon status` shows no open leaves.

## Urgency

Low to medium. The merges themselves land. The merged leaves stay in `issues/open` with no end, `status` misreports open work, and a watch keeps finding them. The only workaround is moving folders by hand.

## Suspected cause

`completeOwner` sets `destination = issues/closed/<basename(owner)>` and throws when `complete && existsSync(destination)`, then later does `renameSync(owner, destination)`. Completion assumes an owner folder closes exactly once, so an epic (or issue) that gets new leaves after its first close has no path to completion.
Whose view: agent.
Files read: `~/.akrogon/releases/b5a877c1c21d952e7ef86579e8eacecbd582aa5f/src/phase.ts` lines 191-229 (installed release copy, not the destination source checkout).
Not inspected: how `chart` hands new leaves to an already-closed epic name, and whether `packFolder` would also clash with an existing `evidence.tar.zst`.
Related reports: Tamdoma/akrogon#103 (merged leaves never complete, but from a missing worktree for sourced completion, different mechanism). Searched Tamdoma/akrogon, all states: author @me since 2026-10-17 (limit 40), and "Completion destination exists" (limit 10).

## Agent findings

Opening map merged with attribution: issues/chart/paid-proof-bounds/slots/map-merged.md, sections for #103, #108.
