# Plan: shared-inventory

Debate off (`debate: "no"`): synthesized directly from brief and design. Resolves the design's open questions: D1 names the function and type encoding; D2 answers the duplicate-slug report form.

## Decisions

- D1 — One inventory in `src/state.ts`:
  ```ts
  type LeafFailure = { path: string; error: string };            // path is the leaf folder (unreadable) or the unlistable directory (unknown)
  type ForeignLeaf = { path: string; stored: string };
  type Inventory = { leaves: Leaf[]; unreadable: LeafFailure[]; unknown: LeafFailure[]; foreign: ForeignLeaf[] };

  readInventory(path: string, areaRoot: string): Inventory       // subtree walk; no repo checks (serves open, closed, parked)
  repoInventory(repo: Repo, areas: readonly ['open','closed','parked']): Inventory  // all three areas + repo-key + duplicate-slug checks
  ```
  `repoInventory(repo)` defaults to `['open', 'closed']` for backward parity with `allLeaves`. Repo-key violations populate `foreign`; duplicate readable slugs populate `unreadable` (D2). `allLeaves(repo)` is rewritten as `repoInventory(repo).leaves` (never throws on a bad leaf); `leavesUnder(path, areaRoot)` is rewritten as `readInventory(path, areaRoot).leaves`. Both aliases keep existing call sites on readable-only views; the throw-on-bad-leaf behavior is deleted, not kept. `readState` deletes the 4-key skip list and the `withoutEmptyMembers` shim (Taken 2a).

- D2 — Duplicate readable slugs: every leaf sharing the duplicated slug becomes an `unreadable` entry `{path, error: "Duplicate leaf slug: <slug>"}` and is removed from `leaves` (same as `discover` today; each entry reported once per invocation). A bad `findLeaf` target reports the folder's own `readState` error.

- D3 — `findLeaf(repo, slug)` scans `hasSlugFolder`-style under `issues/open` then `issues/closed` by folder name, reads only the named folder(s), returns the parsed leaf; throws `Missing leaf: <slug>` (+`(parked)`) when no folder matches, `Duplicate leaf slug` when more than one folder matches, and propagates `readState`'s own error when the named folder's `state.yaml` is bad — never consults a bad sibling.

- D4 — `src/next.ts`: `Inventory`/`discover`/`Invocation` move to `state.ts` shape; `discover(repo, invocation)` = `repoInventory(repo)` + one report pass: each `unreadable`/`unknown` entry through `report()` (deduped per invocation as today), `foreign` through the existing once-per-repo aggregate. Capacity rule unchanged: `unreadable.length` per leaf, `unknown.length > 0` holds `max_active`, `foreign` holds none. All `allLeaves(repo)` uses inside merge machinery become `repoInventory(repo).leaves`.

- D5 — `src/status.ts` `scanRepo` returns `{ ok: true, …, failures: { path, error }[] }`. Unreadable/foreign leaves report `path` = the leaf's `state.yaml` file; `unknown` directories report the directory itself. `status` prints one `{unreadable, path, error}` JSON line per failure, exit 1 if any. Whole-repo failures (unreadable repo root/config/log) keep the existing `{ok:false}` line. `status <slug>` uses `findLeaf` (D3).

