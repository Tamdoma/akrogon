# Plan: index-seats

## Decisions

- D1: One seat schema at every level. In `src/config.ts`, slot fields use `z.string().trim().min(1).regex(/^[^'"]*$/)` inside the existing `z.strictObject({ harness, model, effort })`; `globalSchema` and `repoSchema` pick it up unchanged through `slotConfigSchema`. `const text` stays for other fields.
- D2: One front matter reader in `src/config.ts`. Given a leaf path, compute the path relative to `<root>/issues/open` or `<root>/issues/closed` (`relative()` result not starting `..`); outside both, no index. Depth 2 (`<owner>/<leaf>`) reads `<owner>/ISSUE.md`; depth 3 (`<epic>/<issue>/<leaf>`) reads `<epic>/<issue>/ISSUE.md` then `<epic>/EPIC.md`; nearest present seat wins per seat; a missing index file contributes nothing. A file whose first line is not `---` has no front matter; otherwise the block ends at the next `---` line and `Bun.YAML.parse` + `z.strictObject({ slots: z.strictObject({ a: seat.optional(), b: seat.optional() }) })` validates it.
- D3: Front matter failures throw a dedicated `SeatIndexError` carrying the absolute file path and the parse or schema reason (with the seat key when the failure sits under `a`/`b`), so `next`/`status`/`config` all surface it and `scanRepo` can add it to its caught set for the `unreadable` line.
- D4: `seats(global, repo, leafPath?)` returns `{ a, b, source: { a, b } }` where `source` is the absolute index path, `resolve(repo.root, 'issues/config.yaml')`, or `resolve(globalHome(), 'config.yaml')`. Resolution per seat: index → repo slots → global slots. The existing harness-template check moves to the resolved seats and throws naming the source and seat. Two-arg calls keep working, so `src/init.ts:44` needs no change.
- D5: `src/next.ts`: `launch(global, repo, slot, leafPath)` resolves through `seats(global, repo, leafPath)`; the call at `src/next.ts:528` and the pre-allocation call at `src/next.ts:655` pass `leaf.path`, so malformed indexes and missing templates fail before tab or worktree allocation.
- D6: `src/status.ts` detail: after the state YAML, print a label line that these are the seats the next agent start uses, then `Bun.YAML.stringify` of `{ seats: { a: {harness, model, effort, source}, b: {...} } }` from `seats(global, repo, leaf.path)`. Table: `cells`/`note` gain the leaf path (and `global`, `repo` are already in `scanRepo` scope; compute `seats(...).source` during `walk` and store it on the scanned leaf); `note()` appends `seats <basename>` when either source is an index file.
- D7: `effectiveConfig(cwd)`: when `repo` exists and `realpathSync(top)` equals `realpathSync(state.worktree)` for some leaf from `allLeaves(repo)` (guard with `existsSync`), `slots` prints `seats(global, repo, leaf.path)` minus `source`; otherwise `seats(global, repo)` minus `source`. `allLeaves` is imported dynamically inside the function (`await import('./state')`) to avoid the `config → state → park → config` cycle. `AKROGON_BASE` and the rest of the printed shape are unchanged.
- D8: Docs in one place each: `docs/guide/cheat.md` gets the front matter block example beside the repo `slots` example with the resolution order; `docs/guide/files.md` gets the block and resolution order under the ISSUE.md/EPIC.md artifact descriptions. `parts.md` and `setup.md` are not required by the criterion and stay untouched.

## Open limitation (preserved)

A per-leaf B seat choice does not govern a merge carried by another holder's B (batching preserved); a seat edit during a running session applies only at the next agent start.

## Read-first paths

- `src/config.ts` — `slotConfigSchema`, `seats()` (line 60), `effectiveConfig()` (line 177)
- `src/next.ts` — `launch()` (line 252), `dispatchSlot` call site (line 528), pre-allocation `seats()` (line 655)
- `src/status.ts` — `scanRepo`/`walk` (line 38), `note()` (line 95), `statusCommand` detail block (line 298)
- `src/state.ts` — `leavesUnder`/`allLeaves`/`validateLeafDepth` (lines 114-145), `src/init.ts` line 44 (unchanged `seats` caller)
- `tests/helpers.ts` — `fixture` (fake harness `fake --model {model} --effort {effort}`), `leaf(f, slug, phase, extra, container)` where `container: 'epic/issue'` builds a depth-3 leaf, `fakeHerdr` records `starts`
- `tests/next.test.ts` — `dispatchFixture`, `database`, `skips` (~line 39-60); `tests/config.test.ts` line 130 (invalid slots shapes); `tests/status.test.ts` — `cell`/`leafRow` helpers (lines 16-28)
- `docs/guide/cheat.md` (lines 31-37, repo slots example), `docs/guide/files.md` (artifact list), `docs/guide/setup.md` line 59 (existing `slots` prose)

## Needed interfaces (from design, verbatim shape)

