# Review A: shared-inventory

Base `21422a68`, reviewed head `d6a0c08` (tree identical to `d7f05174`; `d6a0c08` is a trailer-only commit).

## Verification evidence

- `akrogon verify` green at `d7f05174` — receipt run `9d79ed65`: format 0, `bun test` 1084/1084, typecheck 0 (`implementation/check-test-1792432823883-4008944.log`, `check-typecheck-1792432826162-4008944.log`).
- `cd skills/watch-issues && bun test scripts`: 48/48.
- In-session `bun test` shows 16 `tests/peer-wait.test.ts` 5 s timeouts that reproduce identically at base `96a96979` and `21422a68`; green inside verify's fresh checkout twice. Environmental, not the leaf.

## Diff read

All seven units reviewed file by file: `state.ts` (inventory + strict `readState` + folder-name `findLeaf`), `next.ts` (discover/report/capacity/selectLeaves/reconcile calls), `status.ts` (scanRepo/failure lines/`status <slug>`/unpacked), `phase.ts` (ownerScope failure gate), `reconcile.ts` (failures param, collectSlugs deleted, ownerCompletes, reconcileHost), `park.ts`/`stop.ts`/`timing-report.ts`, `config.ts`/`run-check.ts`/`verify.ts`, `observe.ts`, and every test change with its `Test-Change` trailer.

## Findings

### Fixes

- **F1 — `reconcile` drops a foreign leaf's unregistered store entries; `inventoryFailures` omits `foreign` basenames.** Source: an operator renames a repo registration or edits a leaf's `repo:` key, and a copy directory `issues/.store/<foreign-slug>.old` (unregistered, so not covered by the registered-row `unmanaged worktree` keep) exists in this repo's store. Today `knownSlugs = leafSlugs + ownedNames(unreadable only)`, `matchSlug('foreign-slug')` is undefined, and the entry falls to `dropUnowned`/`dropChecked` — deleted. Design D6 ("a failure path counts as owned for worktree/tab/slice cleanup") and line 13's "a bad leaf stays owned for cleanup" cover `foreign` as an `Inventory` failure class; `reconcileHost` already half-implements it (`inventoryErrors` conservative keep covers foreign slices) but `reconcile`'s candidate loop does not. Pre-state.ts the old `collectSlugs` kept the foreign leaf's inner slug in `knownSlugs`, so this path was never reachable — the drop is new behavior introduced by this leaf. Data loss in the leaf's own store. Fix: include `basename(f.path)` for `inv.foreign` entries in `inventoryFailures.ownedNames` (and, for parity with `unreadable`, `leafSlice(repo, basename(f.path))` in `reconcileHost`'s `badSlices`).
- **F2 — `skills/watch-issues/SKILL.md:24` now describes output that cannot be absent.** The leaf adds `unreadable=<file> error=<msg>` lines to `observe.ts` stdout (plan D12/IN6), including the failures-only case ("prints only failures when no healthy leaves exist"). SKILL.md still reads "it prints one line per leaf sorted by slug, nothing when the open tree is empty" — false today whenever a leaf's state is unreadable (the watch agent is told no output is possible and gets lines). Source: any unreadable `state.yaml` under `issues/open` — the exact input this leaf exists for. Consequence: the consuming skill's contract contradicts the tool it instructs; a watch pass reading the contract literally treats failure lines as unexpected output. Hits plan Docs section ("No agent or human doc is affected" — wrong; this SKILL.md is the doc page describing the changed behavior).

### Nits

- N1 `src/status.ts:436–441`: `status <slug>` runs `repoInventory` + `hasLeafFolder` + `findLeaf` (three walks), and the `flagged` post-`findLeaf` check is unreachable — an unreadable leaf's `findLeaf` already throws. Behavior quirk beside it: a nonexistent `<slug>` in a repo with any unreadable leaf reports the first bad leaf's error instead of `Missing leaf` (deliberate per worker note, keeps an ugly message shape). No test broken; defer.
- N2 `src/state.ts` `slugFolders` swallows `readdirSync` errors silently, so an unreadable `issues/open` subtree reports `Missing leaf` rather than a read error. Cosmetic degradation vs. the old crash; the `unknown` class is still reported through every consumer's inventory.
- N3 `src/phase.ts` `ownerScope`/`ownerCompletes` gates on `unreadable`+`unknown` but not `foreign` — `readInventory` cannot detect foreign (no repo context). A foreign leaf inside an owner's subtree does not block completion. Same behavior as before (foreign passed the old gate by `state.phase`), so no regression; the design's "failures inside the subtree block" wording arguably covers it.
- N4 Error-shape inconsistency for foreign entries: `observe.ts`/`status.ts`/`config.ts`/`run-check.ts` use the full `Leaf repo mismatch at <folder>: stored key "…", registered key "…"` while `park.ts` `failures()` and `timing-report.ts` emit only `stored key "…", registered key "…"`. Same information, two texts.
- N5 `reconcileNeedsPanes` still takes `leaves` only; a bad leaf's live slice does not make the pass request panes (the worktree path stays kept via `unknown directory` regardless, but slice/tab checks inside the candidate loop degrade). Minor.
- N6 `report()` for `unreadable` entries prints the leaf folder, not the `state.yaml` path, matching old `discover` report paths but less file-specific than the new `status` lines. Cosmetic.
- N7 `plan.md` IN8 says the format check flagged "the same files at base as on the leaf" — true only for some files; `d7f05174` then correctly formatted the rest. Historical note only.

## Docs

`docs/guide/next.md` already documents `unreadable` dependency labels and remains accurate; `docs/guide/status`/`problems.md`/`files.md` describe no per-leaf failure line contract. `skills/watch-issues/SKILL.md` is the one stale page (F2). `src/AREA.md`, `tests/AREA.md`, `skills/AREA.md` describe behavior, not walk internals — verified present, no pointers to deleted functions.

## Verdict

**fix** — F1 loses data in the leaf's own store along a path this leaf created, and F2 leaves the consuming skill's contract false. The rest of the diff faithfully implements D1–D15 and IN1–IN7: failure classification, per-invocation report dedup, capacity accounting, owner completion blocking, conservative `unknown` keeps, and criterion-7 scan all read correctly, and every criterion test is green at the reviewed head.
