# Plan: flaky-merge-flips

`akrogon flaky` must keep counting a named unit red-then-green across a rebase that moves the leaf's tree, when the leaf's own commits did not change and no base or landed-main run failed the unit in between. Same-tree and nameless semantics stay as today.

## Read first

- `src/flaky.ts` — `names`, `failedTests`, `flips`, `flakyLines`, `flakyCommand` (the whole file is small).
- `src/verify.ts` — `verifyRunSchema` (row fields), `runOnce` (receipt write), `newRedUnits` (the `compares`/`isAncestor` reading of "landed"), `requireGreenReceipt`.
- `src/batch.ts` — `isAncestor` (throws `CommandError` on an unresolvable object).
- `src/preflight.ts` — `trackingRef` (`refs/remotes/<remote>/<branch>`).
- `src/run-check.ts` — `leafFields`/`leafTarget` (what `run.leaf` holds for leaf, attempt and holder callers).
- `src/verify-pass.ts` — `passRecordSchema` (only needed to confirm it does NOT change).
- `tests/flaky.test.ts`, `tests/helpers.ts` (`fixture`, `seedRun`, `cli`, `callerWorktree`-style worktree/commit helpers as in `tests/verify.test.ts`).
- `docs/reference/files.md`, `docs/reference/commands.md`, `docs/reference/checks.md` — the three flaky/ledger statements being updated.
- `learnings/LESSONS.md` — no active lesson hits this leaf's mechanism.

## Decisions

