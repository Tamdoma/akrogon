# Plan: twin-guard

Debate is off (`debate: "no"`): synthesized directly from brief and design. The design locks one mechanism: a twin is an open leaf whose top-level owner name also exists under `issues/closed` or `issues/parked` (existence, an empty folder counts); every phase of such a leaf is refused with an error naming both folders, while its leaves stay in the inventory and every other owner keeps working.

## Decisions

- **D1 — One predicate in `src/turn.ts`:** `export function twinConflict(repo: Repo, leafPath: string): { open: string; conflict: string } | null`. Root from the passed `Repo` (same derivation `unmergedDeps` already uses; inventory leaves resolve against it). `openRoot = resolve(repo.root, 'issues/open')`; if `!within(leafPath, openRoot)` return null (closed-path dispatch unaffected). `parts = relative(openRoot, leafPath).split(sep)`; `open = resolve(openRoot, parts[0])`; for `area` in `['closed','parked']`, `target = resolve(repo.root,'issues',area,parts[0])`, return `{ open, conflict: target }` on the first `existsSync`. `discover` never visits `issues/parked` and `validateLeafDepth` guarantees ≥2 segments under `open`, so `parts[0]` is always the owner name.
- **D2 — `Block` gains the twin kind:** `{ kind: 'twin'; open: string; conflict: string }` beside `deps`/`inputs`. `eligibility` and `mergeQueue` gain a `repo: Repo` parameter so `eligibility` checks `twinConflict` first; call sites updated: `src/next.ts` ×4 (dispatchLeaf turn, mergeTurn holder ×2, mergePass holder), `src/phase.ts` (`phase` merge-turn refusal), `src/status.ts` (`scanRepo`, which already has `repo`). `status` needs no display change: the queue simply excludes twins through the same predicate.
- **D3 — `blockDetail(global, repo, leaf, leaves)` returns the twin first:** `const twin = twinConflict(repo, leaf.path); if (twin !== null) return { kind: 'twin', ...twin };` before the `deps` computation. Dead code under dispatchLeaf's earlier check, kept because `blockDetail` is the single "why blocked" surface any status consumer reuses.
- **D4 — `dispatchLeaf` refuses the twin first, never thrown:** immediately after the `leaf === undefined` lookup and before `isPaused`/`isStopped`, identity check, the `merged` branch and `blockDetail`: report once via `report(invocation, repo.name, twin.open, new Error(\`Twin owner folder: ${twin.open} conflicts with ${twin.conflict}\`), slug)` and return `'skipped'`. Keying on `twin.open` dedupes to one line per owner per pass; `invocation.skipped` non-empty makes `nextCommand` exit 1. No `recordWait`: a refused leaf is skipped, not waiting, and no `visit_start`/timing or state write happens for it. `next <slug>` and `next --all` both reach this through `sweep`/`dispatchLeaf` with the leaf still in inventory, so no missing-leaf error appears.
- **D5 — Test rewrite per design:** the existing `tests/next.test.ts` test 'closed owner name does not block an open same-name owner' has its exit-0 dispatch half rewritten as the refused-twin case (its closed-path dispatch half is preserved as criterion-5 test E). No new helpers; `mkdirSync`/`renameSync` on `issues/closed`/`issues/parked` inside the existing `dispatchFixture`.
- **D6 — Unchanged:** `completeOwner` destination throw stays as last guard; `unmergedDeps`, `reconcile`, `reconcileBatch`, `activeCount`, `paneOwners`, `discover` inventory, `allLeaves`, `akrogon phase` all unchanged; `shapes.md` Preflight prose unchanged.
- **D7 — Docs:** no doc is affected. `docs/guide/next.md`'s 'must have valid state and satisfied dependencies. Failed leaves are skipped.' line is already an incomplete precondition list (it omits stops, scope failures, foreign leaves); the design's owned surfaces exclude docs, so the twin rule lives only in the error text. Named here so review can flag it.

## Read-first paths

- `src/turn.ts` — `Block`, `blockDetail`, `eligibility`, `mergeQueue`.
- `src/next.ts` — `dispatchLeaf` (leaf lookup, `isStopped`, `merged`/`failed` branches, `blockDetail` call, `report`), `sweep`/`sweepAll`, `dispatchMergeLeaf`, `nextCommand` exit.
- `src/state.ts` — `validateLeafDepth` (depth 2–3), `allLeaves`, `isParked`.
- `src/phase.ts` — `completeOwner` (destination throw, last guard), `phase` merge-turn refusal via `mergeQueue`.
- `src/status.ts` — `scanRepo`'s `mergeQueue` call.
- `tests/next.test.ts` — `dispatchFixture`, `leaf`, `next`, `dispatchedSlugs`, `skips`, `expectNoLaunch`, `holding`; the test at ~line 5696 to rewrite.
- `docs/guide/next.md`, `docs/guide/files.md` — doc-affect decision only.
- `skills/chart-issues/assets/standing-design.md`; `issues/chart/owner-completion/forks/owner-reuse.md` (registered repo path) — locked binding text.

## Interfaces

- `twinConflict(repo: Repo, leafPath: string): { open: string; conflict: string } | null` — new, `src/turn.ts`.
- `Block = { kind:'deps' } | { kind:'inputs'; missing: Gap[] } | { kind:'twin'; open: string; conflict: string }`.
- `blockDetail(global, repo, leaf, leaves)` unchanged signature, returns twin first.
- `eligibility(global, repo, leaf, leaves)`, `mergeQueue(global, repo, leaves, log)` — gain `repo`.
- New imports in `src/turn.ts`: `existsSync` (node:fs), `relative`/`sep` (node:path), `within` (./config, Repo already imported).

