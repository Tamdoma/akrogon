# Sub-brief 1: verify.ts — full-check ordering, blocking, reuse deletion, known-red base skip

## 1. Goal

Implement leaf quick-red-skip code unit (plan D1–D5, D7): `full` checks run last in the sequential stage, execute only when setup and every non-`full` check is green, and record `blocked` otherwise; per-command reuse deleted; `verify --known-red` skips the base pass when the merge-base tree holds a whole-green row.

## 2. Acceptance criteria

Already-committed tests in `tests/verify.test.ts` and `tests/slow-merge.test.ts` prove the outcome (do not edit them):

- `a red check outside full blocks every full check, and the fixed tree runs it green past the gate` — order `[quick1, bad, quick2, suite]`, suite `{blocked:'bad'}` shares bad's log, then green after fix on a new tree.
- `a failed setup blocks full checks while other checks record the setup result unblocked` — quick `{exit:9}` unblocked, suite `{exit:9, blocked:'setup'}`.
- `a red full check never blocks a later full check, while the merge members stay blocked` — `[quick 0, suite1 4, suite2 0, member 4]`, member `{blocked:'suite1'}`.
- `a same-tree retry re-executes every unblocked command and writes no reused entry`; `a same-tree retry re-executes every merge member and writes no reused entry`; `changing one command text reruns every command in the next pass` — no `reused` fields anywhere new.
- `verify --known-red runs no base pass when the base tree holds a whole-green row and refuses the red head`; `verify --known-red runs no base pass on a whole-green base and fails like the gate` — no `compares` row, CLI fail, gate refuses.
- `known-red passes when the red head member is covered by a fresh base run that fails the same names` — base pass still runs when base is not whole-green; unit executes fresh.
- Slow-merge: `an open episode pins the normal, cites its first run, notifies once and recovers` and `an unflagged run whose full check was blocked still closes the episode accepted`.

## 3. Read-first list

- `src/verify.ts` — all changes land here. Read `verifyCommands`, `runOnce` (sequential loop around lines ~560-620, member stage ~620-660), `greenRun`, `sameCommands`, `verify` (`--known-red` tail).
- `src/config.ts` lines 39-110 — `RepoConfig.full` (names of `checks`/`merge_checks`) and `setupCommand`.
- `tests/verify.test.ts` — the tests above for exact expected receipts.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

One file: `src/verify.ts`. Waves: none — this is the only code unit; the docs unit is a sibling worker on disjoint files.

a. `verifyCommands(config, scope)` returns non-`full` `checks` (config order), then `full` `checks` (config order), then `merge_checks` entries at `merge` scope. The `merge_covers` filter applies first, unchanged. A `full` name in `merge_checks` stays a member — only `checks` entries move.

b. `runOnce` sequential loop: non-`full` items keep today's shape — on setup red they record `{exit: setup.code, log: setup.log}` with no `blocked`; on setup green they always `checkedRun`. `full` items never execute when setup is red (record `{exit: setup.code, log: setup.log, blocked: 'setup'}`) or when an earlier non-`full` entry is red (record `{exit: blocker.exit, log: blocker.log, blocked: blocker.name}`). A red `full` entry never blocks a later `full` entry — track the blocker from non-`full` reds only. `full` membership comes from `repo.config.full` read in `runOnce`.

c. Delete `reuseSource` and both of its call sites (the `source` lookup in the sequential loop and the member `Promise.allSettled` lookup); every item `checkedRun`s. The `ledger`/`readVerifyRuns` snapshot inside `runOnce` goes with them if unused. Keep the whole-receipt `greenRun` fast path in `verify` (`reuse receipt <run> tree=<tree>`).

d. In `verify`'s `--known-red` tail: after `const baseSha = ...` and `const baseTree = await treeOf(repo, baseSha)`, when `greenRun(repo, baseTree, scope) !== undefined`, skip `passOnce` for the base entirely and go straight to `knownRedReceipt`. `knownRedReceipt` is unchanged — a whole-green base judges `fail`, which is today's outcome.

e. Member blocker is unchanged: `ran.find((item) => item.exit !== 0)` still yields the right blocker because blocked entries always sit after the red that produced them.

## 5. Do-not, reasons and exceptions

- Do not edit any test file — planned tests are locked; a red planned test with correct product code is a mismatch returned to A, not a worker fix.
- Do not touch the schema (`verifyRunSchema`), `PassRecord`, `greenRun`, `knownRedReceipt`, `requireGreenReceipt`, `slowEligible`, or `src/flaky.ts` — the design keeps the `reused` field and all consumer guards; old rows must still parse.
- Do not reorder `merge_checks` or touch `member_count`; members keep the existing stage rule (red `full` does block members, by design).
- Do not change `akrogon config` output (D6: it prints `withSetup`, no verify order).
- Do not keep `reuseSource` "for members/base only" — design Q2 rejected partial reuse.
- Return a mismatch with evidence to A instead of widening scope or an interface; the exception is a revised brief from A authorizing it.

Restated: locked tests, schema, guards and config output stay; `reuseSource` and the base pass on a whole-green base go; mismatch beats improvisation.

## 6. Ordered steps

1. `bun install --frozen-lockfile --backend=copyfile` in the worktree (once).
2. Read `src/verify.ts` fully, then apply changes a–e (criteria: all).
3. Run the targeted commands in section 7; repair only `src/verify.ts`.
4. Commit `src/verify.ts` alone with a conventional message; the trailer rule in section 8 does not apply (no test file changed).

Advisory size: 1 file, under ~30 turns.

## 7. Commands

From the worktree root:

```sh
bun test tests/verify.test.ts --test-name-pattern 'red check outside full|failed setup blocks|red full check never|same-tree retry|command text|no base pass|fresh base run'
bun test tests/slow-merge.test.ts --test-name-pattern 'open episode pins|full check was blocked'
bun run typecheck
```

All must pass before the commit. If `bun test` needs deps, run step 1 first. Do not run `akrogon verify` or the configured `checks` commands — A runs those.

## 8. Done-when, evidence and report

Every section-7 command exits 0; `src/verify.ts` committed on branch `quick-red-skip` at the worktree HEAD; report names the commit.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
