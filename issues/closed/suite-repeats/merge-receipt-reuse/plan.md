# Plan: merge-receipt-reuse

One rule replaces two: a receipt row counts when it is completed (`end` set, `setup` 0), sits on the head tree, and its command list equals the caller's expected list (`sameCommands`). `run.scope` selects the expected list and stays on the row for the member split, `slowChecked`/`slowEligible`, PassKey and `land.ts`'s red-run read; it is consulted in no receipt or notice lookup.

## Decisions

- D1 (design Q1): merge accepts a same-tree receipt from any scope. Cost accepted: merge-scope reuse writes no new merge row, so `slowChecked`/`slowEligible` get fewer samples and `flaky.ts` loses merge-time flake flips on unchanged trees.
- D2 (design Q2): one-row rule. `greenRun`, `redRun`, `reuseSource` drop the `run.scope === scope` filter and the `scope` parameter; `requireGreenReceipt` calls `greenRun` and its cross-row stitch is deleted. `knownRedReceipt` judges one eligible head row at a time: the row needs at least one red entry, and each red entry (a `blocked` entry does not count as red and needs no cover) is covered by a linked base run (`compares === head.run`, merge-base sha, completed) whose same-name-and-command entry is red, unblocked, and fails every name the head entry fails. The cross-row green shortcut (`heads.some(entry 0) → continue`) goes. `Unit` drops `scope`; `matching` becomes `run.commands.find` on name, command and `blocked === undefined`.
- D3 (design Q3): proof is the inverted 5d0b505f reproducer (leaf verify green → merge verify on the same tree prints `reuse receipt` and writes no row; leaf verify red → merge `--known-red` reuses that leaf head row and its fresh base comparison satisfies the gate), one negative (a `merge_checks` member absent from the leaf row runs at merge, gate refuses before it is green), the existing stitch test rewritten to refuse the split rows, and one new notice test proving leaf-scope green resolves a merge-scope main-red.
- D4: `docs/reference/state-and-phases.md` states no scope rule (checked; line 33 needs only "a green `akrogon verify` receipt", which stays true) — no edit. `docs/reference/commands.md`'s verify line already describes per-command same-tree reuse — no edit. Receipt prose updates land in `docs/reference/checks.md`, `src/AREA.md` (`src/verify.ts` line and the `receipt matches` pattern line), `tests/AREA.md` (the `tests/verify.test.ts` line).
- D5: `requireGreenReceipt(repo, sha, scope)` keeps its signature and error text (`phase.ts:429,432,678,749`, `direct-guards.ts:20` unchanged); `scope` only feeds `verifyCommands`.

## Read-first paths

- `src/verify.ts` — `greenRun`, `redRun`, `reuseSource`, `knownRedReceipt`, `requireGreenReceipt`, `Unit`, `matching`, `newRedUnits`.
- `tests/verify.test.ts` — `callerWorktree`, `commitIn`, `config`, `verify`, `records`, `noticeEnv`, `noticeCalls`, `failureScript`, `baseRecord`, `directHolder`; the 5d0b505f reproducer (line 1487) and the stitch test (line 1271).
- `tests/helpers.ts` — `seedRun`, `greenReceipt`, `cli`, `fakeAkrogon`, `fakeHerdr`.
- `tests/receipt-gates.test.ts` — gate walk style through `merged --check` and `direct-guards.ts` (no changes needed; callers keep the signature).
- `docs/reference/checks.md` — `## Prove a commit with akrogon verify`, `## Known red`, `## What runs where` reuse sentence.
- `src/verify-pass.ts` — PassKey (scope stays in the live-pass join key).

## Interfaces

- `greenRun(repo, tree, expected)` / `redRun(repo, tree, expected)` / `reuseSource(runs, tree, item)` — scope-free; callers pass `verifyCommands(repo.config, scope)`.
- `knownRedReceipt(repo, sha, scope)` — signature kept; heads = completed rows on head tree with `sameCommands(expected)`; per-head-row judgment.
- `Unit = { name; command; test }` — no `scope`; stored rows unchanged (no migration).

## File/criterion checklist

### Wave 1 — unit 1 (only unit; serial-solo run, A implements the plan itself)

Owns: `src/verify.ts`, `tests/verify.test.ts`, `docs/reference/checks.md`, `src/AREA.md`, `tests/AREA.md`.

