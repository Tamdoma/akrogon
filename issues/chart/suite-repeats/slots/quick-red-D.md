# Fork notes: quick-red (Seat D)

## Q1. When a quick check is red, should `akrogon verify` skip the slow test check, and by which rule?

### Pick
**Skip slow checks by running every quick (non-`full`) check in `checks` and blocking checks named in `full` (plus `merge_checks`) whenever any quick check (or `setup`) is red.**

Concretely:
1. **`verifyCommands` (`src/verify.ts:113-121`) & `issues/config.yaml:8-10`**: Partition `checks` (excluding `merge_covers` at `merge`) so non-`full` checks (`!config.full.includes(name)`) precede `full` checks (`config.full.includes(name)`), followed at `merge` by `merge_checks` (and reorder `issues/config.yaml:8-10` to `format`, `typecheck`, `test` to match).
2. **`runOnce` (`src/verify.ts:543-566`)**: Inside `for (const item of sequential)`, every non-`full` check runs when `setup.code === 0` even if an earlier quick check exited non-zero. When reaching an `item` where `repo.config.full.includes(item.name)`, check `const red = ran.find((entry) => entry.exit !== 0)`: if `red !== undefined`, skip executing `item`, push `{ ...item, exit: red.exit, log: red.log, blocked: red.name }`, and print `verify ${item.name}: blocked by ${red.name} (${red.exit}) ${red.log}\n`. The existing `blocker` loop (`src/verify.ts:568-575`) then blocks `members` (`merge_checks`) as before.

- **Reason**:
  - Fixing a `format` (`prettier --write`) or `typecheck` failure **always mutates a tracked file and changes `tree`**, so running `test` (`~70s`) on a pass where `format` or `typecheck` failed has a **0.0% receipt reuse rate** (`0` of `51` quick-red runs in `akrogon` history ever had their `test` result reused).
  - Running **all** quick checks (`format` `2.1s` + `typecheck` `2.2s` = `~4.3s`) before blocking `full` (`test` `~70s`) shows every fast static failure in one pass (`2` historical runs had both `format` and `typecheck` red) while avoiding the 70s test suite.
  - Recording `{ ...item, exit: red.exit, log: red.log, blocked: red.name }` reuses the existing `blocked` schema field (`src/verify.ts:80`), which `knownRedReceipt` (`src/verify.ts:228, 235`), `newRedUnits` (`src/verify.ts:259, 282`), `slowEligible` (`src/verify.ts:188`), and `flips` (`src/flaky.ts:33`) already handle.
- **Cost**: ~8 lines in `src/verify.ts:113-121, 549-555` and reordering `issues/config.yaml:8-10`. If a commit has *both* a quick check failure and a broken test, the seat sees the quick failure in `4s` and discovers the test failure on the next `verify` after fixing the quick failure (`+4s` on double-fault runs; happened on `11/47` pre-Oct-26 and `2/4` post-Oct-26 quick-red runs, vs saving `~70s` on all `51` quick-red runs).

### Rejected options
- **Stop the sequential stage at the first red after reordering config**:
  - *Reason rejected*:
    1. Hides a `typecheck` (`2.2s`) failure behind a `format` (`2.1s`) failure (`2` runs in `akrogon`), costing an extra agent turn and a second `verify` launch just to save `2.2s`.
    2. Relies on manual YAML key order in `config.yaml` (whereas `tests/run-permit.test.ts:250` defines `checks: { test: 'bun test', format: 'true' }, full: ['test']`).
    3. Breaks existing tests (`tests/verify.test.ts:105-143`, `tests/verify.test.ts:1084-1120`) that configure multiple non-`full` `checks` (`probe`, `red`, `after` with `full: []`) and assert later non-`full` checks still run after a red.
- **Keep running everything**:
  - *Reason rejected*: Re-measurement refutes the 2026-10-24 assumption (`issues/chart/verify-waste/forks/receipts.md` `## Refined at draft review`): `51` head runs in `akrogon` (`47/243` before `2026-10-26`, `4/50` after `2026-10-26`) ran `test` alongside a red `format` or `typecheck` (`~120m` of full-suite wall time), and `0` of those `test` runs were ever reused because fixing `format`/`typecheck` always changes `tree`.

