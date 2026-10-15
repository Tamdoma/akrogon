# Plan: worktree-keep-rule

## Decisions

- D1 — Parse `git worktree list --porcelain` once per pass into `Map<path, { head: string; branch?: string; locked: string | false }>` in `reconcile` (src/reconcile.ts). It replaces the current `registered: Set<string>`; the same map supplies `branch`/`head` for removed records and `locked` for the lock rule.
- D2 — Lock keep first. Any registered worktree with `locked` set is kept with reason `locked worktree (<text>)` (or `locked worktree` when the lock has no reason) in two places: the per-leaf loop right after the `registered` check, and the candidate loop right after `existsSync`/`handled`/`registered` pass and before `knownSlugs`, leaf, kind and fallthrough evaluation. This covers every name, including a leaf's own recorded worktree. Nothing in this leaf adds a forced removal path.
- D3 — Fallthrough keep. In the candidate loop, after the leaf-slug and active-worker keeps and before the verify/batch/live/pane removal checks: `if (owner === undefined && !name.startsWith('verify-') && !name.startsWith('batch-')) keep(path, 'unmanaged worktree')`. `<name>-u<N>` whose prefix is no leaf slug lands here (its `owner` is undefined). Scratch kinds (`verify-*`, `batch-*`, `<existing-leaf>-u<N>` of a finished leaf) keep their merged rules untouched, including single-`--force` removals.
- D4 — Report `removed`. `removeWorktree` gains a `rule` parameter; on success it pushes `{ path, branch?, head, rule }` to a new `removedWorktrees` list (branch/head read from the D1 map, `branch` omitted when detached) in addition to `removed.push(path)`. `reconcile/<repo>.json` is written as `{ kept, removed }` every pass (`removed: []` when none). Prune condition changes from `removed.length` to `removedWorktrees.length` so a prune still runs exactly when a worktree was removed. `Reconciled` stays `{ removed: string[]; kept }`.
- D5 — One shared strict schema (resolves "Open for the plan"): `keptReportSchema` gains `removed: z.array(z.strictObject({ path: z.string(), head: z.string(), rule: z.string(), branch: z.string().optional() })).optional()` read with `.default`-style fallback (`parsed.removed ?? []`), keeping `kept` required. Rationale: the host report shares `writeKept`, and a strict schema must tolerate the new field both ways — old reports have no `removed` (accepted via optional), and a stale `akrogon` binary reading a new report must not drop `kept` (a versioned `removed` field it cannot parse is still one schema, so no strict failure). Exported `readRemoved(repo)` mirrors `readKept` for consumers.
- D6 — Rule names in `removed`: `merged leaf`, `failed leaf`, `old-root migration` (active leaf's legacy-root worktree removed for recreation, and a failed leaf's store worktree is `failed leaf`), `ended verify`, `dead batch owner` (record read but owner dead/invalid), `unrecorded batch` (no `.owner` file), `worker of finished leaf` (`<leaf>-u<N>` with merged/failed owner).
- D7 — Locked direct worktree. `skills/chart-issues/SKILL.md`: step 1 becomes create `<worktree_store>/<slug>` with `git worktree add --lock --reason "<chart-folder> direct"` on branch `<slug>`; landing step 8 prepends `git worktree unlock <path>` immediately before `git worktree remove`; the abandon continuation becomes `git worktree unlock`, then worktree and branch removed; the lifecycle-handoff continuation gains "unlock the worktree before handoff" because the command's `ensureWorktree` (src/next.ts) adopts the existing directory as-is — it never locks, never checks lock state, and later leaf rules must be able to remove it.
- D8 — Rewritten false expectations (design: rewrite or delete with reason): `tests/reconcile.test.ts` "store variants survive live or unavailable pane inventories" keeps its pane-matrix shape but asserts `unmanaged worktree` and existence in all three states (no pane → unmanaged, not removed); "targeted next sweeps unused registered variants" asserts the variant stays with `unmanaged worktree` after `next <slug>`.
- D9 — New criterion tests live in `tests/keep-rule.test.ts` reusing `dispatchFixture`, `dispatchLeaf`, `next`, `status`, `closeTab`, `database`/`saveDatabase` patterns from `tests/reconcile.test.ts` (imports shared from `tests/helpers.ts`; the small dispatch wrappers are duplicated there as the file already duplicates helpers like `unreachable`).

## Open for the plan (design), resolved

- `removed` in the same strict schema vs a repo-report schema → D5 (same schema, optional field, keeps host `writeKept` sharing).
- Adoption path lock state → D7 confirmed: `ensureWorktree` validates only toplevel + common dir; it neither locks nor inspects `locked`, so a locked direct worktree would be adopted and never removable — hence the handoff unlock.

