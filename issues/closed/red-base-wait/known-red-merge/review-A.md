# Review A — known-red-merge

Base: `2756bd07d31730f90ee539e1261299e2c481b66a`. Reviewed head: `a96c6d3`.

## Evidence

- `bun run typecheck` clean; `bun run format` clean; `bun test --timeout=30000` → 798 pass / 0 fail (42 files).
- Read the full diff `2756bd0..a96c6d3` (23 files) against plan D1–D12 and design; traced the merge `--check --compare` flow through `phaseCommand → batchCheck → validateComparisons → mergeRecords`, all three green-resolve call sites (`batchPush`, `finishPush` inside `withLock`, `reconcileBatch` inside `withLock`), and the restack decision writes.
- AREA.md path check: every path named in `src/AREA.md`/`tests/AREA.md` exists from the repo root; `issues/config.yaml` is sparse-excluded from leaf worktrees but present and correct in the registered checkout (pre-existing reference, not a dead pointer).
- Doc claims spot-checked against behavior: `compared:` line exists (`src/phase.ts:293`), `batch.comparisons` persisted, restack drops, `held` outcome retained in `attempts.ts` enum and marked historical in `docs/guide/files.md`. No documented behavior is contradicted except as found below.
- `git worktree lock` note: no code concern, environmental only.

## Findings

### F1 (Fix, handed to A) — restack `reuse` gate bypasses the config-change rerun rule when comparisons exist

`src/phase.ts` ~:793:

```ts
((await recordConfigEqual(repo, tested.main, builtOn)) || (record.comparisons ?? []).length > 0) &&
```

With a comparison record stamped, `reuse` no longer requires `issues/config.yaml` to be unchanged between the tested base and the new remote tip. A changed `checks` contract then reuses a stale green run and lands code under a check contract it never ran — the exact outcome `batch-merge.test.ts` `'a change to issues/config.yaml on main forces a rerun'` guards (that case stays green only because it stamps no comparison). Realistic source: operator or another leaf lands a `checks:`/`merge_checks:` config change on main between a merge seat's `--check` and its `merged` call — a routine action. Consequence today: `merged` prints `reuse` and pushes code never exercised under the live config. Criterion hit: design D7 (`reuse` additionally requires no known-red unit — it relaxes nothing else) and criterion 5's restack contract.

Root cause: the planted test expectation. `tests/merge-compare.test.ts:794` (`'a restack holding only a green record keeps reuse and resolves nothing at landing'`) advances the remote by changing `issues/config.yaml` itself, making `recordConfigEqual` false — the worker was forced to weaken the gate to turn the expectation green (its report records this dilemma). The same applies to `:769` (`'a restack holding a known-red record prints rerun'`): it passes either way since a config change forces `rerun` regardless, so the known-red trigger is unproven — a test-quality defect on the same root. Repair, all to A since a test expectation is being corrected: restore the gate to `(await recordConfigEqual(...)) && !(await comparisonsCarryRed(repo, record))`, and change both `advanceRemote` calls to commit a non-config file (e.g. `{ 'main-note': 'x\n' }`) so the known-red/green-only distinction is actually what drives `rerun`/`reuse`. Commit needs a `Test-Change:` trailer citing this finding.

### F2 (Fix, doable by B) — a later `merged --check` without `--compare` keeps stale `batch.comparisons`

`src/phase.ts` `batchCheck` stamps `{ ...stamp, comparisons: ... }` only when `compareFiles.length > 0`; a second `--check` carrying no `--compare` writes `batch` unchanged, retaining the prior accepted list. Design D2: an absent list ⇒ absent field; an earlier value is replaced. Realistic source: merge B reruns `merged --check` after a restack-`rerun` or a first `--check` without records — a normal path. Consequence today: the stale file paths still drive `comparisonsCarryRed` (spurious `rerun` decisions) and `resolveGreenComparisons` at landing (warn-spam or resolutions against a record the operator may have deleted), contradicting the replace semantics the restack drop relies on. Repair: write `comparisons: compareFiles.length > 0 ? mapped : undefined` in the stamped batch, with the usual reproduction test shown red first (the only test B may write) and a `Test-Change:` trailer.

### Nits

- N1 — `recordComparisons` counts `passing` across `leaf.outcome === 'pass'` units of every record state; on a `compared` record the `compared:` line's number is units that passed on the leaf side, not units passing "under the same leaf code on batch base". Readable today, ambiguous on mixed records; nothing asserts the count. Deferred: no contract names the semantics and the line is informational. Evidence to promote: a doc/test fixing the count's meaning.
- N2 — the `green` schema keeps `counterpart_revision` optional where design D4 says green carries none; merge validation refuses `retry` on green but not `counterpart_revision`. Deferred: only reachable through a hand-written record outside B's own schema, and the field is ignored downstream.
- N3 — `batchCheck` validates comparisons before `transition` (design says after); the practical difference is which refusal fires first. Deferred: both orders refuse before stamping, and pre-validation is arguably safer.
- N4 — `hasKnownRed` carries an effectively dead `counterpart` fallback branch (a `known-red` unit without a `base` outcome can't exist in a `compared` record, and `inconsistent`/`green` units lack `verdict`). Deferred: unreachable today, two lines.
- N5 — `inconsistent` records now refuse `run.complete !== true` where previously the leaf path did not check completeness; the stricter refusal matches the design but changes the leaf path's acceptance for an incomplete-retry record edge. Deferred: an `inconsistent` record with an incomplete leaf run is self-contradictory; the new refusal is the right verdict anyway.

## Verdict

fix