- D6 — `src/reconcile.ts`: `reconcile(repo, inv: Inventory, live)` replaces `reconcile(repo, leaves, live)`; `knownSlugs` collects `leaves` slugs plus `basename(unreadable.path)` for each unreadable leaf (a failure path counts as owned for worktree/tab/slice cleanup); `unknown.length > 0` treats the repo inventory as unprovable (conservative keeps, as today's `inventoryErrors` path in `reconcileHost`). `ownerCompletes` returns false while its owner's subtree holds any failure. `reconcileHost` builds `leafOf` from `repoInventory` (bad leaf basename → slice identity) and keeps the `inventoryErrors` conservative keep whenever any area reports failures.

- D7 — `src/phase.ts` `ownerScope`/`completeOwner` walk via `readInventory`; any failure inside the owner's subtree blocks completion (`completeOwner` returns null, `ownerCompletes` false); failures outside are invisible to the check.

- D8 — `src/park.ts`: `running`, `stranded`, `settle`, and the final `appendTiming` pass walk via `readInventory`. A failure inside a folder `park`/`unpark` would move throws naming the failure (action blocked); failures elsewhere are ignored for the move itself, while `stranded`/`settle` count bad leaf basenames as `known` so a dependency on an unreadable leaf is not reported "dangling" (it is unmet, matching the `unreadable` dep label).

- D9 — `src/stop.ts` `stop --all` lists `repoInventory(repo, ['open']).leaves` and reports each `unreadable` entry on stderr (exit nonzero via `process.exitCode`); `stop <slug>`/`start <slug>` keep `findLeaf` (D3) so a bad target errors naming its file.

- D10 — `src/timing-report.ts`: `allLeaves(repo)` + `leavesUnder(parked)` become `repoInventory(repo, ['open','closed','parked'])`; any failure throws `Invalid state …`/`error` naming the bad file — the report is blocked, outside failures irrelevant only because the whole report reads the whole tree.

- D11 — `src/config.ts` `effectiveConfig` and `src/run-check.ts` `leafTarget`: worktree matching uses `repoInventory(repo)`. No healthy match: if any failure's folder basename equals `basename(realTop)`, throw an error naming the failure's `state.yaml` and error; else `config` proceeds with `leafPath` undefined exactly when `top === repo.root` (repo-root runs never error), and `run-check` keeps its "No leaf worktree matches cwd" path. A failure can only possibly match a worktree whose basename equals its folder name — the only name an unreadable leaf has.

- D12 — `skills/watch-issues/scripts/observe.ts`: delete local `leavesUnder`, `readState`, `validateLeafDepth`; walk `issues/open` via `repoInventory(repo, ['open'])` (imported from `src/state.ts`); print each healthy leaf as today, plus one line per failure as `unreadable=<path> error=<message>` (unreadable + foreign; unknown directories impossible to name a leaf under are printed the same way), still exit 0 — "reports a healthy open leaf beside a bad sibling and names the bad file" (B).

- D13 — `unmergedDeps`/`hasLeafFolder`/`isParked` are unchanged folder-existence checks: a `blocked-by` naming a bad leaf stays `unreadable`-labeled without parsing it (D3 keeps the parse out of the dependency path).

- D14 — Reporting dedup stays invocation-scoped inside `discover`; no module other than `state.ts` walks issue areas for `state.yaml` or parses leaf state outside `readState` (criterion 7). The plan's own proof scans `src/` and `skills/` for `state.yaml` literals and `leavesUnder`-style walkers; `turn.ts`'s `hasLeafFolder`/`isParked` and `status.ts`'s `issueFolders` are folder-name checks, not state reads, and stay.

- D15 — `status` detail for a bad target (`status <bad slug>`) surfaces `findLeaf`'s own error (path + parse message), same as `phase`/`next` naming it (criterion 3 shape).

## Read-first paths

- `src/state.ts` — schema, `readState` (skip list + `withoutEmptyMembers` to delete), `leavesUnder`, `allLeaves`, `findLeaf`, `hasSlugFolder`, `validateLeafDepth`.
- `src/next.ts:109–190` (`Inventory`, `report`, `discover`), `:408–417` (capacity), `:1257–1318` (`resolveName`, `selectLeaves`), `:846–1100` (merge machinery's `allLeaves` uses), `:1320–1420` (`reconcileRepos`, `nextCommand`).
- `src/status.ts:37–112` (`Scan`, `scanRepo`), `:379–400` (`unpackedLines` walk), `:432–445` (detail `findLeaf`), `:449–500` (failure lines + `process.exitCode = 1`).
- `src/reconcile.ts:245–260` (`ownerCompletes`), `:383–445` (`reconcileNeedsPanes` + `reconcile` head), `:483–512` (`collectSlugs`), `:1140–1200` (`reconcileHost` `allLeaves` + `inventoryErrors`).
- `src/phase.ts:190–260` (`ownerScope`, `completion`, `ownerCompletion`, `completeOwner`), `:800–815` (merge-turn `allLeaves`).
- `src/park.ts:22–90` (`running`, `stranded`, `parkCommand`, `settle`), `src/stop.ts:56–90`, `src/timing-report.ts:435–445`.
- `src/config.ts:354–378` (`effectiveConfig` leaf match), `src/run-check.ts:96–125` (`leafTarget`), `src/verify.ts:270–280` (`verifyCaller`).
- `skills/watch-issues/scripts/observe.ts:75–125` (local walker/parser to delete), `:255–275` (`main` leaf loop).
- `tests/helpers.ts` (`fixture`, `cli`, `leaf`, `yaml`, `fakeHerdr`, `dispatchFixture` pattern), `tests/next.test.ts:715–760` + `:1248–1280` + `:1423–1530` (unreadable/foreign tests to extend), `tests/status.test.ts:349–470` (unreadable diagnostics), `tests/state.test.ts` (lazy-migration cases to rewrite), `skills/watch-issues/scripts/observe.test.ts` (abort cases to rewrite), `src/test-files.ts` (`testFile` rule for `Test-Change` trailers).

## Interfaces

- `src/state.ts` exports: `Inventory`, `LeafFailure`, `ForeignLeaf`, `readInventory`, `repoInventory`, `findLeaf`, `readState`, `saveState`, `stateSchema`, `allLeaves` (readable alias), `leavesUnder` (readable alias), `validateLeafDepth`, `hasLeafFolder`, `isParked`, `Leaf`, `State`, `RepoMismatchError`, `withLock`, `broadcastPending`, `broadcastSchema`, `batchSchema`, `failureSchema`, `deliveryErrorSchema`, `sourcePattern`, `toolSchema`.
- `src/next.ts` exports nothing new; `discover` keeps its `(repo, invocation)` signature so `report()` dedup stays inside `next.ts`.
- `src/reconcile.ts`: `reconcile(repo: Repo, inv: Inventory, live: Pane[] | null): Promise<Reconciled>`; `reconcileNeedsPanes(repo: Repo, inv: Inventory): Promise<boolean>`.
- `src/status.ts`: `Scan` gains `failures: LeafFailure[]` on `ok: true`.
- `skills/watch-issues/scripts/observe.ts` imports `repoInventory`, `Leaf`, `State` from `../../../src/state`.

## Waves

Serial-solo check: wave 1 is a prerequisite of every later unit; waves 2–3 units own disjoint paths and share no test resource beyond the read-only fixture helpers.

### Wave 1 (prerequisite)

- U1 `src/state.ts` — `Inventory`/`LeafFailure`/`ForeignLeaf` types, `readInventory`, `repoInventory`, rewritten `findLeaf` (D1–D3), `readState` skip-list/shim deletion, `allLeaves`/`leavesUnder` aliases. Owns: `src/state.ts`.

### Wave 2 (needs U1; disjoint)

- U2 `src/next.ts` — `discover` on `repoInventory`, reporting, capacity, `resolveName`/`selectLeaves`, all merge-path `allLeaves` uses. Owns: `src/next.ts`.
- U3 `src/status.ts` — `scanRepo` inventory + `failures`, per-failure JSON lines, `unpackedLines` walk, detail `findLeaf`. Owns: `src/status.ts`.
- U4 `src/phase.ts` — `ownerScope`/`completeOwner`/`ownerCompletion` inventory walks, merge-turn `allLeaves`. Owns: `src/phase.ts`.

### Wave 3 (needs U1; disjoint)

- U5 `src/reconcile.ts` — `reconcile`/`reconcileNeedsPanes`/`reconcileHost` on `Inventory`, `collectSlugs`→bad-basename ownership, `ownerCompletes` failure check. Owns: `src/reconcile.ts`.
- U6 `src/park.ts`, `src/stop.ts`, `src/timing-report.ts` — D8–D10. Owns: `src/park.ts`, `src/stop.ts`, `src/timing-report.ts`.
- U7 `src/config.ts`, `src/run-check.ts`, `src/verify.ts`, `skills/watch-issues/scripts/observe.ts` — D11–D12 worktree matching + observe inventory. Owns: those four files.

Units in wave 2/3 touch disjoint paths and share only `tests/helpers.ts` (read-only fixture). All waves are needed: U1 lands first, waves 2–3 parallel.

## Docs

No agent or human doc is affected. `src/AREA.md`, `tests/AREA.md`, `skills/AREA.md` describe behavior, not the walk implementation; `docs/` pages name no per-command walk. (Verified: `grep -rn "leavesUnder\|allLeaves\|discover\|state.yaml" docs/ src/AREA.md tests/AREA.md` — only code references in `src/AREA.md`'s `Test-Change` prose.)

## Verification

Every criterion is proven through the existing CLI fixture (`tests/helpers.ts` `fixture`/`cli`/`leaf`/`yaml`/`fakeHerdr`); no new proof machinery. Proof commands run through `akrogon run-check --name <label> -- bun test <file>`.

| # | Criterion | Proof | Test | Command | Size | Rerun |
|---|-----------|-------|------|---------|------|-------|
| 1 | One bad leaf's `state.yaml` stops only itself: `next`/`phase`/`config`/`run-check`/`status` work for a healthy sibling; `status` lists healthy leaves + one bad-file entry, exits 1 | Real CLI boundary: fixture repo with `slug: [` (malformed YAML) + unknown-key state + healthy leaf; asserts `next <healthy>` dispatches (fake herdr prompt), `phase <healthy> failed` moves, `config` from its worktree resolves it, `run-check` from its worktree runs, `status` prints healthy leaf + one `{unreadable, path: <bad>/state.yaml}` line, exit 1. Catches: the bug where `allLeaves`/`scanRepo`/`status`/`config`/`run-check`/`phase` all threw on the bad sibling (repo-wide failure, #102). | `tests/state-inventory.test.ts` `one bad leaf stops only itself` | `bun test tests/state-inventory.test.ts` | minutes | Any change to `state.ts`/`next.ts`/`status.ts`/`config.ts`/`run-check.ts` |
| 2 | Same isolation for malformed YAML, invalid known value, bad under `issues/closed`, unknown top-level key | Parameterized same fixture: bad leaf moved to `issues/closed/<owner>/<slug>`; healthy leaf still dispatches + `status` still exits 1 naming the closed path. | same file `bad leaf under closed, malformed YAML and invalid known value` cases | same | minutes | same |
| 3 | Naming the bad leaf gives its own error naming its file | `next <bad>` and `phase <bad> failed` both fail with the `Invalid state <path>/state.yaml` error, not `Missing leaf`. | same file `naming the bad leaf returns its own error` | same | minutes | same |
| 4 | Bad leaf never dispatched, never takes merge turn, counts owned: reconcile keeps worktree+tab, capacity slot held, own owner does not complete, dependents stay blocked, other owner completes | Fixture: bad leaf with recorded `worktree`+`tab`; healthy merge leaf + `holding(f)` batch in a different owner — `phase <merge-leaf> merged` completes its own owner while the bad leaf's owner (epic) stays open; `next` on a `blocked-by: [bad-basename]` dependent stays `unreadable`-blocked; capacity already proven by existing `one unreadable leaf blocks all capacity at max_active 1`. Reconcile pass keeps the bad leaf's `store/<basename>` worktree and `tab`-labeled herdr tab. | same file `bad leaf counts as owned` + extended `tests/next.test.ts` capacity cases | `bun test tests/state-inventory.test.ts tests/next.test.ts` | minutes | Any change to `reconcile.ts`/`phase.ts`/`turn.ts`/`next.ts` |
| 5 | `observe.ts` reports healthy leaf beside bad sibling, names the bad file | `skills/watch-issues/scripts/observe.test.ts` rewritten: bad `state.yaml` beside healthy leaf exits 0, prints the healthy `slug=` line and one `unreadable=<path> error=` line naming `state.yaml`. | `skills/watch-issues/scripts/observe.test.ts` `unreadable state.yaml is reported beside a healthy leaf` | `cd skills/watch-issues && bun test scripts` | seconds | Any change to `observe.ts`/`state.ts` |
| 6 | Retired keys (`priority`, `slot`, `failed_notified`, `solo`, empty `batch.members`) reported as the leaf's own error | Rewritten `tests/state.test.ts` lazy-migration cases: every retired-key variant across `open`/`closed`/`parked` now throws the leaf's own `readState` error naming its file instead of stripping. | `tests/state.test.ts` rewritten `lazily migrates`→`retired keys fail` cases | `bun test tests/state.test.ts` | seconds | Any `readState`/`stateSchema` change |
| 7 | No module other than `src/state.ts` walks issue areas for `state.yaml` or parses leaf state outside `readState` | Source property test: scan `src/**/*.ts` + `skills/**/*.ts` for `state.yaml` literals and `leavesUnder`-style walkers; only `src/state.ts` may contain them; `turn.ts`'s folder-name checks are exempted by assertion on the exported surface, not a hand-copied file list. | `tests/state-inventory.test.ts` `only state.ts walks leaf state` | `bun test tests/state-inventory.test.ts` | seconds | Any new issue-area walk |

Red-first (recorded below after running): criteria 1, 2, 4, 5, 6 fail today because `allLeaves`/`scanRepo`/`observe` throw or abort on the bad sibling and `readState` strips retired keys. Criterion 3's `next <bad>` path is already red-first behavior in `discover`; its assertion guards the `findLeaf`/`phase` side. Criterion 7's scan proves the deletion lands.

## Acceptance criteria → tests

- AC1–AC6 ↔ table above; each new test is committed red before product code with `Test-Change` trailers on `tests/state.test.ts` and `tests/next.test.ts` (both already exist → `M` status). `tests/state-inventory.test.ts` is new (`A` status → no trailer needed for it, but the commit message names it).
- The `Test-Change` trailer rule (`src/test-files.ts` + `src/phase.ts:417–535`) requires a `Test-Change: <path> <source and reason>` trailer for every *modified* test file on the leaf branch before `phase merged`; added files need no trailer. `tests/state.test.ts` rewrites carry `Test-Change` citing design Taken 2a; `tests/next.test.ts` extensions carry one citing the unreadable-capacity extension.

## Limitations

- `findLeaf` matches by folder name, not `state.slug`: a folder whose inner `slug` differs stays unreachable by its inner name (same as today's `hasSlugFolder` convention); `dispatchLeaf`'s `Leaf identity changed` check still catches a read-back mismatch.
- A bad leaf's ownership is its folder basename only: an unreadable leaf whose worktree or tab was recorded under a different name cannot prove that ownership, so its worktree/tab are kept by name-match alone (`store/<basename>`, herdr `label == basename`). No stronger binding is possible without reading the bad file.
- `unreadable` capacity counts duplicate-slug leaves twice if both entries share a slug pair (each folder is one capacity slot, matching today's `result.unreadable += 1` per duplicate).
- `observe.ts` prints failures to stdout interleaved with healthy lines; a consumer that parses only `slug=` lines is unaffected, one that JSON-parses every line was already broken by the herdr-failure path.
- `status`'s whole-repo `{unreadable: <repo>, path: <repo root/config/log>}` diagnostic stays for non-leaf failures; the per-leaf form applies only to leaf-level `state.yaml`/depth/repo-key/duplicate failures.

## Red-run records

- `check state-inventory: 1 …/implementation/check-state-inventory-1792428142403-2930799.log` — 0 pass, 8 fail. Every criterion case fails before the change: `status` reports the whole repo `{unreadable:"repo", path:…/bad-leaf/state.yaml}` and omits `healthy`; `phase healthy failed` exits 1 on the bad sibling; `next bad-leaf`/`phase bad-leaf` report the folder without naming `state.yaml`; `phase sibling merged` exits 1 (owner-scope `leavesUnder` throws); the closed-area bad leaf is reported by `status` as the area root `issues/closed`, not its own file; the source scan lists `src/next.ts`, `src/reconcile.ts`, `src/status.ts`, `skills/watch-issues/scripts/observe.ts` as the four modules holding `state.yaml`/`stateSchema` literals.
- `check state-retired-keys: 1 …/implementation/check-state-retired-keys-1792428145112-2934026.log` — 0 pass, 1 error: `SyntaxError: Export named 'repoInventory' not found in module '…/src/state.ts'`. The rewritten retired-key and depth cases cannot even load; the retired-key expectations additionally fail on `readState`'s strip-and-accept path once the export exists (the strip is the mechanism criterion 6 outlaws).
- `check observe-inventory: 1 …/implementation/check-observe-inventory-1792428155774-2934484.log` — 43 pass, 5 fail: the five rewritten abort cases (`unreadable`, `schema-invalid`, `wrong-repo`, `invalid leaf depth`, `duplicate slug`) all exit non-zero today instead of reporting the bad leaf beside the healthy one.

These outputs are the proof each criterion's test is red for the missing behavior; no test was fitted to pass against today's code.

## Implementation notes

- 2026-10-19 IN1: `findLeaf` enforces `state.repo === repo.name` with `RepoMismatchError` after reading the named folder — required by the existing `status wrong-key` detail assertion and by `phase`/`next` naming a foreign leaf.
- 2026-10-19 IN2: `reconcile` keeps its positional signature as `reconcile(repo, leaves, live, failures?: { ownedNames: ReadonlySet<string>; incomplete: boolean })` and `reconcileNeedsPanes` keeps `(repo, leaves)` — replaces the planned `Inventory`-typed parameters so the embedded `reconcile(r, allLeaves(r), …)` calls in `tests/reconcile.test.ts` and `tests/store-sweep-safety.test.ts` keep working; `state.ts` exports `inventoryFailures(inv)` building the argument.
- 2026-10-19 IN3: `readState` wraps file-read and YAML-parse errors to name the `state.yaml` path (`Cannot read state at <file>: …`, `Invalid state <file>: …`), matching the deleted observe.ts messages; the Zod wrap already names the file.
- 2026-10-19 IN4: `findLeaf` refuses a folder whose parsed `state.slug` differs from the folder name (`Leaf slug mismatch at <path>: folder "<name>", state slug "<slug>"`) — a name/state mismatch is a bad leaf with its own error, preserving the old slug-keyed semantics.
- 2026-10-19 IN5: `status` leaf-level failure lines keep the `{unreadable: <repo>, path, error}` shape; `path` is the leaf's `state.yaml` for unreadable and foreign entries and the unlistable directory for unknown.
- 2026-10-19 IN6: `observe.ts` prints only failures when no healthy leaves exist, still without calling herdr; failure lines sort by path after the sorted healthy lines.
- 2026-10-19 IN7: the criterion-7 source scan was corrected (A's one allowed expectation correction): constructing `resolve(folder, 'state.yaml')` for a failure report is not a walk or a parse, so the scan flags leaf-marker comparisons, fs reads/parses of a state file and `stateSchema` references — `resolve(...)` stays legal in status.ts/observe.ts/config.ts/run-check.ts.
- 2026-10-19 IN8 (implementation findings): the red pass exposed three stale-fixture corrections, all committed with Test-Change trailers — (a) `tests/state-inventory.test.ts` criterion-7 scan narrowed to walks/parses (`resolve(folder,'state.yaml')` for reporting is not a walk); (b) fixtures carrying retired keys (`status.test.ts` ×2, `pause-next.test.ts`, `observe.test.ts` legacy case) corrected to canonical states; (c) two assertions of deleted behaviors removed (`batch.test.ts` solo-key drop, `batch-dispatch.test.ts` empty-members resume; `state-inventory.test.ts` tab-count assertion narrowed to the bad leaf's own tab because reconcile now actually runs and closes the merged leaf's dead broadcast tab). Full `bun test`: 1068 pass, 16 fail — all 16 are `tests/peer-wait.test.ts` 5 s timeouts that fail identically on base 96a96979 (pre-existing environmental red, unchanged by this leaf). Format check: `prettier --check` flags the same files at base as on the leaf — formatting unchanged.
