# Review A: release-any-phase

Base: `91a1557cab2bf87f3b8ed6f0586d3aa0010304b3` (origin/main). Reviewed head: `afd3e71823b67ba980aaaf84f3ca3dc51721ed8d` (leaf branch tip). Verdict: `nits`.

## Evidence

- `akrogon verify` green receipt on `afd3e71`: `check-format … 0`, `check-test-1792116175073-2615913.log` 0 (965 pass), `check-typecheck-1792116177109-2615913.log` 0; `verify leaf afd3e71…: green` (implement run, this head).
- `akrogon run-check --name release-any-phase` on the criterion file after rebase: 10 pass / 0 fail — `check release-any-phase: 0 implementation/check-release-any-phase-1792115724149-1627891.log`.
- Planned-red proof from plan.synthesis: 9/10 red before implementation — `check release-any-phase: 1 implementation/check-release-any-phase-1792112067520-1113053.log`; C9 red under deliberate break — `check c9-break: 1 implementation/check-c9-break-1792112107228-1135026.log`.
- `git log --format='%(trailers)'` on `91a1557..HEAD`: every commit touching a test-matched path carries `Test-Change:`; the two expectation-relevant changes (F4 `busy-slice` no-tab premise, `tempFor` root fix) cite their sources.
- `src/AREA.md` named paths: all exist (shell check against repo root). README/AREA claims match the new code paths.
- `akrogon status release-any-phase` showed no `Missing:` lines.

## Findings against the diff

- `src/reconcile.ts`: `finished` gates dropped in `sliceKeepReason` callers (per-repo loop, `reconcileHost`), `unfinished leaf` keep for tab-less unfinished leaves placed before the tab branch (correct ordering — the design treats "tab never recorded" like "tab already gone" only for keeps, never for stops), `unit list unavailable` temp keep inside `kept.length === keptBefore` so live-owner, live-pane and young-run keeps still win. `reconcileNeedsPanes` fast path kept on finished-AND-tabbed; candidate rule `finished || tabbed` is the planned over-fetch, and tab-less unfinished leaves correctly never force a pane fetch (their keep needs no tab judgment).
- `src/next.ts`: manual `dispatchMergeLeaf` and the `reconcileBatch` close/dispatch-dependents loop are now inside the `.lock`; verified no nested `withLock` on any call path (`phaseCommand`'s lock released before `mergeWake`; `mergePass` runs after the pass-level lock in `dispatchSelection`; `dispatchLeaf`/`sweep`/`allocate` take only the admission lock — no deadlock).
- `src/leftovers.ts`: `unfinished leaf` added to `unitInUse`; verified slice keeps land only in the repo report where `leftover()`'s `lstatSync` existence check filters them anyway — the host-side addition is the correct surface.
- `tests/fake-busctl.ts`: `FAKE_SYSTEMCTL_DB` upsert seam gated on the env var; no behavior change when unset.
- Repaired fixtures (b1f0810): env merges preserve each test's deletion assertions; F4 `busy-slice` dropping the recorded tab preserves the scenario's intent — `repoRunning` still reads the busy cgroup, and the dead-tab premise was exactly what the new rule voids.

## Nits

- N1 — `tests/fake-busctl.ts` upserts the slice into `FAKE_SYSTEMCTL_DB` before checking `busctl.fail`, so a refused `StartTransientUnit` still marks the slice `active` — the real manager would not. Deferred: no current test combines the db seam with `busctl.fail`; promoting evidence would be a test that needs a refused start to leave no loaded slice.
- N2 — the C7 test's "blocked pass" evidence is indirect (absence of new pane calls during a 3 s window while the dispatch is parked inside `tab create`); the lock is asserted by outcome, not by observing the flock. Deferred: the stronger assertion needs instrumentation inside the pass; outcome correctness is already covered, and the deliberate-break landscape (planned reds + full suite) stands.

## Verdict

`nits` — no Fix found; every done-criterion has a committed test that was red before the change and green on this head.
