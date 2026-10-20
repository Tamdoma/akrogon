# Plan: slug-witness

Direct synthesis (debate: no). Locked decision: close-witness 1a — `closeSources` closes each source with `delivered by <slug>`; the worktree guard and the `git rev-parse HEAD` read are deleted.

## Decisions

- D1: `closeSources(repo, sources, leaf)` in `src/pull.ts` keeps its signature. The worktree guard and `rev-parse HEAD` are removed; each source closes through the existing `closeSource(repo, source, `delivered by ${leaf.state.slug}`)`. Signature stays because the comment needs only the slug already on `leaf.state.slug`; changing the signature would force the two `completeOwner` call sites to churn for no benefit.
- D2: The retry-attempt comment-equality check inside `closeSource` is untouched. `delivered by <slug>` is deterministic for a given leaf, so the `item.body === comment` skip still deduplicates correctly on retry after a close that posted its comment but failed afterward.
- D3: Source closure stays ordered before `packFolder` and `renameSync` in `completeOwner` (design binding mechanism). A failure mid-completion leaves the owner open and retryable.
- D4: The false-expectation test `sourced completion without worktree context fails before rename without a fabricated commit` is rewritten as a positive case: `phase missing merged` on a merge leaf with sources and no worktree closes with `delivered by missing` and moves the owner to `issues/closed` (design: deleted or rewritten with that reason; rewritten chosen because it directly covers the `phaseCommand`/`transition` caller).
- D5: One new test in `tests/next.test.ts` covers criterion 1's exact scenario: a merged leaf with sources and no recorded worktree completes under `akrogon next`, closing `team/project#1` with `delivered by stuck` and moving the owner. This is the #103 retry path: reconcile removes a merged leaf's worktree (`removeMergedWorktree`), then every completion retry threw `Sourced completion requires a worktree`.
- D6: Every remaining `merged ${<head>}` expectation in `tests/phase.test.ts` and `tests/next.test.ts` becomes `delivered by <triggering slug>`; `head`/`firstHead` reads used only to build those strings are deleted, the placeholder plumbing in the comment-listing cases is inlined, and the test name `...duplicating a merged comment...` is renamed `...delivered-by comment...`.
- D7: For the fake-gh `probe` on the new worktree-less test, `worktree` is set to `f.root` so the probe's `.git` check passes while still verifying open/closed folder ordering and `GH_HOST=github.com`.

## Read-first