## Read-first

- `src/reconcile.ts` — `reconcile`, `removeWorktree`, candidate sweep, `keptReportSchema`/`writeKept`/`readKept`, `readHostKept`.
- `src/next.ts` — `ensureWorktree`/`createSparseWorktree` (adoption), `reconcile` call sites incl. `tab_closed` (~line 1445).
- `src/status.ts` — `statusCommand` kept-line consumers (`readKept`), lines ~352, ~411.
- `tests/reconcile.test.ts` — `dispatchFixture`, verify/batch/worker scratch cases, the two variant tests to rewrite.
- `tests/helpers.ts` — `fixture`, `cli`, `fakeHerdr`, `storeDir`, `leaf`, `readState`.
- `tests/next.test.ts` — `tab_closed` invocation via `HERDR_PLUGIN_EVENT_JSON` (~line 560).
- `skills/chart-issues/SKILL.md` — Direct route protocol, steps 1 and 8, growth-stop continuations (~lines 101–121).

## Interfaces

- `keptReportSchema` extended per D5; `readRemoved(repo: Repo): { path: string; head: string; rule: string; branch?: string }[]` added beside `readKept`.
- `removeWorktree(repo, path, force, rule)` internal signature change; callers pass the D6 name.
- Porcelain parser `type WorktreeRow = { head: string; branch?: string; locked: string | false }` internal to `src/reconcile.ts`.
- No new test machinery; fixtures, fake herdr, `AKROGON_HOME=<f.home>` report path `<f.home>/reconcile/repo.json` already exist.

## Units

- U1 (wave 1): owns `src/reconcile.ts`, `tests/keep-rule.test.ts`, `tests/reconcile.test.ts`. Implements D1–D6, D8.
- U2 (wave 1): owns `skills/chart-issues/SKILL.md`. Implements D7. Prose only, no tests (design: criterion 5 is skill text).

U1 and U2 have disjoint owned paths, share no test resource and neither depends on the other — same wave, 2 units, not serial-solo.

## Checklist

- [ ] `src/reconcile.ts` — porcelain map (D1), lock keeps in both loops (D2), unmanaged fallthrough (D3), `removed` records + schema + `readRemoved` + prune gate (D4–D6).
- [ ] `tests/keep-rule.test.ts` — new file, criterion tests T1 (unmanaged keep incl. `tab_closed`), T2 (locked keeps, then unlocked removals), T3 (removed records + empty case + old-format read).
- [ ] `tests/reconcile.test.ts` — rewrite the two variant expectations per D8 with `Test-Change:` trailer citing brief criterion 1.
- [ ] `skills/chart-issues/SKILL.md` — D7 edits at step 1, landing step 8, abandon and lifecycle-handoff continuations.
- [ ] No `src/leftovers.ts` change: kept-status's file is unmerged (`leftovers-command` branch); `locked worktree`/`unmanaged worktree` correctly stay outside its `inUse` set — verified by reading the branch copy.

## Docs affected

- `docs/guide/next.md`, `README.md`: check the cleanup/reconcile prose for the variant-removal claim; update one line if it states unregistered-name worktrees are swept (verify during implement; if no claim exists, no doc change).
- `src/AREA.md`, `tests/AREA.md`: `tests/AREA.md` gets one line for `tests/keep-rule.test.ts` if the file lists test files by name; check during implement.
- `skills/AREA.md`: no change — chart-issues SKILL.md edit is protocol detail, not a new surface.

## Criterion proofs

