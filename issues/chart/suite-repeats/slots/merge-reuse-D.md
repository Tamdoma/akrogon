# Fork notes: merge-reuse (Seat D)

## Q1. Should merge accept a completed green leaf receipt on the same tree and command set, or keep rerunning?

### Pick
**Accept the existing green receipt (no second full-suite run when `tree` and `verifyCommands(repo.config, scope)` match).**

- **Reason**:
  - `runOnce` (`src/verify.ts:527-536`) checks out `${sha}^{tree}` in a fresh detached worktree, writes `.env` from `repo.config.env`, and runs `setup` + `verifyCommands(repo.config, scope)` (`src/verify.ts:113-121`).
  - When `tree` is identical and `verifyCommands(repo.config, 'merge')` is already satisfied by a completed green run on that `tree`, re-running at `merge` executes the exact same commands against the exact same file tree in an identical fresh checkout.
  - In repos with distinct merge checks (`/home/ivan/Work/infra/tamdoma/framework/issues/config.yaml`: `checks: { cheap }`, `merge_checks: { verify }`, `merge_covers: [cheap]`), `verifyCommands(config, 'leaf')` (`[cheap]`) and `verifyCommands(config, 'merge')` (`[verify]`) differ, so a `leaf` receipt never satisfies `merge` — every `merge_checks` entry still runs and blocks every merge.
  - In `akrogon` (`issues/config.yaml`: `merge_checks` and `merge_covers` absent), `verifyCommands(config, 'leaf')` and `verifyCommands(config, 'merge')` are identical (`[format, test, typecheck]`). A second run on the identical `tree` cannot catch a code or rebase regression (any rebase that changes a file produces a new `tree` and runs fresh); it only burns ~70s of full-suite wall time and doubles flake exposure during `akrogon land` (`src/land.ts:84-88`).
- **Cost**:
  - **Code**: Net deletion of `run.scope === scope` guards in `src/verify.ts`.
  - **Runtime**: Saves ~`70.5s` median wall time on `76%–93%` of merges (`13/17` total merge head runs and `13/14` leaf merge head runs since `2026-10-26`; `33/50` merged leaves during the 11 days `c00246dd` was active). Only foregoes a second random flake/slow-alarm sample on no-op fast-forward merges.

### Rejected option
- **Keep rerunning at `merge` (`run.scope === scope`)**: Rejected because it re-runs identical commands on an identical Git `tree` (`990.2s` = `16.5m` across 14 leaf merge runs since `2026-10-26`), and in both of the last 2 leaves (`slow-merge-notice` and `peer-pane-anchor`) the redundant merge verify hit a suite flake (`test: 1`), aborting `akrogon land` (`src/land.ts:84-88`), waking Seat B (`wake=red`), and forcing a third full `verify` on the same tree. The earlier `issues/chart/suite-time/CHART.md` (`## Off route`) "1.9% of merge verify time" figure was computed over a window where `c00246dd` had already skipped `33/50` merge runs.

### Evidence
- **Tier 1 (Live repo data & code, 2026-11-01)**:
  - `issues/verify-runs.jsonl` & `issues/timings.jsonl`:
    - Between `c00246dd` (`2026-10-14T15:18:32Z`) and `9aaed138` (`2026-10-24T22:38:06Z`), `50` leaves reached `merged` and **`33` (`66.0%`)** reused their `leaf` receipt at `merge` without a second run.
    - Since `2026-10-26T00:00:00Z` (post-`9aaed138`), `13` of `14` leaf `merge` head runs (`92.9%`, `13/17` incl. `checkout`, median `70.5s`, sum `990.2s`) ran on a `tree` that already held a completed green `leaf` receipt with identical commands.
    - Both red `merge` runs since `2026-10-26` (`slow-merge-notice` run `b56b98db` after green leaf run `f34666a3` on tree `6dae6d38`; `peer-pane-anchor` run `69f0bdaf` after green leaf run `af62ff4f` on tree `0fabfad7`) were flakes on a tree already proven green at `leaf`.
  - `/home/ivan/Work/infra/tamdoma/framework/issues/config.yaml` (`checks`, `merge_checks`, `merge_covers`) vs `issues/config.yaml` and `src/verify.ts:113-121` (`verifyCommands`).