- `src/pull.ts` (`closeSource`, `closeSources`, `closeCommand`)
- `src/phase.ts` `completeOwner` (~lines 189-225) and `phaseCommand` merged-leaf path (line 717)
- `src/next.ts` `dispatchLeaf` merged branch (line 761)
- `src/reconcile.ts` `removeMergedWorktree` / `mergedWorktree` (unchanged; explains how criterion 1's state arises)
- `tests/helpers.ts` (`leaf`, `fakeGh`, `holding`, `sourceWorktree` in `tests/phase.test.ts`)
- `tests/fake-gh.ts` (step `args` matching, `.calls`, `probe`, `stateful` mode)
- `tests/phase.test.ts` and `tests/next.test.ts` touched regions listed below

## Interfaces

Unchanged. `closeSources` signature is `closeSources(repo, sources: ReadonlySet<string>, leaf: Leaf)`; `completeOwner` callers in `src/phase.ts` need no edit. `closeCommand` is untouched and already posts `delivered by <by>`.

## Checklist (waves)

Wave 1 — U1 (serial-solo: the only unit; A implements it under implement-issue):

- `src/pull.ts`: delete the worktree guard and `rev-parse HEAD` in `closeSources`; post `delivered by ${leaf.state.slug}` via `closeSource`.
- `tests/phase.test.ts` (already committed with this plan): rewritten worktree-less `phase merged` test; `delivered by <slug>` expectations in `asymmetric and empty leaf sources`, `source retries recheck state`, `partial commented close`, `failed or malformed retry comment listing`, `each completed issue closes only its all-leaf private sources`, `standalone/epic closure failure retries`; dropped `head`/`firstHead` reads that fed only comments.
- `tests/next.test.ts` (already committed with this plan): new worktree-less `next` retry test; `delivered by landed` / `delivered by rename` in the two `merged ${head}` sites.

Docs: none affected. `src/AREA.md`, `tests/AREA.md`, `skills/*/SKILL.md` and `docs/` carry no text describing the source-close comment as `merged <commit>`; the only `merged ${...}` text outside the owned files is `src/timing-report.ts`'s merged-count summary, which is not the source-close comment.

## Verification

| Criterion | Proof | Command | Size / rerun trigger |
|---|---|---|---|
| 1. Merged leaf, GitHub source, no recorded worktree completes on retry through `akrogon next`; close comment `delivered by <slug>`; owner moves to `issues/closed` | New test `a merged sourced leaf with no recorded worktree completes on next` (tests/next.test.ts). Boundary: real `akrogon next` CLI process against the fake-gh boundary; observes the recorded `gh` call args (`issue close ... --comment delivered by stuck`) and the folder move. Before: exit 1, stderr `Sourced completion requires a worktree`. After: exit 0, db drained, owner under `issues/closed`. Catches: the worktree requirement throwing on the completion retry path, the exact bug in #103. | `bun test tests/next.test.ts -t 'merged sourced leaf with no recorded worktree'` | seconds; rerun on any change to `closeSources`, `completeOwner`, `dispatchLeaf` merged branch |
| 1 (second caller). Same, driven through `phase <slug> merged` | Rewritten test `sourced completion without a recorded worktree closes the source with the leaf slug` (tests/phase.test.ts). Observes recorded gh close args `delivered by missing` and `issues/closed/issue/missing` state. | `bun test tests/phase.test.ts -t 'sourced completion without a recorded worktree'` | seconds; rerun on `closeSources`/`completeOwner`/`phaseCommand` changes |
| 2. At epic completion a source shared by leaves of different child issues closes with the triggering leaf's slug | Existing test `asymmetric and empty leaf sources defer until epic completion under open locks` (tests/phase.test.ts), expectations now `delivered by two` for the shared sources `#1`/`#2` and private `#3`. Boundary: fake-gh recorded args after the triggering leaf's `phase two merged`. Catches: wrong attribution of shared-source closes at epic completion. Sibling coverage: `each completed issue closes only its all-leaf private sources before the final epic closure` expects `delivered by first` then `delivered by last`. | `bun test tests/phase.test.ts -t 'asymmetric and empty leaf sources defer until epic completion'` and `bun test tests/phase.test.ts -t 'each completed issue closes only its all-leaf private sources'` | seconds; rerun on `completeOwner` source-set partitioning or `closeSources` changes |
| 3. No text under `src`, `tests`, `skills` describes the completion source-close comment as `merged <commit>` | Grep: no `merged ${` template remains outside `src/timing-report.ts` (its `merged ${merged.length}` is a count summary, not the close comment); the product site `src/pull.ts:194` and all test sites are gone. | `sh -c "! grep -rn 'merged \${' src tests skills \| grep -v timing-report \| grep -q ."` | seconds; rerun on any text change mentioning the close comment |

No `merge_checks` or whole-suite additions beyond the brief: the printed `checks` (`format`, `test`, `typecheck`) run at review/merge as usual.

## Red evidence (recorded at plan.synthesis, all for the intended reason)

- crit1-next-retry: `check crit1-next-retry: 1 <log>` — `next stuck` exit 1, stderr `Sourced completion requires a worktree` naming slug `stuck` and `team/project#1`; no gh calls consumed.
- crit1-phase-sourced: `check crit1-phase-sourced: 1 <log>` — `phase missing merged` exit 1 (same throw before gh calls).
- crit2-epic-close: `check crit2-epic-close: 1 <log>` — closes posted `merged 9f521d44...` where `delivered by two` was expected for all three sources.
- crit2-epic-private: `check crit2-epic-private: 1 <log>` — `phase first merged` failed on the expected-vs-actual comment mismatch (`merged <sha>` vs `delivered by first`).
- red-touched-tests: `check red-touched-tests: 1 <log>` — all five updated phase.test cases fail on `merged <sha>` vs `delivered by <slug>`; `standalone completion closes the union` passes unchanged (it never asserted comment text).
- crit3-no-merged-comment: `check crit3-no-merged-comment: 1 <log>` — `src/pull.ts:194` still posts `merged ${commit}`.

Log paths are under `implementation/check-*.log` beside this file.

## Limitations

- The real GitHub close was proven at charting (readiness.yaml `proofs`: two live `akrogon close --by` closes reading back `delivered by pool-parity`); the leaf reuses the repo's fake-gh boundary per standing design.
- `src/reconcile.ts` keep rules (`ownerCompletes`, worktree retention while a completion is owed) are unchanged and out of scope; whether they become removable is not this leaf.

## Env

`akrogon status` shows no missing env for this leaf; `env_names` is empty. No credentials are named by the design. The outside boundary (gh) is covered by the recorded chart-time proof and the fake-gh fixture.
