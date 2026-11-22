# Report: main-red-cover

Serial-solo implement, no workers. Base `4f5e3fd2ae13439c7fd8d8507c18ec524c0f9444` (origin/main at pass start and at finish; refresh was a no-op both times). Head `a420e39c`.

## Changed files

- `src/verify.ts` — hoisted `Unit`/`matching`/`failedTests`-first name read; added `named()` (nameless = `(unnamed)…`, `(script)…`, `(no test name)`, `(log gone)`); added `mainAncestors()` (tip + ancestry cache shared by `onMain` and `before`); added `resolvedOnMain()` shared by the cover and `newRedUnits` (later end, landed sha, at/after red sha, entry exit 0 or red naming only other real titles); added `mainRedCover(repo, sha)` (completed runs on the head tree under merge commands; every red unit named and observed by a completed `compares` run at/before the merge-base, unresolved); `requireGreenReceipt` accepts the cover at merge scope only; `knownRedReceipt` untouched.
- `src/land.ts` — after a non-zero `verify`, consult `mainRedCover` on the worktree HEAD; covered falls through to `landGates`/`landPush`, uncovered keeps `wake: 'red'` hand-off.
- `tests/verify.test.ts` — cover matrix on `requireGreenReceipt` (stored + log names, base at/ancestor of merge-base, all nameless forms, base after merge-base, names differ, partial cover, incomplete/setup-failed base, leaf scope, all resolution shapes incl. ended-before and not-on-main) and the `newRedUnits` re-notice case for resolution-by-named-red.
- `tests/green-merge.test.ts` — `akrogon land` end to end: covered head lands in one verify (`merged` row, no rerun, no `compares` run, no prompt); named uncovered head hands off `wake: 'red'`.
- `tests/receipt-gates.test.ts` — `merged --check` stamps `tested_top` on covered / refuses on uncovered / refuses on resolved; direct-guards shares the cover; in-process `landPush` lands covered and throws the receipt error on uncovered.
- `docs/reference/checks.md` — receipt-gate paragraph now describes the merge-scope main-red cover and the resolution rule.
- `docs/reference/commands.md` — `akrogon land` row names the covered main-red landing.
- `docs/reference/files.md` — `verify-runs.jsonl` row: stored `failures` is read before the log by flaky, the unit matcher and the merge-scope cover; the linked-base known-red receipt still needs both logs.

No env needed; `akrogon status` showed no `Missing:` names. No grants, no paid operations. No `issues/` files on the branch.

## Commits

- `0be68958` test: criterion cases red-first (Test-Change trailers per file).
- `bd3af1d6` test fix: read `landPush`'s last stdout line (cites real output `cover-gates-1795291665902`).
- `fe4b32c7` test fixes: containers, tested_top stamp, schema-empty failures, second base row (cites `cover-gates4`, `cover-gates5`, `cover-notice`).
- `443fd680` feat: implementation + docs.
- `a420e39c` test fix: not-on-main case routes through the resolver (cites `break-onmain` green-break finding).

## Criterion proofs (command → result)

- C1 `bun test tests/green-merge.test.ts -t 'covered by an unresolved'` — `check cover-land: 0` (green head lands, remote tip = top, one run besides the seed, `merged` row, no prompt). Seconds.
- C2 `bun test tests/green-merge.test.ts -t 'hands off to the seat'` — `check cover-land: 0`; `bun test tests/verify.test.ts -t 'covered merge head and refuses'` — `check cover-receipt: 0` (all nameless forms, after-merge-base, differing names, partial cover, incomplete/setup-failed base, leaf scope). Seconds.
- C3 same receipt matrix + `bun test tests/verify.test.ts -t 'resolves the main-red incident'` — `check cover-notice2: 0` (landed green and landed red-without-unit resolve; red-with-unit, nameless-only, earlier-end, not-on-main resolve nothing). Seconds.
- C4 `bun test tests/receipt-gates.test.ts -t 'covered main-red head'` — `check cover-gates6: 0` (`merged --check`, direct-guards, `landPush` covered accept + uncovered refuse). Seconds.
- Neighbors: `bun test tests/verify.test.ts -t 'main-red'` — `check proofs-final: 0` (6 pass including stored-name and leaf-scope-resolution cases).

## Deliberate breaks (each reverted immediately after its kept log)

- D1 scope bound: dropping `scope === 'merge'` → `check break-scope: 1` (leaf-scope case accepted when it must refuse).
- D5 land consult: dropping `mainRedCover` in `land` → `check break-land: 1` (lands test red, uncovered case stayed green).
- Resolution nameless bound: dropping `named()` in the resolver → `check break-nameless2: 1`.
- On-main bound: dropping `onMain` → `check break-onmain: 0` exposed a blind case; test corrected (a420e39c) and `check break-onmain2: 1` proves it.

## checks

- `akrogon verify` on `a420e39c`: run `abf95ef1` ended red — `test` exit 1 on `slot B starts under the live A` (`tests/hc-start.test.ts`), a file the diff does not touch and no plausible cause in the diff. Retry rule: one retry of the same command, `akrogon run-check --name test-retry -- bun test --timeout=30000 --parallel=4 --no-isolate`. The first retry run `f6b59338` was killed by a tool timeout mid-flight (abandoned capture pair; recovered and recorded in `cleared-f6b59338-…​.md`). Rerun `test-retry2` passed all 1268 tests — the check is `inconsistent`: `check test-retry2: 0` vs the red `check test` log `implementation/check-test-1795292019010-3072193.log`. A later pass on the same head then completed green and `akrogon verify` printed `reuse receipt d56915b4` — `verify leaf a420e39c: green`.
- `format` and `typecheck` green inside the verify runs (`check-format-…3072193`, `check-typecheck-…3072193`).

## Wall time

- `bun test --timeout=30000 --parallel=4 --no-isolate` (whole suite): 202.86 s — minutes.
- `akrogon verify` pass: ~25 min wall including the suite on a fresh checkout — minutes.
- All criterion proofs: seconds each.

## Known limitations / unverified

- `reused` head entries contribute units (mirroring `knownRedReceipt`); no `reused` writer exists in this tree, so that path is unexercised — noted in plan.md D3.
- The design's `(knownRedReceipt)` parenthetical was resolved to `requireGreenReceipt` per plan D1; flagged for review in plan.md.
- C's `flakyLines` dissent stays unanswered (locked scope: cover includes flake titles).
- Accept cost per design: a new break inside an already-red test can land — the operator's base-red bar, unchanged.
