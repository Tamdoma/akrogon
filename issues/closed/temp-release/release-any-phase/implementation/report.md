# Report: release-any-phase implement

Base: `91a1557` (origin/main after second refresh). Head: `afd3e71`. Delegated run: wave 1 = U1 code + U2 docs in parallel; wave 2 = repair brief for the checks the product change turned red.

## Changes

- `d76f5f7` — planned criterion tests (`tests/release-any-phase.test.ts`, new file, committed at plan.synthesis).
- `64ca077` (worker u1) — `src/reconcile.ts`, `src/leftovers.ts`, `src/next.ts`, `tests/fake-busctl.ts`: any-phase slice stop rule, `unfinished leaf` keep for tab-less unfinished leaves, `unit list unavailable` temp keep, needsPanes widened to unfinished tabbed candidates, manual merge dispatch + `reconcileBatch` dependent dispatch under the global lock, busctl `FAKE_SYSTEMCTL_DB` upsert seam.
- `fe840da` (worker u2) — `README.md`, `src/AREA.md`: prose updated to the any-phase rule.
- `6f81c77` — A's test correction: `tempFor()` resolves leaf temps under `leafTempRoot(f)` (the subprocess root); the tests previously hashed the suite root.
- `026a3f9` — restored the `reconcileNeedsPanes` fetch guard to finished-and-tabbed leaves (worker had over-widened).
- `b1f0810` (worker u3) — 10 pre-existing tests given a readable fake-systemctl inventory so their temp-deletion expectations still run; `F4 busy-slice` scenario re-based on a no-tab leaf (its dead-tab premise is exactly what the new rule stops).
- `1f4354f`, `afd3e71` — prettier formatting.

## Commands run

- `akrogon run-check --name release-any-phase -- bun test tests/release-any-phase.test.ts --timeout=30000`
  - On the planned head before product code: **9 fail / 1 pass** (each criterion test red on its own assertion) — `check release-any-phase: 1 .../check-release-any-phase-1792112067520-1113053.log`
  - Deliberate-break proof for criterion 9 (removed `tabLive` keep, reverted): **red** — `check c9-break: 1 .../check-c9-break-1792112107228-1135026.log`
  - After implementation and fixes: **10 pass / 0 fail** — `check release-any-phase: 0 .../check-release-any-phase-1792115724149-1627891.log` on head `afd3e71`'s content pre-format commit.
- `akrogon run-check --name u1-tests -- bun test tests/release-any-phase.test.ts --timeout=30000` (worker u1): 7 pass / 3 fail — the three reds were the test-file temp-root defect above — `check u1-tests: 1 .../check-u1-tests-1792113348548-1702169.log`
- `akrogon run-check --name u3-tests -- bun test tests/next.test.ts tests/pause-next.test.ts tests/reconcile.test.ts tests/store-sweep-safety.test.ts --timeout=30000` (worker u3): **300 pass / 0 fail** — `check u3-tests: 0 .../check-u3-tests-1792115628632-1379824.log`
- `akrogon verify` on `afd3e71` (fresh checkout, all `checks`): **green** — format/test/typecheck all 0; `verify leaf afd3e71823b67ba980aaaf84f3ca3dc51721ed8d: green`. Wall time ≈ 4 minutes per run; first two runs were red (10 stale-fixture failures, then a prettier nit), repaired as listed.

## Refreshes

- Start of pass: rebased leaf branch onto `origin/main` `343c688`→`83b9279` (test commit re-applied as `9eda855`).
- After wave commits: rebased onto `origin/main` `91a1557`; heads re-created as `64ca077`…`afd3e71`. `AKROGON_BASE` refreshed to `91a1557cab2bf87f3b8ed6f0586d3aa0010304b3`.

## Done-criterion to proof map

| Criterion | Proof | Result |
|---|---|---|
| 1 | `an unfinished leaf slice is stopped…` | green |
| 2 | `a live run record keeps…` | green |
| 3 | `…live tab keeps its slice…` + `…pane list is unavailable…` | green |
| 4 | `…no recorded tab keeps its loaded slice` | green |
| 5 | `an unreadable unit list keeps…` (3 phases) | green |
| 6 | `the host slice step keeps…` | green |
| 7 | `a manual merge dispatch holds the global lock…` | green |
| 8 | `a tab_closed pass re-dispatches…` | green |
| 9 | `a failed leaf with a live tab keeps…` | green |

## Known limitations

- `fakeSystemctl(f)` returns no PATH entry; every current caller already has `f.home/bin` on PATH via `fakeHerdr`/`fakeAkrogon`.
- The tab_closed test asserts the slice was stopped inside the hook pass through the fake systemctl log; the lock-order guarantee (criterion 7) covers the window between tab record and adoption.
- Unverified criteria: none.

## check.fix (2026-10-16): proof repairs for B's F1–F3

- `0bea6be` — tests/release-any-phase.test.ts: criterion-3 split (isolated no-temp case), second-repo host stop + live-run veto cases in criterion 6, criterion 7 parked at `busctl StartTransientUnit` after tab record via `next --all`.
- Green before breaks: `check cfix-criteria-2: 0 implementation/check-cfix-criteria-2-1792118164779-3978973.log` (11 pass).
- Deliberate breaks on the final proof content (`brief-4-results.md` for the full table): B1 `finished` gate → 8 red (`check break-b1: 1`); B1-needspanes finished-only candidates → no-temp c3 red alone (`check break-b1-needspanes: 1`); B2 no `unfinished leaf` keep → c4+c6 red (`check break-b2: 1`); B3 no inventory keep → c5 red (`check break-b3: 1`); B4 host `finished` gate → c6 red (`check break-b4: 1`); B5 unlocked manual dispatch → c7 red (`check break-b5: 1`). All reverted; `src/` clean.
- Green after breaks: `check cfix-final: 0 implementation/check-cfix-final-1792118483856-4141685.log` (11 pass, 0 fail).