- **D1 — the field (answers the design's "Open for the plan").** The row gains optional `patch_id`: the first field of `git diff <merge-base> <sha> | git patch-id --stable`, where merge-base is `git merge-base <sha> refs/remotes/<remote>/<branch>` in `repo.root`. Chosen over `pre_rebase_head === run1.sha`: it is computed entirely at run time inside verify (no merge-machinery coupling, works for leaf-scope and holder runs, survives more than one rebase, and `patch-id --stable` ignores hunk context/line numbers so identical own diffs on a moved base hash identically — verified: identical id before and after a rebase onto moved main). A different conflict resolution changes the diff and the id, which is exactly "own commits changed".
- **D2 — where it is recorded.** `runOnce` in `src/verify.ts` computes it before the initial receipt append; `verifyRunSchema` gains `patch_id: z.string().optional()`. `passRecordSchema` does not change (the value is derived inside the pass, not forwarded). When the diff is empty (sha == merge-base: base/holder/`--sha origin/main` runs) the field is absent, identical to pre-change rows. A `git merge-base` failure (unrelated history) propagates and fails the pass — same shape as the existing `treeOf` behavior.
- **D3 — pair rule.** `flips` sorts completed runs (`end` set, `setup === 0`) by `end` as today.
  - Same-tree: a pending red keyed `leaf\0tree\0command` resolves on a later green same key, `compares` runs included, names as today (nameless count). The `leaf` component is new: a flip is "a leaf's" pair, so same tree+command under another leaf is not a match.
  - Merge-scope consecutive pair: for items with `compares === undefined` and `scope === 'merge'`, the latest merge-scope item per `leaf\0name\0command` is tracked; red→green on different trees is a flip per named test when `red.patch_id` is present and equals `green.patch_id` and no breaking run sits between (D5). `compares` runs never enter this sequence — they are the machinery's base probe, not the leaf's merge run. A green resolves only its immediately preceding red: an intervening merge red for the same unit overwrites it, and the pair then counts only if the newer red flips later.
- **D4 — nameless set.** Cross-tree flips skip exactly: names starting `(script) `, names starting `(unnamed)`, `(no test name)`, `(log gone)`. Same-tree keeps counting them.
- **D5 — "between" guard.** For a cross-tree candidate red R→green G (ends `r.end` < `g.end`), a run E breaks it for test T when: E is completed, `r.end < e.end < g.end`, E holds an entry with the same `name`+`command`, real `exit !== 0` (not `blocked`, not `reused`), failing T (stored `failures` else log names), and E is a base run (`compares !== undefined`) or a landed-main run (`isAncestor(e.sha, tip)` where tip = `rev-parse trackingRef`, resolved lazily and memoized).
- **D6 — evicted shas.** Before `isAncestor`, `git cat-file -e <sha>^{commit}` (code 0 = present); an absent object is treated as not-ancestor, no throw. `isAncestor` itself is only called on objects that exist. Landed-main rows in tests therefore need real commits.
- **D7 — key shape.** Merge sequence key includes `name` (a unit is name+command+test); legacy same-tree key gains `leaf` only, keeping today's command-only matching inside one leaf.
- **D8 — docs.** `files.md` row for `verify-runs.jsonl` gains the `patch_id` sentence (same "does not parse under an older akrogon" pattern as `failures`) and the Flaky report section describes both pair forms; `commands.md` and `checks.md` `flaky` lines are reworded off "same tree".

## Interfaces

- `verifyRunSchema` += `patch_id: z.string().optional()`; `VerifyRun.patch_id?: string`.
- `flaky.ts` imports `isAncestor` (`./batch`) and `trackingRef` (`./preflight`) — no cycle: neither imports `flaky`.
- New helper in `verify.ts`: `ownPatchId(repo, sha) → string | undefined` = `git merge-base sha <trackingRef>` then `git diff <mb> <sha> | git patch-id --stable` (shell pipe), first whitespace field, `undefined` when empty.
- No CLI, schema-of-record (pass record), or output-format change; `akrogon flaky` output shape is unchanged.

## Condition checks (each decision's breakable condition → case)

| Decision | Condition a break could violate | Case / traced reason |
| --- | --- | --- |
| D1/D2 writer | receipt records the real `git diff merge-base..sha` id | writer test recomputes it independently for a leaf commit; empty-diff run must have the field absent |
| D3 consecutive | a non-immediately-preceding red must not pair | red,red,green: only the second red may flip (assert exactly the expected flips) |
| D3 patch match | different `patch_id` must not pair | same leaf+command, patch `p1` vs `p2` → 0, beside a positive control |
| D3 fieldless | a red row without `patch_id` cannot prove unchanged | fieldless red + patched green cross-tree → 0, beside a positive control |
| D3 leaf scope | another leaf's green must not pair | red leaf `leaf`, green leaf `other`, same patch → 0 |
| D3/D5 compares | base runs are not pair members but break pairs | `compares` red between → 0; `compares` failing a different test → still 1; `compares` ending after green → still 1 |
| D4 nameless | `(script) x`, `(unnamed)`, `(unnamed) s`, `(no test name)`, `(log gone)` produce no cross-tree flip | one red entry storing all five beside `alpha` → only `alpha` listed |
| D5 window | a breaking run outside `(r.end, g.end)` must not break | `compares` run ending after green → still 1 |
| D5 landed | an ancestor-of-tip red run breaks; a non-ancestor or absent sha does not | real commits: landed sha → 0; detached non-ancestor → 1; absent sha → 1 |
| D6 evicted | absent object must not throw or break | fake sha E row beside the pair → still 1 |
| D7 same-tree | same tree counts regardless of fields; different leaf does not pair | fieldless same-tree → 1 (also proves old rows count) |

Red-by-absence is the intended red for every case: the feature does not exist yet (cross-tree pairs are keyed on `tree`, `patch_id` is rejected by `strictObject`, and `patch_id` is never written). Each run's failing output is recorded below.

## File/criterion checklist — one wave

All units have disjoint owned paths, no shared test resource, no interdependency → a single wave, two units.

### U1 — code + tests

- Owns: `src/verify.ts`, `src/flaky.ts`, `tests/flaky-merge.test.ts` (new).
- `src/verify.ts`: add `patch_id` to `verifyRunSchema`; compute and record it in `runOnce` (`ownPatchId`).
- `src/flaky.ts`: `flips` gains the leaf-scoped same-tree key, the merge-scope consecutive sequence with `patch_id` match, the nameless filter, and the D5/D6 between-guard.
- Depends on: nothing (tests committed in this pass already define the contract).

### U2 — docs

- Owns: `docs/reference/files.md`, `docs/reference/commands.md`, `docs/reference/checks.md`, `src/AREA.md`.
- `files.md`: `verify-runs.jsonl` row gains `patch_id` (recorded at run time, the `merge-base..sha` stable patch id, absent on an empty diff; a ledger holding it does not parse under an older akrogon); the Flaky report section: a flip is red-then-green on the same tree, or — for merge-scope runs — on the leaf's next merge run after a rebase when the recorded `patch_id` matches and no base or landed-main run failed the named unit between; nameless names only count same-tree.
- `commands.md`, `checks.md`: `flaky` lines reworded off "same tree" to the same rule.
- `src/AREA.md`: `verify.ts` bullet's receipt-field sentence gains `patch_id` beside `failures`; the `flaky`/`main red` unit-matcher clause needs no change. `tests/AREA.md` groups test files and never names `flaky.test.ts` — no line to change. `command-reference.test.ts` only requires the `commands.md` first column to keep `akrogon flaky`.
- Skill files: `skills/chart-issues/*` mention `flaky` only as an intake candidate — no statement about trees, untouched.

## Done-criterion → proof

| Criterion | Observation that proves it | Boundary / state | Product failure caught | Proof command | Size | Rerun trigger |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `flakyLines`/`flaky` lists exactly one `alpha` flip for red merge run (tree A, `patch_id` p) → green merge run (tree B, `patch_id` p); the receipt of a real `akrogon verify` carries `patch_id` equal to an independently recomputed `git diff merge-base..sha \| git patch-id --stable`, and an empty-diff run carries none | `flakyLines` over hand-written rows plus `akrogon flaky` on seeded rows; a real verify pass in the fixture repo (fake systemd-run) | flip keying stays tree-bound (misses every post-rebase flake); writer never records the field | `akrogon run-check --name flaky-merge -- bun test tests/flaky-merge.test.ts` | seconds | any change to `src/flaky.ts`, `src/verify.ts` receipt writing, or the test file |
| 2 | the same pairs produce zero flips for: nameless names, `patch_id` mismatch, different leaf, fieldless red, non-consecutive red, a `compares` run failing the unit inside the window, a landed-main run failing the unit inside the window; and still produce the expected flips for the positive controls and the non-breaking variants (different test, end outside window, non-ancestor, absent sha) | same `flakyLines` boundary; landed check uses real commits in the fixture repo and its `origin/main` tracking ref | guard clauses dropped or inverted (silent over-counting = the leaf shipping a flaky-looking list that hides real regressions, or crash on evicted sha) | same command as criterion 1 | seconds | same |
| 3 | same-tree red→green counts as today (fieldless rows included), fieldless JSONL rows parse through `akrogon flaky`; existing `tests/flaky.test.ts` cases stay green | `flakyLines` + `akro flaky` CLI on `seedRun`-written rows (no `patch_id` = old format) | optional-field schema accidentally required (old ledger unparsable); same-tree rule dropped | same command plus `bun test tests/flaky.test.ts` | seconds | same |

`tests/flaky-merge.test.ts` also runs under the configured `test` check at review/merge (`bun test --timeout=30000 --parallel=4 --no-isolate`); the brief names no whole-suite requirement, so none is added here.

## Environment and grants

`readiness.yaml` is empty (`grants: []`, `env` config list empty). `akrogon status flaky-merge-flips` shows no `Missing:` lines → no credential check needed, no count lines (no covered launches).

## Proof machinery

None new: `bun test` exists at `AKROGON_BASE`, the fixture builds a registered repo with a real `origin` remote and fake `systemd-run`, and `seedRun`/`cli`/`verify` test helpers exist.

## Conflicts and limitations

- Brief vs design: none; D1 answers the design's only open question.
- Limitation (kept, real): a run whose own diff is empty (`sha == merge-base`) records no `patch_id`, so an empty-diff leaf can only flip same-tree — acceptable, an empty-diff leaf has nothing of its own to flake.
- Limitation: a rebase that resolves conflicts differently changes `patch_id`, so the pair reads as "own commits changed" — intended per the brief.
- `run.leaf` for `--holder` runs is `checkout`; holder merge pairs therefore group under that slug, same as today under the tree key.

## Planned-test red output

`bun test tests/flaky-merge.test.ts` on the unmodified base: 0 pass, 7 fail — each red is the missing behavior, recorded in `check flaky-merge: 1` log `check-flaky-merge-1795292324776-3991450.log`.

- `a named unit red then green on the leaf’s next merge run across a rebase lists one flip`: `flakyLines` returned `[]` for the cross-tree merge pair (today's key is `tree`); the CLI seeding also fails on `Unrecognized key: "patch_id"` from `strictObject`. Covers criteria 1 and the writer half of D1/D2.
- `a verify receipt records the merge-base..sha patch id, and none on an empty own diff`: `expect(run.patch_id).toBe(expected)` → `Expected: "17b9e5a44b79652f1166ea844f26581ca3c1010b" / Received: undefined` — the receipt never records the field.
- `nameless failures never flip across trees while a named one does`: returned `[]` where `[alpha ×1]` expected — D4 filter absent.
- `changed own commits, a different leaf, a fieldless row and a non-consecutive pair never flip`: returned `[]` where the four positive-control flips were expected — D3 pairing, leaf scoping and patch matching absent.
- `a base run failing the unit between the pair breaks it; other shapes still flip`: returned `[]` where the c10/c11 flips were expected — D5 between-guard absent.
- `a landed-main run failing the unit between the pair breaks it; a non-ancestor or evicted sha does not`: returned `[]` where the c13/c14 flips were expected — landed-main guard and D6 absent.
- `same-tree pairs count as today, with or without the new field`: `seedRun` throws `Unrecognized key: "patch_id"` — schema field absent (the pure fieldless same-tree part is already proven by `tests/flaky.test.ts`, which passes).

### Deliberate-break evidence

Temporarily patched `verifyRunSchema` with the optional `patch_id` field and `flips` with a same-tree `patch_id` equality check (the D3 "same-tree ignores the field" violation): the `same-tree` test failed exactly on the `beta` pair (`- "test": "beta"` dropped while the fieldless `alpha` pair still counted) — `check flaky-merge-break: 1` log `check-flaky-merge-break-1795292367586-4001593.log`. Edits reverted before the test commit; the worktree diff is tests-only.

## Commands run

- `check flaky-merge: 1` → `implementation/check-flaky-merge-1795292324776-3991450.log` (7/7 red by absence, the planned red).
- `check flaky-merge-break: 1` → `implementation/check-flaky-merge-break-1795292367586-4001593.log` (deliberate-break run, reverted).
- `check flaky-existing: 0` → `implementation/check-flaky-existing-1795292373686-4003063.log` (`bun test tests/flaky.test.ts` green — criterion 3's existing-suite half, no regression).
- An earlier `check flaky-merge: 1` (`check-flaky-merge-1795292323000-3991008.log`) and a first `flaky-merge-break` run (`check-flaky-merge-break-1795292355084-3998284.log`) were environment/probe failures (missing `node_modules`, non-breaking temp edit) — superseded by the runs above.

Criterion proof commands for implement/check: `bun test tests/flaky-merge.test.ts` (all three criteria) and `bun test tests/flaky.test.ts` (criterion 3's pre-change behavior).

## Implementation notes

- 2026-11-21 — Repair the verify writer and pairing against the brief’s criteria 1–3. Calculate patch identity with `git diff --unified=0 --inter-hunk-context=0 | git patch-id --verbatim` against the merge base and prove it through real rebases. Keep unrelated `verify --sha` usable when no patch identity exists, consume the next merge observation once, and preserve the legacy tree-and-command key for old same-tree receipts.
- 2026-11-21 — For brief criteria 1–2 and F5, record the merge base and carry an identity forward only when replaying the change in both directions reproduces both verified trees. The previous top need not exist.
