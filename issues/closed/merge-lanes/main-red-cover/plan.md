# Plan: main-red-cover

Serial-solo run: one wave, one unit. A implements the plan itself, no workers.

## Read first

- `brief.md`, `design.md` in this leaf folder.
- `src/verify.ts` — `requireGreenReceipt`, `knownRedReceipt` (linked-base judgment), `newRedUnits` (main-red unit reader), `verify` (`--known-red` path), ledger schema `verifyRunSchema`.
- `src/flaky.ts` — `failedTests` log-name reader and `names()` nameless forms (`(unnamed) <script>`, `(script) <script>`, `(no test name)`, `(log gone)`).
- `src/land.ts` — `land` red-verify hand-off, `redRun`, `handOff`.
- `src/phase.ts` — `landGates` → `recordTested` → `requireGreenReceipt`; `landPush` → `batchPush` → `requireGreenReceipt`; `landClaim`.
- `src/batch.ts` — `isAncestor`; `src/preflight.ts` — `trackingRef`; `src/attempts.ts` — `appendAttempt` writes `merge-attempts.jsonl`.
- `tests/helpers.ts` — `fixture`, `seedRun`, `greenReceipt`, `callerWorktree` patterns; `tests/verify.test.ts` line ~686 linked-pair seeding; `tests/green-merge.test.ts` `greenFixture`/`land`/`claimed`; `tests/receipt-gates.test.ts` `merged --check` + `direct-guards` harness; `tests/merge-attempts.test.ts` `spawn` helper for in-process entry points.
- `docs/reference/checks.md` § receipts / § Known red, `docs/reference/files.md` `verify-runs.jsonl` row, `docs/reference/commands.md` `akrogon land` row.
- `issues/chart/merge-lanes/forks/red-exit.md` Taken 7 (the locked cover), `forks/red-base-policy.md` (operator's base-red bar), `forks/red-exit.md` Findings (the 10 h incident).
- `learnings/LESSONS.md` — read; relevant: run-check TMPDIR notes (our tests rename nothing under tmpdir; `run-check` strips DBUS so verify-in-land gets `notice: error` harmlessly), `bun -e` argv shift (we spawn a script file, not `-e`).
- `skills/chart-issues/assets/direct-route.md` step 3 — the door's explicit linked-base two-log judgment via `verify --holder --known-red`.

## Decisions

- **D1 — Cover lives in `requireGreenReceipt`, merge scope only; `knownRedReceipt` is untouched.** The design's "(knownRedReceipt)" parenthetical asked the planner to choose; the same design locks the direct route's linked-base two-log judgment. Putting the ledger cover inside `knownRedReceipt` would change `verify --known-red`'s verdict on heads the linked-base judgment refuses, touching the door's contract. A separate predicate keeps `--known-red` byte-identical while the brief's named consumers (`landGates`, `landPush`) and every other `requireGreenReceipt` merge caller (direct-guards, `merged --check`) share the cover automatically — satisfying the "share the ledger cover or be shown not to reach it" clause by sharing. Note for review: the design sentence "The cover is accepted through `requireGreenReceipt` (`knownRedReceipt`)" is read as naming the caller chain, not the placement; flagged because the literal reading differs.
- **D2 — One reader for unresolved main-red units.** `newRedUnits` and the cover share one `resolvedOnMain` helper: a red observation `R` at sha `r` is resolved by a completed run `L` with `L.end > R.end`, `isAncestor(r, L.sha)`, `isAncestor(L.sha, trackingRef tip)`, and a same-name+command, non-`reused`, non-`blocked` entry that is exit 0, or red whose names (stored `failures` first, `failedTests(log)` otherwise) are all named and exclude the unit's name. `newRedUnits` adopts this rule (its old rule needed exit 0), so a landed run that drops the unit and fails only named tests also ends the incident for notices — the operator's "resolves when" line applied uniformly. A landed run with a nameless failure resolves nothing.
- **D3 — Unit and observation semantics.** A unit is `(command name, command string, failure name)` read from the head run's entries with stored `failures` first, `failedTests(log)` otherwise — same order `newRedUnits` and `runOnce` use. Named excludes `(unnamed)`, `(unnamed) …`, `(script) …`, `(no test name)`, `(log gone)` (prefix match on the first two). A unit is covered when some completed run with `compares` set whose `sha` is an ancestor of the head's merge-base holds a red, non-`reused`, non-`blocked` matching entry containing the unit's name, and that observation is not `resolvedOnMain`. "At or before the merge-base" is `isAncestor(baseRun.sha, mergeBase)` (an ancestor of itself counts as at). Head entries contribute units for every entry with `exit !== 0` and no `blocked` — `reused` head entries still contribute (their stored names are real failures; mirrored from `knownRedReceipt`), `blocked` entries never ran and need no cover. At least one red unit must exist (mirrors `red > 0`).
- **D4 — Cover predicate shape.** `mainRedCover(repo, sha)` (exported from `src/verify.ts`): completed runs on `sha`'s tree whose command set equals `verifyCommands(config, 'merge')`; any such run whose red units are all covered accepts. `requireGreenReceipt` becomes `green === undefined && !(await knownRedReceipt(...)) && !(scope === 'merge' && (await mainRedCover(...)))` → throw. Leaf scope never consults the ledger.
- **D5 — `land` proceeds on any non-zero verify exit when `mainRedCover` accepts.** The cover's own "one completed run on the head tree" reading decides; an exit-2 pass that left a completed earlier covered run lands the same as an exit-1. On no cover the existing `handOff { wake: 'red', red }` path is byte-identical (uncovered reds go where leaf merge-red-exit owns them; `redRun` keeps throwing on no completed merge run).
- **D6 — No schema or interface changes.** `verifyRunSchema` already stores `failures`; the lock file, notice code and `slow` logic are untouched. `src/flaky.ts` reads only — it already prefers stored `failures`.

## Interfaces

- `src/verify.ts`: `export async function mainRedCover(repo: Repo, sha: string): Promise<boolean>`; private `resolvedOnMain(repo, runs, redRun, unit, tip)` shared by `mainRedCover` and `newRedUnits`; private `named(name: string): boolean`; private `unitNames(repo, entry): Promise<string[]>` = `entry.failures ?? failedTests(repo, entry.log)`.
- `src/land.ts`: in `land`, replace `if ((await verify(...)) !== 0) return handOff(...)` with `verify code !== 0 && !(await mainRedCover(repo, head))` → handOff; covered → fall through to `landGates`/`landPush`. `head` = `git rev-parse HEAD` in `leaf.state.worktree ?? repo.root` (same worktree `redRun` reads).
- Callers unchanged: `src/phase.ts` `recordTested`/`batchPush` keep calling `requireGreenReceipt(repo, head, 'merge')`.

## Checklist

Wave 1 — unit U1 (serial-solo; tests already committed as 0be68958):

- [ ] `src/verify.ts` — `mainRedCover`, `resolvedOnMain`, `named`, `unitNames`; `requireGreenReceipt` merge branch; `newRedUnits` on the shared resolver.
- [ ] `src/land.ts` — covered red continues to gates/push.
- [ ] `tests/verify.test.ts` — `requireGreenReceipt` cover matrix (committed): accept stored/log names, base at/ancestor of merge-base; refuse all nameless forms, base after merge-base, names differ, one uncovered unit among covered, incomplete or setup-failed base, leaf scope; resolution refuses on landed green and landed red-without-unit-only-named; accepts while landed red-with-unit, landed nameless-only, landed ending before the base run, green sha not on main.
- [ ] `tests/verify.test.ts` — landed red-without-unit re-notices (committed): `verify --known-red` writes notice 2 after a seeded landed run failing only `beta`.
- [ ] `tests/green-merge.test.ts` — covered head lands in one `akrogon land` with one verify, `merged` attempts row, no merge-issue prompt, one land launch (committed); named uncovered head hands off `wake: 'red'` (committed, already green).
- [ ] `tests/receipt-gates.test.ts` — `merged --check` accepts covered / refuses uncovered / refuses resolved; `direct-guards` accepts covered / refuses uncovered; `landPush` (in-process) lands covered / throws receipt error on uncovered (committed).
- [ ] `docs/reference/checks.md` — receipt-gate paragraph: merge scope also accepts a covered main-red head; state the cover rule (named unit, completed base run at/before merge-base, not resolved by a later landed run that passes or fails only other named tests; nameless never covers, resolved means green or named-only-without-unit).
- [ ] `docs/reference/files.md` — `verify-runs.jsonl` row: the main-red cover reads stored `failures` before the log like `akrogon flaky` (the "never reads it" clause refers to the linked-base judgment only).
- [ ] `docs/reference/commands.md` — `akrogon land` row: a red verify lands when every failing unit is covered on main.
- [ ] Human docs: the three reference pages above. Agent docs: none — no skill file names this behavior; the lifecycle red-check rule (`lifecycle-rules.md`) governs seat-side reds, unchanged.
- [ ] `bun run typecheck` and `bunx prettier --check src tests` clean; the four touched test names green.

## Verification

Per criterion (mechanical behavior → observation, command, size, rerun trigger):

1. **C1** — covered head lands first land run, one verify, no base run, `merged` row: real `akrogon land` on a fixture repo with a seeded completed base run; assert remote tip = batch top, state `merged`, exactly one run besides the seed (no `compares` row, no rerun), `attempts(f) == ['merged']`, no merge-issue prompt. `bun test tests/green-merge.test.ts -t 'covered by an unresolved'`. Seconds.
2. **C2** — nameless / not-unresolved / after-merge-base → ordinary red path: `requireGreenReceipt` reject matrix + `akrogon land` hand-off `wake:'red'` (named unit, no base cover). `bun test tests/verify.test.ts -t 'covered merge head and refuses'`, `bun test tests/green-merge.test.ts -t 'hands off to the seat'`. Seconds.
3. **C3** — later landed run (green, or red without the unit and only named) resolves; nameless landed resolves nothing: the same matrix's `landed` seeds + the `--known-red` re-notice case (unified reader resolves the incident). `bun test tests/verify.test.ts -t 'covered merge head and refuses'` and `-t 'resolves the main-red incident'`. Seconds.
4. **C4** — `landGates`/`landPush` accept covered, refuse uncovered: `merged --check` exit/`tested_top`, `direct-guards` exit, in-process `landPush` `{kind:'landed'}`/receipt throw. `bun test tests/receipt-gates.test.ts -t 'covered main-red head'`. Seconds.

Consumer replays: `requireGreenReceipt` callers (`recordTested`, `batchPush`, `merged --check`, `direct-guards`) replay the predicate with no model stage; `--known-red` and `newRedUnits` notice writes replay in the C3 test.

Condition-by-decision check (done-criterion conditions traced):

- D1 scope bound: leaf scope must never take the ledger cover — matrix case "Leaf scope has no ledger cover". Deliberate break red: `scope === 'merge'` removed → leaf case would wrongly accept (post-implementation break check).
- D3 named bound: any nameless unit between head and cover must refuse — the four nameless forms case.
- D3 merge-base bound: base run after merge-base must not cover — the "after" case.
- D3 all-units bound: one uncovered unit among covered refuses — the two-name case.
- D3 observation bound: incomplete or setup-failed base never covers — two cases.
- D4 resolution bound: resolution requires later end AND landed sha AND (green OR named-only-without-unit) — refuse cases (green, red-beta-only), accept cases (red-with-unit, nameless-only, earlier-end, not-on-main sha).
- D2 shared rule: the notice writer resolves the same way — `--known-red` re-notice case.
- D5 land bound: covered continues (C1), uncovered keeps `wake:'red'` (C2 land case).

Red-before-code evidence (kept via `akrogon run-check`):
- `check cover-land-red: 1` — covered-land test fails at `remoteTip` (hand-off, no push).
- `check cover-receipt-red: 1` — receipt matrix fails at first `await requireGreenReceipt` (rejected, no cover).
- `check cover-notice-red: 1` — `noticeFiles` stays 1 (old exit-0-only resolution keeps the incident).
- `check cover-gates-red: 1` — `merged --check` exits 1 on the covered head.
- `check cover-land-uncovered: 0` — the uncovered land case already passes on the unchanged path (keeps the current contract; it goes red only if D5 leaks the cover into the hand-off, break check below).

Deliberate breaks to run post-implementation (temporary edit, reverted before the product commit): (a) drop the `scope === 'merge'` guard → leaf-scope case must go red; (b) drop `land`'s cover consult → C1 lands test goes red and the uncovered case stays green; (c) count a nameless landed failure as resolving → the nameless-landed accept case goes red; (d) drop the `isAncestor(L.sha, tip)` check → the not-on-main accept case goes red.

## Gaps and blockers

- None. `akrogon status main-red-cover` reports no `Missing:` env names; `env_names: []`. No grants, no paid operations, no live actions.
- Held disagreement stands unanswered: slot C asked to also exclude `flakyLines` titles from covers (design records it; excluded scope here — the cover implements the operator's Taken 7 verbatim, flake titles included).

## Design/brief conflicts

- Design "The cover is accepted through `requireGreenReceipt` (`knownRedReceipt`)" vs design "whose explicit linked-base two-log judgment in `knownRedReceipt` must not change": resolved by D1 (cover in `requireGreenReceipt`, `knownRedReceipt` untouched). Recorded for review per the design-wins rule — no locked decision changed; the parenthetical was an open question the plan answered.

## Implementation notes

- 2026-11-21 — Brief C2 and C4 require the current uncovered failure to stop landing. Bind the automatic cover and its gates to the verify run for that attempt, and prove it with two red runs on the same tree.