### Evidence
- **Tier 1 (Live repo data & code, 2026-11-01)**:
  - `issues/verify-runs.jsonl`:
    - Before `2026-10-26`: `243` completed head runs (`85` red); `47` (`55.3%` of red runs) had `format` (`45`), `typecheck` (`2`), or both (`2`) red (`36` with `test` green, `11` with `test` red).
    - Since `2026-10-26`: `50` completed head runs (`11` red); `4` (`36.4%` of red runs) had `format` (`3`) or `typecheck` (`1`) red (`2` with `test` green, `2` with `test` red).
    - Reused `test` entries across all `330` runs in `issues/verify-runs.jsonl`: **`0`**.
  - `src/verify.ts:80, 188, 228, 235, 259, 282, 540-575`, `src/flaky.ts:33`, `tests/verify.test.ts:105-143, 1084-1120`.

### Pitfalls & what removes each
- **Pitfall 1**: A repo or test lists `test` (`full: [test]`) before `format` in `config.yaml` (`tests/run-permit.test.ts:250`), so `test` runs before `format` can block it.
  - *What removes it*: Partitioning `checks` in `verifyCommands` (`src/verify.ts:113-121`) so `!config.full.includes(name)` always precedes `config.full.includes(name)`.
- **Pitfall 2**: A blocked `test` entry (`exit: 1, blocked: 'format'`) followed by a green `test` entry is miscounted as a flaky test flip or a known-red observation.
  - *What removes it*: Setting `blocked: red.name` on the skipped `full` entry; `flips` (`src/flaky.ts:33`), `knownRedReceipt` (`src/verify.ts:228, 235`), `newRedUnits` (`src/verify.ts:259, 282`), and `slowEligible` (`src/verify.ts:188`) already skip `item.blocked !== undefined`.

### Questions the fork does not ask
- None on Q1.

---

## Q2. Does per-command reuse (`reuseSource`) stay, or is it deleted?

### Pick
**Delete `reuseSource` (`src/verify.ts:203-209` and its call sites in `runOnce` at `src/verify.ts:549-565, 576-596`), keep `reused: z.string().optional()` on `verifyRunSchema` (`src/verify.ts:79`) so historical ledger rows still parse, and in `verify(..., knownRed = true)` (`src/verify.ts:894-895`) check `greenRun(repo, baseTree, scope)` before launching the base pass so `--known-red` fails fast in `0s` when the merge-base is already whole-run green.**

Concretely on the `--known-red` base side (`src/verify.ts:894-899`):
```ts
const baseSha: string = await command(['git', 'merge-base', sha, trackingRef(repo)], repo.root);
if (greenRun(repo, await treeOf(repo, baseSha), scope) === undefined) {
  const compared: { id: string; code: number } = await passOnce(repo, caller, baseSha, scope, baseSha, headId);
  if (compared.code === 2) return compared.code;
}
const pass: boolean = await knownRedReceipt(repo, sha, scope);
```

- **Reason**:
  - **In `akrogon` (`issues/verify-runs.jsonl`)**: Since `2026-10-26`, across `50` head runs (`150` entries) and `2` base runs (`6` entries), `reuseSource` fired **`8` times total** (`6` on head runs, `2` on `compares`), and **all `8` were `format` (`2.1s`) or `typecheck` (`2.2s`)** — **`0` reuses of `test` (`~70s`)**. Total wall time saved on head runs over 5 days: `~13 seconds` (and `4` of those `6` head entries were on `slow-merge-notice` and `peer-pane-anchor` during redundant merge runs that `merge-reuse` eliminates).
  - **In `framework` (`/home/ivan/Work/infra/tamdoma/framework/issues/verify-runs.jsonl`, `1,741` completed runs)**: `framework` has 1 command per scope (`checks: { cheap }`, `merge_checks: { verify }`, `merge_covers: [cheap]`). Across all `1,741` completed runs, `reuseSource` fired **`0` times on head runs** (whole-run `greenRun` already catches a 1-command green tree!). All **`18` `reused` entries in `framework`** (`15` at `merge` scope, median `269.0s` = `67.3m`; `3` at `leaf` scope, median `18.1s`) occurred on **`compares !== undefined` (`--known-red` base runs)** where `baseSha` (`origin/main`) ALREADY held a whole-run green receipt!
  - Adding the 1-line `if (greenRun(repo, await treeOf(repo, baseSha), scope) === undefined)` guard at `src/verify.ts:894` before `passOnce(repo, caller, baseSha, ...)` preserves **100% of `framework`'s `67.3m` `--known-red` base-run savings** (and is even faster because it skips spawning a systemd pass, creating a base worktree, and running `bun install` setup when `baseTree` is already green!), allowing `reuseSource` to be deleted cleanly.