### Pitfalls & what removes each
- **Pitfall 1**: A repo configures a merge-only check in `merge_checks` and a `leaf` receipt accidentally passes `merge`.
  - *What removes it*: `verifyCommands(repo.config, scope)` (`src/verify.ts:113-121`) includes `merge_checks` only when `scope === 'merge'`, and `sameCommands(run.commands, expected)` (`src/verify.ts:127-132`) requires exact `{ name, command }` equality on every expected command.
- **Pitfall 2**: `main` advances while the leaf is in `check.review` / `check.repair`, so the rebased merge commit has new upstream files.
  - *What removes it*: `applyTop` / `buildStack` (`src/batch.ts`) or Seat B's rebase produces a new Git `tree` SHA (`treeOf` in `src/verify.ts:123-125`), so `run.tree === tree` is `false` and `merge` verify runs fresh.

### Questions the fork does not ask
- During `merge` when Seat B runs (`skills/merge-issue/SKILL.md` `## merge`), Seat B is instructed to commit `lessons: retire applied lines` touching `learnings/LESSONS.md` *before* `akrogon verify`. That doc-only edit mutates `tree` and invalidates the `leaf` receipt even when `main` did not advance. Should lesson retirement happen only when a rebase was already required (or be exempted from invalidating `tree`)?

---

## Q2. What single rule makes `akrogon verify`'s reuse lookup and `requireGreenReceipt` agree so the 2026-10-25 failure cannot recur?