## File/criterion checklist (waves)

**Wave 1 — unit U1 (only unit; run is serial-solo, A implements alone):**

- `src/turn.ts` — D1 predicate, D2 kind + signatures, D3 order.
- `src/next.ts` — D4 refusal branch; `mergeQueue` call sites pass `repo`.
- `src/phase.ts`, `src/status.ts` — `mergeQueue` call sites pass `repo`.
- `tests/next.test.ts` — D5: rewrite the twin-friendly test; add four twin tests (B,C,D,E below).
- Docs: none affected (D7).

## Verification — criterion → observation → command

Run from the leaf worktree; each proof is one `akrogon run-check --name <label> -- bun test --timeout=30000 tests/next.test.ts -t '<regex>'`.

| # | Criterion (brief) | Observation | Test | Command label | Size | Rerun trigger |
|---|---|---|---|---|---|---|
| C1 | `next <slug>` on a dispatchable leaf under an owner whose name is also under `issues/closed` dispatches nothing, exits non-zero, names `issues/open/<name>` and `issues/closed/<name>`, no missing-leaf error; `--all` prints the error once per owner and exits 1 | stderr JSON line with `path` = open owner folder and `error` containing both folder paths; `code` 1; `expectNoLaunch` (no herdr calls, no worktree, no state/timing writes); `--all` stderr has exactly one skip line for the owner | `closed owner twin refuses next <slug> without dispatch` (rewrite); inside `the twin refusal prints once and other owners dispatch under --all` | `twin-slug-refusal`, `twin-all-refusal` | seconds | any change to `twinConflict`, `dispatchLeaf`, `report` |
| C2 | Same refusal when the conflict is `issues/parked/<name>`, and when the conflicting folder is empty | per-conflict-form refusal: `code` 1, error names both paths, `expectNoLaunch` | `a parked owner twin refuses next <slug>` + loop cases `empty parked`/`empty closed` | `twin-conflict-forms` | seconds | predicate form list or existence check changes |
| C3 | In the same `--all` pass a dispatchable leaf under another owner still dispatches, including one `blocked-by` a merged leaf of the twin owner | `dispatchedSlugs` = exactly `['dep1','ok1']` — proves merged dependency read from state still satisfies `unmergedDeps` and the refusal keys only the twin owner | `the twin refusal prints once and other owners dispatch under --all` | `twin-all-refusal` | seconds | inventory/filter or `unmergedDeps` changes |
| C4 | A merge-phase twin leaf never takes the merge turn; a different owner's merge leaf behind it in queue order does | `dispatchedSlugs` = `['m2']` and its prompt is `merge-issue m2 … attempt=a1 top=<sha>` — proves `eligibility`/`mergeQueue` exclude the twin that would otherwise head the queue (slug tie-break) | `a twin merge leaf never heads the merge queue` | `twin-merge-queue` | seconds | `eligibility`/`mergeQueue` signature or filter changes |
| C5 | A closed leaf addressed by its `issues/closed/…` path still dispatches while the twin exists | `next issues/closed/old` adds exactly one prompt for `c1` — proves `within(leafPath, openRoot)` scopes the rule to open leaves only | `a closed leaf dispatches by path while its open twin exists` | `twin-closed-dispatch` | seconds | predicate root scoping changes |

Each run's failing output goes through `akrogon run-check`; the `check <label>: <exit> <path>` line cites the log. The repo `checks.test` command (`bun test --timeout=30000`, whole suite) is the standing gate; implement runs it through `akrogon verify` per the merge path — no extra `merge_checks` the brief does not name.

## Planned red

Criterion 1 is a bug fix: tests A–D must be shown failing before product code, passing after. Test E guards already-correct behavior and is expected green.

Red record (pre-product-code, 2026-10-19):

- `check twin-slug-refusal: 1` — `next o1` exited 0 and dispatched the twin leaf; assertion `expect(result.code).toBe(1)` failed (log `implementation/check-twin-slug-refusal-1792425129153-3019491.log`).
- `check twin-all-refusal: 1` — `next --all` exited 0; the twin owner's leaves dispatched like any other (log `implementation/check-twin-all-refusal-1792425134792-3033387.log`).
- `check twin-merge-queue: 1` — `next --all` exited 0; the twin merge leaf headed the queue and was prompted instead of `m2` (log `implementation/check-twin-merge-queue-1792425148286-3079923.log`; first run before the `slot=B` assertion fix is log `...-1792425137829-3045557.log`).
- `check twin-conflict-forms: 1` — all three cases (`parked leaf`, `empty parked`, `empty closed`) exited 0 with dispatch (log `implementation/check-twin-conflict-forms-1792425151138-3110006.log`).
- `check twin-closed-dispatch: 0` — passing now and must stay passing; criterion 5 is pre-existing behavior (log `implementation/check-twin-closed-dispatch-1792425153956-3134409.log`).

## Open limitation (kept, per design)

`akrogon status` does not display the twin condition; if it ever does, it must reuse `twinConflict`, not copy it. A stopped leaf under a twin owner reports the twin error before the stopped error (twin first, design "in any phase").

## Env

`akrogon status twin-guard` shows no `Missing:` lines; the design names no variables. No operator blockers.