- **Cost**:
  - **Code removed**: Deletes `reuseSource` (`src/verify.ts:203-209`), both `source === undefined` branches in `runOnce` (`src/verify.ts:549-565, 578-596`), and 4 `reuseSource` test fixtures in `tests/verify.test.ts` (`lines 1084-1168, 1216-1241, 1462-1485`, ~140 lines). Updates `src/AREA.md` (`## Commands`, `## Key files`) and `skills/merge-issue/SKILL.md` (`### Shared endings`).
  - **Runtime cost**: In `akrogon`, retrying a flaky `test` run re-runs `format` (`2.1s`) and `typecheck` (`2.2s`). In `framework`, if `verify-waste` `## Pending steps` (splitting `merge_checks` into 14 separate entries) is ever revived later, per-member retry would not exist without `reuseSource`.

### Rejected options
- **Keep `reuseSource`**:
  - *Reason rejected*: In live configs across both `akrogon` and `framework`, `reuseSource` on head runs saved `0s` in `framework` (`0/1,741` runs) and `~13s` in `akrogon` (`6/150` entries, all 2-second `format`/`typecheck`). Keeping ~30 lines of production logic and ~140 lines of tests for `~13s` over 5 days violates the operator's carry ("Less is always more (less code, even removing)", `issues/chart/suite-repeats/forks/quick-red.md` `### Carries`).
- **Delete `reuseSource` without checking `greenRun(repo, baseTree, scope)` before the `--known-red` base pass (`src/verify.ts:894-895`)**:
  - *Reason rejected*: Would cause `verify --known-red` to re-run `passOnce` on `baseSha` (`269s` in `framework`, `70s` in `akrogon`) whenever a seat runs `--known-red` against an already-green `origin/main` (`18` times in `framework` since `2026-10-25`; also tested by `tests/verify.test.ts:865-868, 1392-1430`).

### Evidence
- **Tier 1 (Live repo data & code, 2026-11-01)**:
  - `issues/verify-runs.jsonl` (`akrogon`): `8` `reused` entries total since `2026-10-25` (`6` on head runs: `cost-rules` leaf `format`+`typecheck` x2, `slow-merge-notice` merge `format`+`typecheck`, `peer-pane-anchor` merge `format`+`typecheck`; `2` on `cost-rules` `compares` base run `format`+`typecheck`); `0` `test` entries ever reused.
  - `/home/ivan/Work/infra/tamdoma/framework/issues/verify-runs.jsonl` (`framework`): `1,741` completed runs; `18` `reused` entries (`15` `merge` at `269.0s` median, `3` `leaf` at `18.1s` median), **`18/18` (`100%`) on `compares !== undefined` (`--known-red` base runs)**, `0` on head runs.
  - `src/verify.ts:79, 203-209, 549-596, 894-899`.

### Pitfalls & what removes each
- **Pitfall 1**: Removing `reused: z.string().optional()` from `verifyRunSchema` (`src/verify.ts:79`) would cause `readVerifyRuns` (`src/verify.ts:104-111`) to throw a `ZodError` on the `8` existing rows in `akrogon`'s `issues/verify-runs.jsonl` and `18` rows in `framework`'s `issues/verify-runs.jsonl` that carry `"reused": "<uuid>"`.
  - *What removes it*: Keep `reused: z.string().optional()` in `verifyRunSchema` (`src/verify.ts:79`) (and keep the `item.reused !== undefined` guards or `tests/verify.test.ts:1243-1269` schema compatibility test) while deleting `reuseSource` and its writers in `runOnce`.