### Pick
**Make `requireGreenReceipt` call `greenRun(repo, tree, scope)` directly (deleting `requireGreenReceipt`'s separate `onTree` filter), and drop `run.scope === scope` across the receipt lookups in `src/verify.ts` (`greenRun`, `redRun`, `knownRedReceipt`, `reuseSource`, and `matching`).**

Concretely in `src/verify.ts`:
1. **`greenRun` (`src/verify.ts:157-167`)**: Drop `run.scope === scope`:
   ```ts
   function greenRun(repo: Repo, tree: string, scope: VerifyScope): VerifyRun | undefined {
     const expected: NamedCommand[] = verifyCommands(repo.config, scope);
     return readVerifyRuns(repo).find(
       (run) =>
         run.tree === tree &&
         completed(run) &&
         sameCommands(run.commands, expected) &&
         run.commands.every((item) => item.exit === 0),
     );
   }
   ```
2. **`requireGreenReceipt` (`src/verify.ts:459-470`)**: Delete `runs`, `onTree`, and `green` (`src/verify.ts:461-465`) and call `greenRun(repo, tree, scope)`:
   ```ts
   export async function requireGreenReceipt(repo: Repo, sha: string, scope: VerifyScope): Promise<void> {
     const tree: string = await treeOf(repo, sha);
     if (greenRun(repo, tree, scope) === undefined && !(await knownRedReceipt(repo, sha, scope)))
       throw new Error(
         `No green ${scope} verify receipt for ${sha} under the current config; run akrogon verify on this commit`,
       );
   }
   ```
3. **`redRun` (`src/verify.ts:149`), `knownRedReceipt` (`src/verify.ts:218, 232`), `reuseSource` (`src/verify.ts:206`, if kept by `quick-red`), and `matching` (`src/verify.ts:254-262`)**: Drop `run.scope === scope` / `run.scope === unit.scope`.

- **Reason**:
  - **Why 2026-10-25 (`5d0b505f` / `9aaed138`) happened**: In `c00246dd` (2026-10-14), `requireGreenReceipt` literally called `greenRun(repo, await treeOf(repo, sha), scope)`, so `verify` and `requireGreenReceipt` could not disagree. On 2026-10-25, `fbac86c6` (`member-receipts`) replaced that call in `requireGreenReceipt` (`src/verify.ts:461-465`) with a second inline predicate (`onTree`) that checked `run.scope === scope`, while leaving `greenRun` (`src/verify.ts:157-167`) without `run.scope === scope`. Simultaneously, on the `--known-red` path (`5d0b505f` second half, `tests/verify.test.ts:1503-1509`), `verify` line 887 called `redRun` (which had no `run.scope === scope`) while `knownRedReceipt` (`src/verify.ts:218, 232`) had `run.scope === scope`.
  - **Why `requireGreenReceipt`'s multi-run `onTree` stitching (`src/verify.ts:461-465`) is redundant even if per-command `reuseSource` stays**: Whenever `runOnce` (`src/verify.ts:563, 591`) reuses a green command from an earlier run, it writes `{ ...item, exit: 0, log, reused: source.run }` into the new `VerifyRun`'s `commands` array. Thus, every run that exits `0` produces a single completed `VerifyRun` row where `sameCommands(run.commands, expected) && run.commands.every((item) => item.exit === 0)` is true. Calling `greenRun(repo, tree, scope)` in both `verify` (`src/verify.ts:880`) and `requireGreenReceipt` (`src/verify.ts:460`) means there is **one function** in the codebase deciding green receipt validity.
- **Cost**: Removes ~8 lines of code in `src/verify.ts` (`onTree`/`green` in `requireGreenReceipt` + `run.scope === scope` checks). Zero new abstractions.

### Rejected options
- **Keep two separate predicates (`greenRun` in `verify` and `onTree` in `requireGreenReceipt`) and merely drop `run.scope === scope` from both**:
  - *Reason rejected*: Leaves two different definitions of "green receipt" in `src/verify.ts`: `onTree` in `requireGreenReceipt` passes when two separate red runs on the same tree had disjoint green commands (`[c1:0, m1:7]` + `[c1:7, m1:0]`), whereas `greenRun` in `verify` requires one run with all commands green. Having two predicates is the exact structural flaw that caused the 2026-10-25 regression.
- **Drop `run.scope === scope` in `greenRun`/`requireGreenReceipt` but keep `run.scope === scope` in `redRun`/`knownRedReceipt`/`matching`**:
  - *Reason rejected*: Creates an inconsistency where green receipts are keyed by `(tree, command set)` while `--known-red` receipts on the exact same `(tree, command set)` are rejected at `merge`, and breaks main-red resolution in `newRedUnits` (`src/verify.ts:257, 297-307`) when a fix lands on `main` using a reused `leaf` receipt (see Pitfall 1 below).

### Evidence
- **Tier 1 (Git history & code, 2026-11-01)**:
  - `git show c00246dd` (`src/verify.ts`): `requireGreenReceipt` was 1 line calling `greenRun(repo, await treeOf(repo, sha), scope)`.
  - `git show fbac86c6` (`src/verify.ts:459-470`): Replaced the `greenRun(...)` call in `requireGreenReceipt` with `onTree` filtering `run.scope === scope`, while leaving `greenRun` and `redRun` without `run.scope === scope`.
  - `git show 5d0b505f` & `git show 9aaed138`: Demonstrated the resulting mismatch on both green (`greenRun` vs `requireGreenReceipt`) and known-red (`redRun` vs `knownRedReceipt`).

### Pitfalls & what removes each
- **Pitfall 1 (Lifetime interaction with `newRedUnits` main-red notifications, `src/verify.ts:254-315`)**:
  - *How it happens*: Once `merge` reuses `leaf` receipts, a leaf that fixes a `main red` test will land on `origin/main` holding only a `scope: 'leaf'` green receipt in `issues/verify-runs.jsonl` (no `scope: 'merge'` receipt is written). In `newRedUnits` (`src/verify.ts:297-307`), resolution of an earlier `scope: 'merge'` red base observation checks `matching(green, unit)` (`src/verify.ts:256-262`) on runs whose `green.sha` is on `main`. Because `matching` currently requires `run.scope === unit.scope` (`src/verify.ts:257`), a `scope: 'leaf'` green receipt on landed `main` would fail to resolve a `scope: 'merge'` main-red incident!
  - *What removes it*: Remove `run.scope === unit.scope` from `matching` (`src/verify.ts:257`, and `scope` from `Unit` at `src/verify.ts:254`). `matching` already matches `item.name === unit.name && item.command === unit.command && item.blocked === undefined`, and `onMain(green.sha)` (`src/verify.ts:303`) already proves `green.sha` landed on `main`.
- **Pitfall 2 (Lifetime interaction with `merge-slow-alarm`, `src/verify.ts:178-190, 383-457`)**:
  - *How it happens*: If reused merge runs wrote a 0-second `VerifyRun` row, they would corrupt `decideSlow`'s 20-run median `normal_ms`.
  - *What removes it*: `verify` (`src/verify.ts:880-884`) returns `0` on `greenRun` *before* `passOnce`/`runOnce`, writing no row to `issues/verify-runs.jsonl`; and `slowEligible` (`src/verify.ts:184-190`) keeps `run.scope === 'merge'` and excludes any `reused`/`blocked` entries.

### Questions the fork does not ask
- If a leaf passed `check.review` via `akrogon verify --known-red` (`greenRun` is `undefined`, `knownRedReceipt` is `true`), `akrogon land` (`src/land.ts:84`) still calls `verify(repo.root, undefined, attempt, undefined, false)` (`knownRed = false`), which runs a fresh merge pass that fails on the known-red test and wakes Seat B to run `verify --attempt ... --known-red`. Should `verify` (or `land`) stay strict on `knownRed = false`, or should `knownRedReceipt` only be invoked when `--known-red` is explicitly passed? (Keeping `knownRed = false` in `land` is safer so known-red merges still get explicit `--known-red` or base check if `main` moved, while `requireGreenReceipt` accepts `knownRedReceipt` once established.)

---

## Q3. What proof shows it works, without going overboard?

### Pick
**Update `tests/verify.test.ts:1487-1513` (`5d0b505f`) in-place and delete `tests/verify.test.ts:1271-1308` — zero new test files or fixtures.**

Specifically:
1. **Rewrite `tests/verify.test.ts:1487-1513` in-place**:
   - Under `checks: { unit: 'echo unit' }` (empty `merge_checks`):
     - Run `cli(f, ['verify'], worktree, env)` (`leaf` scope, exits `0`).
     - Run `cli(f, ['verify', '--holder', holder], direct, env)` (`merge` scope on the same `head`): assert it exits `0`, stdout contains `reuse receipt`, `records(f).map((run) => run.scope)` is **`['leaf']`** (not `['leaf', 'merge']`), and `await requireGreenReceipt(readRepo('repo', f.root), head, 'merge')` **passes**.
     - Add 3 lines in the same test: configure `merge_checks: { gate: 'echo gate' }`, assert `requireGreenReceipt(readRepo('repo', f.root), head, 'merge')` **rejects** (`No green merge verify receipt`), and assert `cli(f, ['verify', '--holder', holder], direct, env)` runs and appends a `merge` receipt.
     - Keep the second half of that test (`lines 1503-1509`) with `unit: 'echo "(fail) alpha"; exit 1'` and ` merge_checks: {}`: `verify` at `leaf` fails (`['leaf', 'merge', 'leaf']`), `verify --holder holder --known-red` reuses the red `leaf` head run and runs only the base comparison (`['leaf', 'merge', 'leaf', 'merge']` with `runs[3].compares === runs[2].run`), and `await requireGreenReceipt(readRepo('repo', f.root), head, 'merge')` **passes**.
2. **Delete `tests/verify.test.ts:1271-1308`** (`requireGreenReceipt passes when commands turned green across different runs...`), which tested the deleted `onTree` stitching across two red runs.
3. **Run**: `bun test tests/verify.test.ts tests/receipt-gates.test.ts` (and `akrogon verify` once at phase gate).

- **Reason & Cost**: Directly tests the exact 2026-10-25 failure mode (green reuse, distinct `merge_checks` non-reuse, and `--known-red` reuse + `requireGreenReceipt`), adds **0** new `fixture()` setups, and reduces total lines in `tests/verify.test.ts`.

### Rejected options
- **Add new end-to-end `land` / `phase` subprocess test fixtures for cross-scope reuse**:
  - *Reason rejected*: Violates the operator's carry ("Don't go overboard with testing, do something reasonable", `issues/chart/suite-repeats/forks/merge-reuse.md` `### Carries`). `landGates` and `batchPush` (`src/phase.ts:678, 749`) call `requireGreenReceipt(repo, head, 'merge')` directly, which `tests/verify.test.ts:1487-1513` and `tests/receipt-gates.test.ts` already exercise.

### Evidence
- **Tier 1 (Code, 2026-11-01)**: `tests/verify.test.ts:1271-1308`, `tests/verify.test.ts:1487-1513`, `tests/receipt-gates.test.ts:61-184`.

### Pitfalls & what removes each
- **Pitfall**: Leaving `tests/verify.test.ts:1271-1308` in place if `requireGreenReceipt` is simplified to call `greenRun`, causing a test failure on synthetic two-red-run seeding.
  - *What removes it*: Deleting `tests/verify.test.ts:1271-1308` in the same commit that simplifies `requireGreenReceipt` (`src/verify.ts:459-470`) to call `greenRun`.

### Questions the fork does not ask
- None on Q3.