```ts
const seat = z.strictObject({
  harness: z.string().trim().min(1).regex(/^[^'"]*$/),
  model:   z.string().trim().min(1).regex(/^[^'"]*$/),
  effort:  z.string().trim().min(1).regex(/^[^'"]*$/),
});
const indexSchema = z.strictObject({ slots: z.strictObject({ a: seat.optional(), b: seat.optional() }) });

seats(global: GlobalConfig, repo: Repo, leafPath?: string):
  { a: SlotConfig; b: SlotConfig; source: { a: string; b: string } }
```

## Checklist

### Wave 1

- U1 — `src/config.ts`, `tests/config.test.ts` (owns both; shared resource: `tests/helpers.ts` fixture, unchanged; prerequisites: none)
  - Tighten `slotConfigSchema` per D1; add `indexSchema`, `SeatIndexError` and the front matter reader per D2/D3; change `seats()` signature and source reporting per D4; change `effectiveConfig` leaf-worktree matching and strip `source` from printed `slots` per D7.
  - Extend `tests/config.test.ts`: blank and quote-carrying slot values rejected at repo and machine level (extends the line-130 test); `config` inside a managed leaf worktree (recorded `state.worktree` + `git worktree add`) prints index slots, from a subdirectory inside it too; registered root, unrelated linked worktree and outside print as today (criterion 3); `config` in a managed worktree exits non-zero naming the index path when its front matter is malformed (criterion 2, config side); an ISSUE.md without `---` front matter resolves as before (criterion 5, config side).
- U2 — `docs/guide/cheat.md`, `docs/guide/files.md` (owns both; prerequisites: none)
  - One example block plus resolution order in each, per D8 (criterion 6).

### Wave 2 (needs U1's `seats` signature landed)

- U3 — `src/next.ts`, `tests/next.test.ts` (owns both; shared resource: `tests/helpers.ts`, `tests/fake-herdr.ts`, unchanged; prerequisites: U1)
  - `launch` and the pre-allocation validation take `leaf.path` per D5.
  - Tests (criterion 1): a depth-3 leaf at `plan.positions` under an epic whose `EPIC.md` carries `slots.a` starts A with the epic's model/effort and B with repo or machine values, asserted in the recorded `herdr agent start` argv; adding the block to the child `ISSUE.md` beats the epic for a second leaf; a depth-2 standalone issue block applies. (criterion 2, next side): each malformed case — unparseable front matter, key other than `slots`, seat other than `a`/`b`, missing field, blank-after-trim value, decoded quote character, harness with no machine template — makes `next <slug>` exit non-zero naming the index path, parse or schema reason, and seat where it applies, with `db.tabs`, `db.starts`, `db.panes` empty and no `issues/worktrees` entry.
- U4 — `src/status.ts`, `tests/status.test.ts` (owns both; shared resource: `tests/helpers.ts`, unchanged; prerequisites: U1)
  - Detail seats block and table `seats <basename>` marker per D6; add `SeatIndexError` to `scanRepo`'s caught set so a malformed index prints `unreadable` with the path and sets exit code 1; detail `status <slug>` exits non-zero naming the index path (criterion 2, status side).
  - Tests (criterion 4): detail prints both effective seats with the file each came from and the next-start label; NOTE carries `seats ISSUE.md` / `seats EPIC.md` when a seat source is an index and nothing extra otherwise. (criterion 5, status side): leaves whose index files lack front matter still scan and print.

No other agent or human doc is affected: skill text and `state.yaml` are excluded by design.

## Verification

| Criterion | Proof | Command | Failure caught | Size | Rerun trigger |
| --- | --- | --- | --- | --- | --- |
| 1 | Epic/issue/standalone start argv | `bun test tests/next.test.ts --timeout=30000` | `launch`/`seats` ignore the index | seconds | `src/next.ts`, `src/config.ts`, `tests/next.test.ts` change |
| 2 | Malformed-index matrix across the three commands | `bun test tests/next.test.ts tests/status.test.ts tests/config.test.ts --timeout=30000` | missing validation, wrong error surface, late failure after allocation | seconds | any owned `src/` or `tests/` file changes |
| 3 | Leaf-worktree slot print | `bun test tests/config.test.ts --timeout=30000` | `effectiveConfig` prints repo seats inside a managed worktree | seconds | `src/config.ts`, `tests/config.test.ts` change |
| 4 | Detail seats block and NOTE marker | `bun test tests/status.test.ts --timeout=30000` | missing or mislabeled seat reporting | seconds | `src/status.ts`, `tests/status.test.ts` change |
| 5 | No-front-matter leaf behaves as before; real repo sweep | `bun test tests/config.test.ts tests/status.test.ts --timeout=30000`; then `akrogon status` and `akrogon status index-seats` in this repo | regression on front-matter-free indexes or existing leaves | seconds | `src/config.ts`, `src/status.ts` change |
| 6 | Docs show block and order | manual read of `docs/guide/cheat.md` and `docs/guide/files.md`; `bun test tests/docs-links.test.ts --timeout=30000` | missing guide section, broken links | seconds | the two docs files change |
| All | Blocking checks | `bun run format`, `bun run typecheck`, `bun test --timeout=30000`, `bun test --changed="$AKROGON_BASE" --timeout=30000` | type drift, format, cross-file regressions | minutes | any diff under `src/` or `tests/` |