- **Pitfall 2**: Deleting `reuseSource` without guarding `passOnce(repo, caller, baseSha, ...)` in `verify --known-red` (`src/verify.ts:894-895`) would re-run the full suite on `origin/main` when `origin/main` is already whole-run green (and break `tests/verify.test.ts:854-881` where a seeded green receipt on `base` prevents a fresh red base run from sending a second main-red notice).
  - *What removes it*: Checking `if (greenRun(repo, await treeOf(repo, baseSha), scope) === undefined)` before calling `passOnce(repo, caller, baseSha, scope, baseSha, headId)` at `src/verify.ts:894-895`.

### Questions the fork does not ask
- Is `issues/chart/verify-waste/CHART.md` `## Pending steps` (`framework members`: splitting `framework` `merge_checks` into 14 entries) now dropped or deferred? If it is dropped, `reuseSource` has zero future callers; if it is still imminently planned for `framework`, that is the only reason `reuseSource` was ever introduced.

---

## Q3. What proof shows it works, without going overboard?

### Pick
**Replace `tests/verify.test.ts:1084-1120` in-place to prove Q1, delete the 3 other `reuseSource` tests (`tests/verify.test.ts:1122-1168, 1216-1241, 1462-1485`), and adjust `tests/verify.test.ts:1325-1430` for whole-run base green short-circuiting.**

Concretely:
1. **In `tests/verify.test.ts:1084-1120` (in-place update)**:
   - Configure `checks: { format: 'echo bad; exit 7', test: \`touch \${dir}/test.ran\`, typecheck: \`echo x >> \${dir}/typecheck.count\` }`, `full: ['test']`, `merge_checks: { member: \`touch \${dir}/member.ran\` }`.
   - Run `verify(f, ['--holder', holder], direct)` and assert:
     - `run.commands.map((item) => [item.name, item.exit, item.blocked])` equals `[['format', 7, undefined], ['typecheck', 0, undefined], ['test', 7, 'format'], ['member', 7, 'format']]` (proving `verifyCommands` ordered `typecheck` before `test`, `typecheck` still ran after `format` failed, and both `test` (`full`) and `member` (`merge_checks`) were blocked by `format`).
     - `existsSync(\`\${dir}/test.ran\`)` is `false` and `existsSync(\`\${dir}/member.ran\`)` is `false`.
2. **Delete `tests/verify.test.ts:1122-1168`, `1216-1241`, and `1462-1485`** (3 tests that tested `reuseSource`; keep `1170-1214` for incomplete runs not satisfying `greenRun` and `1243-1269` for `verifyRunSchema` backward compatibility with historical `reused` entries).
3. **In `tests/verify.test.ts:1325-1430`**:
   - In `1325-1390`, drop the `reused: seededBase.run` assertion on `baseRun` (`lines 1363-1371, 1378-1381`).
   - In `1392-1430` (`known-red refuses when the only base result for a red head command is green`), assert `result.code === 1`, `records(f).find((run) => run.compares !== undefined)` is `undefined` (base pass skipped because `baseTree` is already whole-run green), and `requireGreenReceipt` rejects.
4. **Run**: `bun test tests/verify.test.ts tests/receipt-gates.test.ts` and normal leaf `akrogon verify`.

- **Reason & Cost**: Net **deletes** 3 `fixture()` setups and ~110 lines from `tests/verify.test.ts` while proving quick-check ordering, all-quick-checks-run on red, `full` + `merge_checks` blocking, and base-green `--known-red` refusal.

### Rejected options
- **Add new test files or multi-pass CLI tests for every permutation of `format`/`typecheck`/`test`**:
  - *Reason rejected*: One test with `format` (red), `typecheck` (green), `test` (`full`, blocked), and `member` (`merge_checks`, blocked) proves all 4 properties in a single pass.

### Evidence
- **Tier 1 (Code, 2026-11-01)**: `tests/verify.test.ts:1084-1269, 1325-1485`.

### Pitfalls & what removes each
- **Pitfall**: Breaking `tests/verify.test.ts:854-881` (`a green on the same revision clears only the earlier main-red incident`), which seeds `greenReceipt(f, base, 'leaf')` at `line 865` and relies on `verify --known-red` not recording a fresh red base run on that green `base` tree.
  - *What removes it*: The `if (greenRun(repo, await treeOf(repo, baseSha), scope) === undefined)` guard at `src/verify.ts:894` skips `passOnce` on `baseSha` when `base` holds a green receipt, keeping `tests/verify.test.ts:854-881` passing.

### Questions the fork does not ask
- None on Q3.
