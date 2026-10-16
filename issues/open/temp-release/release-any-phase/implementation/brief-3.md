# Sub-brief 3: repair red checks caused by the inventory-unavailable temp keep

Worktree: /home/ivan/.akrogon/worktrees/akrogon/release-any-phase-u3
Leaf branch HEAD: a354638. The leaf's product change is landed; the full suite is green except 10 pre-existing tests that now fail because of it. Your job is to repair those tests — this is a repair brief, not new coverage.

## 1. Goal

The leaf added the rule: when `loadedLeafSlices()` fails (real `systemctl` unreachable in a test env), a leaf's temp is kept with reason `unit list unavailable` instead of being dropped (src/reconcile.ts leaf-temp branch, `loadedSlices === null`). Every test that expects temp deletion must therefore run its subprocesses with a **readable** unit inventory. Repair each failing test so its assertion runs against the intended scenario again — never by weakening an assertion's target.

## 2. Acceptance criteria

- A1: `bun test` on the four touched files passes.
- A2: The 10 named failures are green with unchanged assertions unless the brief says otherwise.
- A3: `bun run typecheck` and `bunx prettier --check tests` clean on changed files.
- A4: Each commit carries `Test-Change:` trailers for every changed test-matched file (all files you touch are test-matched: `tests/*.test.ts`, `tests/helpers.ts`).

## 3. Read-first list

- `tests/helpers.ts` — `cli`, `fixture`, `fakeHerdr`, `leafTempRoot`.
- `tests/fake-systemctl.ts` — the seam: `FAKE_SYSTEMCTL_DB` holds `{units: [{unit, sub, cgroup?}]}`, `FAKE_SYSTEMCTL_LOG` records calls; a `bin/systemctl` symlink to it makes `systemctl --user` calls in subprocesses resolve to the fake.
- `tests/store-sweep-safety.test.ts` lines 169-181 — the pattern already used: `symlinkSync(fake-systemctl.ts → f.home/bin/systemctl)`, write `systemctl.json`, pass `FAKE_SYSTEMCTL_DB`/`FAKE_SYSTEMCTL_LOG`/`AKROGON_CGROUP_ROOT` in the env to `cli`/`reconcileFixture`.
- `src/reconcile.ts` leaf-temp branch — the new keep is inside `kept.length === keptBefore`, only when `loadedSlices === null`.
- `tests/isolation.ts` — why `systemctl` fails without the fake: `XDG_RUNTIME_DIR` points at an empty dir, so `spawnCaptured(['systemctl'...])` errors and `loadedUnits` returns null.

## 4. Change list

Failing tests and their fixes:

**A. Unreadable inventory** (9 tests): the subprocess's `systemctl` fails → `loadedSlices === null` → temp kept. Fix by giving each a readable inventory: symlink `tests/fake-systemctl.ts` into `f.home/bin` (the dir `fakeHerdr`/`fakeAkrogon` already put on PATH), write `resolve(f.home, 'systemctl.json')` with `{"units":[]}` (or the units the test already needs), and pass `FAKE_SYSTEMCTL_DB` + `FAKE_SYSTEMCTL_LOG` in the env argument of every `cli`/`next`/`reconcileFixture` call in that test that must see the inventory. If adding the same three-line setup more than once, add a tiny `fakeSystemctl(f)` helper to `tests/helpers.ts` (alongside `fakeHerdr`) returning `{ db, log, env }` and use it — DRY over repeating the seam.

- `tests/next.test.ts`: `closed tab scratch deletes merged folder and prunes inner worktree` (~4039), `closed tab scratch sweeps a failed leaf, keeps its branch` (~4075), `sweep scratch catch-up deletes open and closed folders with no live panes` (~4111), `sweep scratch catch-up keeps sentinel with live panes then deletes on later sweep` (~4163). These tests call `cli(f, [...], f.root, f.env)` — merge the fake systemctl env into `f.env` after `fakeHerdr` (e.g. `f.env = { ...f.env, ...sys.env }` is fine where `f.env` is mutated, or pass the merged env per call).
- `tests/pause-next.test.ts`: `unpause runs deferred merged cleanup` (~325).
- `tests/reconcile.test.ts`: `an unfinished leaf temp is removed once its tab is gone and kept silently while its tab lives` (~286), `a failed leaf temp stays while its tab lives` (~304), `a running leaf keeps its temp, its slug entries and unowned entries` (~960).
- `tests/store-sweep-safety.test.ts`: `F2 surviving processes protect leaf entries and leaf temps` (~40).

**B. `F4 repo activity follows live tabs and occupied slices instead of phase`** (~146): its `busy-slice` scenario gave the unfinished leaf `tab: 'w1:t1'` (dead) and expected the busy slice to count as repo activity. Under the leaf's rule that slice is now correctly stopped, so the scenario's premise is gone. The scenario's intent — an occupied slice marks the repo active — is preserved by making the leaf an unfinished leaf *without* a recorded tab (kept as `unfinished leaf`, busy cgroup still probed for nothing else matters). Change `leaf(f, 'seat', scenario === 'finished-tab' ? 'merged' : 'implement', { tab: 'w1:t1' })` so the `busy-slice` case seeds no `tab` field, and document the one-line reason in the test comment if the file has such comments. Keep the `queued` and `finished-tab` scenarios byte-identical otherwise.

Owned paths: `tests/helpers.ts` (only if you add the helper), `tests/next.test.ts`, `tests/pause-next.test.ts`, `tests/reconcile.test.ts`, `tests/store-sweep-safety.test.ts`. Nothing else.

## 5. Do-not, reasons and exceptions

- Do not touch `src/` — the product change is correct and verified; the red tests are stale fixtures. Exception: none; a real product defect is a mismatch back to A with the failing output.
- Do not weaken assertions: `existsSync(...) === false` expectations stay false; the fix is a readable inventory, not a flipped expectation. Exception: the single F4 `busy-slice` premise change described above.
- Do not pass `FAKE_SYSTEMCTL_DB` into tests that don't need it; leave passing tests untouched.
- `Test-Change:` trailer per changed test file on every commit (A4); one trailer line per file, e.g. `Test-Change: tests/reconcile.test.ts readable fake-systemctl inventory added so temp-deletion tests still exercise the drop path after the unit-list-unavailable keep landed; no expectation changed`.

Reasons restated: only fixture repairs are in scope, trailer rule is enforced at phase moves, and broad edits create review debt.

## 6. Ordered steps

1. `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile'` in the worktree.
2. Optionally add `fakeSystemctl` to `tests/helpers.ts`; then repair each test in the order listed.
3. Run each repaired test alone first (`bun test <file> -t '<substring>'` — `--timeout=30000` via the config already applies through the printed checks only, so pass it explicitly), then the four files together.
4. Commit (one commit is fine) with the `Test-Change:` trailers.

Advisory size: 4-5 files, under 40 turns.

## 7. Commands

From the worktree:

- `akrogon run-check --name u3-tests -- bun test tests/next.test.ts tests/pause-next.test.ts tests/reconcile.test.ts tests/store-sweep-safety.test.ts --timeout=30000`
- `bun run typecheck`
- `bunx prettier --check tests`

Never `akrogon verify` or the whole suite.

## 8. Done-when, evidence and report

Done when the four files pass, with the run-check citation line, changed files and reasons listed, and any remaining red named under Unverified criteria.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