| Criterion | Test | Proof command | Size | Rerun trigger |
| --- | --- | --- | --- | --- |
| 1. Merge `verify` exits 0 reusing a green leaf row: no check command runs, no row written; merge gate accepts | Rewritten `merge verification accepts same-tree receipts and links a cross-scope known-red pair` (was `merge verification selects green and red receipts from its own scope`, tests/verify.test.ts): green half asserts exit 0, `reuse receipt <run> tree=<tree>` output, `records(f)` length 1, `requireGreenReceipt(repo, head, 'merge')` resolves | `bun test tests/verify.test.ts -t '<name>'` through `akrogon run-check` | seconds | `greenRun`, `requireGreenReceipt`, `verify` fast path |
| 2. `merge_checks` command missing from the leaf row runs at merge; gate refuses until that row is green | New `a merge-only command the leaf row lacks runs at merge verify and the gate needs the resulting row` in tests/verify.test.ts: `checks:{unit}` + `merge_checks:{member: touch marker}`; leaf verify green; `requireGreenReceipt(..., 'merge')` rejects; merge `--holder` verify exits 0, marker exists, new row carries member non-`reused` and unit `reused` from the leaf run; then gate resolves | same | seconds | `sameCommands`, `reuseSource`, member stage, `requireGreenReceipt` |
| 3. Two rows each green only in the other's red satisfy neither the fast path nor a gate | Rewritten `requireGreenReceipt refuses rows green only across different runs on one tree` (was `...passes when commands turned green across different runs...`, line 1271): seed two completed merge-scope rows on the head tree `[c1 0, m1 7]` and `[c1 7, m1 0]`; `requireGreenReceipt(repo, sha, 'merge')` rejects while they are the only rows; merge `--holder` verify then writes a third row (each entry `reused`) and exits 0 | same | seconds | `requireGreenReceipt` stitch removal, `greenRun` |
| 4. Leaf red head row + linked base satisfies merge gate; `verify --known-red` writes no new head row | Same rewritten reproducer, red half: leaf verify red, merge `--holder --known-red` exits 0 with `verify known-red <sha>: pass`, no run added between the leaf red and the base run, base run `compares ===` leaf head run, `requireGreenReceipt(repo, head, 'merge')` resolves | same | seconds | `redRun`, `knownRedReceipt`, per-row cover |
| 5. Leaf-scope green on main resolves a merge-scope main-red notice; later recurrence re-notifies | New `a leaf-scope green on main resolves a merge-scope main-red unit and re-notifies on recurrence` in tests/verify.test.ts: `failureScript`; merge-phase `callerWorktree` + `verify --attempt --known-red` → 1 notice; fix committed and pushed on main, leaf verify green there; break alpha on main, second merge-phase leaf + `--attempt --known-red` → 2 notices | same | seconds | `Unit`, `matching`, `newRedUnits` |

Doc lines: `docs/reference/checks.md` gets the one-row receipt and per-row known-red wording; `src/AREA.md` and `tests/AREA.md` get their `src/verify.ts`/`tests/verify.test.ts` lines updated. `docs/reference/state-and-phases.md`, `docs/reference/commands.md`, `docs/reference/words.md`, `docs/reference/files.md`: no scope rule stated, no edit. No skill file affected.

## Red evidence (plan.synthesis, pre-implementation)

`akrogon run-check` logs under `implementation/`:

- `check-criterion-tests-1793539086222-3346759.log` (`bun test tests/verify.test.ts -t 'merge verification accepts|requireGreenReceipt refuses|merge-only command|leaf-scope green'`, exit 1):
  - C1: merge verify reran the suite — stdout `verify unit: 0 … verify merge <head>: green`, no `reuse receipt` line; a second row was written.
  - C3: `requireGreenReceipt(repo, sha, 'merge')` resolved through the cross-row stitch instead of rejecting.
  - C5: `noticeCalls` stayed 1 — leaf-scope green never resolved the merge-scope red unit.
- `check-criterion-c2-1793539096295-3359139.log` (`-t 'merge-only command'`, exit 1): the merge row's `unit` entry ran fresh (no `reused`) because `reuseSource` filtered scope.

## Condition check (per done-criterion)

- C1 "without running any check command": D2's `greenRun` is consulted before any `passOnce` call in `verify`; the reused return path cannot reach a check. Red proof: the test's `reuse receipt` line plus row count 1 fails today because `run.scope === scope` hides the leaf row — merge verify writes a second row. Verified by temp edit.
- C2 "runs it / refuses until green": D2's `sameCommands` comparison against the merge expected list is the only gate; a leaf `[unit]` row cannot equal `[unit, member]`. Red proof: gate accepts today only via the stitch (no — leaf row lacks member; today it rejects too). The red surface is `unit` reused cross-scope inside the merge run: today's `reuseSource` scope filter reruns `unit`. Asserted via `reused: <leaf run>` on the unit entry — fails today.
- C3 "satisfy neither": D2 deletes the stitch and `greenRun` requires every entry exit 0 in one row. Red proof: gate resolves today via stitch; rewrite asserts rejection — fails today.
- C4 "satisfies gate / no new head row": D2's per-row `knownRedReceipt` and scope-free `redRun`. Red proof: today `redRun` misses the leaf row → merge writes a fresh merge head row (`runs[3]` scope merge); the rewrite asserts the leaf run is the linked head — fails today.
- C5 "resolves / notifies again": `matching` scope drop is the only path a leaf green enters `newRedUnits`' resolution loop. Red proof: today the second notice never sends (`noticeCalls` stays 1); new test asserts 2 — fails today.

## Notes for review

- The brief's "one green sample per tree lands" shows up as per-command `reused` entries inside the merge row (criterion 3's third row, criterion 2's unit entry): `runOnce` already assembles a full row by copying greens, so the row itself is green and counted. `slowEligible` excludes it (reused entries) — consistent with D1's accepted cost.
- A `blocked` entry is not "red" under D2's per-row known-red rule: it never ran on the head, so it needs no base cover; a row whose only nonzero entries are blocked stays not-green and cannot pass known-red through those entries.
- Known limitation kept: `land.ts` `redRun` still filters `scope === 'merge'` (reads a merge row only after a nonzero merge verify, which still writes one); `src/flaky.ts` flip detection is unchanged — merge-time flake flips on unchanged trees are no longer sampled (brief's stated cost).