| Criterion | Test | Command | Observation | Size | Rerun trigger |
| --- | --- | --- | --- | --- | --- |
| 1: non-leaf, non-scratch registered worktrees in store and legacy root stay; listed under `unmanaged worktree` | `keep-rule.test.ts` T1 + rewritten "store variants survive live or unavailable pane inventories" | `akrogon run-check --name 'test' -- bun test tests/keep-rule.test.ts tests/reconcile.test.ts` | `git worktree add --detach` `manual-copy` in store and `legacy-copy` under `issues/worktrees/`; `next --all` then a real `tab_closed` pass; both exist and `status <slug>` prints `unmanaged worktree`. Catches: #94 silent deletion of a running direct/operator worktree. | seconds | candidate sweep fallthrough, leaf slug set |
| 2: locked worktree stays whatever the name, with lock reason | `keep-rule.test.ts` T2 | same command | `git worktree lock --reason` on `keep-holder-x` (non-kind `-x`), `verify-unrecorded`, `batch-unrecorded`, `merged-keeper-u1` (merged owner's worker) and the locked own worktree of a merged leaf; `next --all`; all exist, `status` shows `locked worktree (<text>)`; after `git worktree unlock` the scratch names are gone next pass. Catches: cleanup overriding a git lock (#94 protection). | seconds | porcelain parsing, lock check placement |
| 3: unlocked akrogon kinds keep today's removals through `git worktree remove` | existing "unconfirmed verify worktrees are removed once the run ends", "verify scratch copies are removed by owner state…", "batch copies follow their owner record…", "worker copies follow the owner leaf…", "failed leaf worktree is removed…" in `tests/reconcile.test.ts` | same command | Existing green suite proves every removal rule unchanged; T2's post-unlock assert adds the lock boundary. Catches: a sweep that stops cleaning scratch copies. | seconds | removeWorktree call sites, force flag use |
| 4: report lists every registered worktree removed with path/branch/head/rule, none when none; old reports still read | `keep-rule.test.ts` T3 | same command | After `next --all` on a merged leaf (closed tab): `<f.home>/reconcile/repo.json` `removed` contains the leaf worktree `{path, branch: 'report-leaf', head: <porcelain sha>, rule: 'merged leaf'}` and `verify-ended` `{head, rule: 'ended verify', no branch}`; a keep-only pass writes `removed: []`; a hand-written `{kept: [...]}` report (no `removed`) still prints its `Kept:` line under `status <slug>`. Catches: unprovable deletions — the #94 "nobody could prove which pass removed it" gap. | seconds | schema, writeKept call, removeWorktree rule labels |
| 5: direct route locks at creation, unlocks before removal and before handoff | none — skill text (design: no test for prose) | n/a | Reviewed text at `skills/chart-issues/SKILL.md` step 1 (`git worktree add --lock --reason "<chart-folder> direct"`), landing step 8 (`git worktree unlock` before remove), abandon and lifecycle handoff (unlock). Catches: the one akrogon worktree the sweep would otherwise still take — a live direct attempt. | n/a | direct-route prose changes |

Red expectations before product code (recorded below after the run): T1 fails — `manual-copy`/`legacy-copy` removed by today's fallthrough removal; T2 fails — `keep-holder-x` removed, the rest kept for wrong reasons; T3 fails — no `removed` key in the report; both rewritten variant tests fail — variants removed.

## Coordination notes

- `kept-status` (merged 2026-10-16 as `fb60ccd`, now this leaf's base): `akrogon leftovers` exists. `locked worktree (<text>)` and `unmanaged worktree` are absent from its `inUse`/`unitInUse` sets and the `verify … in progress` regex, so they surface in `akrogon leftovers` exactly as the brief requires; criterion tests assert the literal listing. `src/reconcile.ts` on this base reads reports via `readReport` (throws on invalid), which D5's schema extension slots into.
- `store-sweep` (planning): unregistered entries only; registered worktrees follow this leaf — no interface overlap.
- Direct-route consumers of a locked worktree: `akrogon verify --holder <chart>/direct` and `direct-guards.ts` only read it; landing step 8 and abandon unlock first. `ensureWorktree` adoption confirmed compatible (D7).

## Implementation notes

- 2026-10-16 (refines D8 area): `kept-status` merged into the base during the implement refresh; `akrogon leftovers` is now runnable, so T1/T2 assert the literal `akrogon leftovers` listing (committed `d27b01b` with a `Test-Change:` trailer citing criteria 1–2). No locked decision changed.
- 2026-10-16 (refines D5): the base's `readReport` throws on invalid reports; `readRemoved` mirrors it, and `writeKept` gains an optional `removed` argument so `reconcile-host.json` stays kept-only while the repo report writes both keys every pass.

## Red run records

`akrogon run-check --name 'test' -- bun test tests/keep-rule.test.ts tests/reconcile.test.ts` on the base head (`check test: 1` exit, log `implementation/check-test-1792102399755-1708315.log`): 29 pass, 5 fail — exactly the planned criterion tests:

- T1 `(fail) registered worktrees that are no leaf or scratch kind stay through both pass kinds` — `manual-copy` deleted at line 73 (`existsSync` false): today's sweep removes it, the #94 bug.
- T2 `(fail) locked worktrees stay whatever their name and report the lock reason` — all five locked worktrees exist but status reports raw git stderr `fatal: cannot remove a locked working tree, lock reason: …` instead of `locked worktree (<text>)`; no porcelain lock parse exists.
- T3 `(fail) the reconcile report records removed worktrees…` — report JSON has no `removed` key (ZodError expected array, received undefined).
- `(fail) store variants are kept as unmanaged through live, unavailable and absent panes` and `(fail) targeted next keeps unused registered variants` — both rewritten expectations fail because the variant is removed by today's fallthrough rule.
