# Brief u1: verify --known-red command and receipt gate

Worktree: /home/ivan/.akrogon/worktrees/akrogon/known-red-pass-u1

## 1. Goal

Implement plan decisions D1–D9 of `plan.md` (at `/home/ivan/Work/infra/akrogon/issues/open/main-red/known-red-pass/plan.md`): `akrogon verify --known-red` runs the caller's command set fresh on the tested commit's merge-base, records that base run linked to the head run, and `requireGreenReceipt` accepts a qualifying linked head+base pair wherever it accepts a green receipt.

## 2. Numbered acceptance criteria

From the brief's done-criteria (already-encoded tests live in `tests/verify.test.ts` and `tests/receipt-gates.test.ts` at HEAD):

1. `akrogon verify --known-red` on a leaf head whose only failures also fail on its exact base exits 0, prints `verify known-red <sha>: pass`, and appends a base run record whose `compares` equals the head run's `run` id; `akrogon phase <slug> check.review` then succeeds.
2. A head failing on a test the base passes exits nonzero and `check.review` still refuses with `No green leaf verify receipt`.
3. No linked pair passes when a nonzero head command yields no failing test names (the `(no test name)` / `(log gone)` placeholders count as no names), when either run is incomplete or `setup !== 0`, or when the base run's command set differs.
4. The base always runs fresh; a pre-existing green receipt for the base tree is never reused as the base half.
5. A qualifying merge-scope pair satisfies `merged --check`, the batch push gate and `direct-guards.ts`; a non-qualifying pair refuses all three.
6. Plain `akrogon verify` (no flag) is unchanged.

A worker writes and edits no test: a planned test that is wrong or red once your code is correct returns a mismatch, never a test fix.

## 3. Read-first list

- `src/verify.ts` — the whole file; the run body becomes `runOnce`
- `src/flaky.ts` — `failedTests` (private; export per D6), `flips`
- `src/run-check.ts` — `checkedRun`, `LeafTarget`
- `src/config.ts` — `worktreeStore`, `base`, `setupCommand`
- `src/preflight.ts` — `trackingRef` (line 4)
- `src/akrogon.ts` — verify option map ~line 35 and `case 'verify'` ~line 214
- `src/next.ts` — `createSparseWorktree`, `emitEnvFile`
- `src/guard.ts` — `checkLocation`
- `src/state.ts` — `withLock`
- `skills/implement-issue/ponytail.md`

## 4. Change list and needed interfaces

Chunks that must land first: none. Owned paths: `src/verify.ts`, `src/flaky.ts`, `src/akrogon.ts`. No shared test resource. Do not touch `src/phase.ts` or `skills/chart-issues/scripts/direct-guards.ts` — their `requireGreenReceipt` call sites stay byte-identical.

- D1: `src/akrogon.ts` verify options gains `'known-red': { type: 'boolean' }`; `verify()` gets a trailing `knownRed` boolean parameter (`values['known-red'] === true`).
- D2: `verifyRunSchema` gains `compares: z.string().optional()`; only base runs carry it.
- D3: extract the existing run body (allocation through worktree removal) into `runOnce(repo, caller, sha, scope, akrogonBase, compares?)` returning the finished `VerifyRun`; head and base runs both go through it. `AKROGON_BASE` for the base run is `baseSha` itself (D9).
- D4 flow in `verify()`: the `greenRun` reuse short-circuit is unchanged. With `knownRed`: head = most recent completed run for the tested tree and scope with `setup === 0`, commands index-matching `verifyCommands(repo.config, scope)`, and ≥1 nonzero command; when none exists run the head first via `runOnce` (green → exit 0). Then `baseSha = git merge-base <sha> <trackingRef(repo)>` in `repo.root`, run the base fresh via `runOnce` with `compares = head.run` — never through `greenRun` (D4/D3). Result `pass` iff base completed, `base.setup === 0`, and for every nonzero `head.commands[i]`: `failedTests(repo, head.commands[i].log)` is non-empty, free of `(no test name)`/`(log gone)` placeholders, and a subset of `failedTests(repo, base.commands[i].log)`. Print `verify known-red <sha>: pass|fail`; exit 0 only on pass.
- D5 `requireGreenReceipt`: keep the `greenRun` path; else scan candidate head runs (completed, `tree === treeOf(sha)`, scope, index-matched commands, `setup === 0`, ≥1 nonzero) newest-first by `end`, accepting when some candidate has a completed base run with `compares === head.run`, `base.sha === git merge-base <sha> <trackingRef(repo)>`, `setup === 0`, index-matched commands, and the D4 subset rule per nonzero command. Refusal error text unchanged.
- D6: export `failedTests` from `src/flaky.ts` unchanged.
- D7: `flips` unchanged — base runs stay as real observations.
- D8: `src/reconcile.ts` unchanged (confirmed it only matches `run.run` and `end`).

Keep the diff minimal and the existing style (strict zod, single-expression helpers, `command(['git', ...], cwd)`).

## 5. Do-not, reasons and exceptions

- Do not touch `src/phase.ts`, `src/reconcile.ts`, `skills/` files or `docs/` — owned by other units or excluded by the plan; the exception is a revised brief from A.
- Do not add a base-run reuse path on the base side — criterion 4 requires fresh; the exception is a revised brief.
- Do not edit or add tests — planned tests are A's; a wrong/red planned test is a mismatch with evidence.
- Do not widen `verifyRunSchema` beyond `compares` or change record consumers — D7/D8 already decided; return a mismatch with evidence instead.
- Return a mismatch naming the conflicting requirement and smallest correction instead of changing scope, an interface, or the plan; the exception is a revised brief from A authorizing it.

The reasons: scope splits are the merge contract with sibling unit u2, and the base-fresh and no-test-edits rules come from the locked design. Exceptions are a revised brief only.

## 6. Ordered steps

1. `bun install --frozen-lockfile` in the u1 worktree.
2. `src/flaky.ts`: export `failedTests` (D6).
3. `src/verify.ts`: add `compares` to the schema (D2), extract `runOnce` (D3), add head-selection + base-run + result logic (D4), widen `requireGreenReceipt` (D5). Criteria 1–6.
4. `src/akrogon.ts`: flag + parameter (D1). Criterion: flag parses.
5. Run the section-7 commands; all must pass.

Advisory size: about 3 files and under 20 turns.

## 7. Commands

Run inside the worktree via the installed akrogon binary (the leaf slug `known-red-pass` resolves from the registered repo; cwd is the worktree):

- `akrogon run-check --name u1-verify -- bun test tests/verify.test.ts`
- `akrogon run-check --name u1-gates -- bun test tests/receipt-gates.test.ts`
- `akrogon run-check --name u1-flaky -- bun test tests/flaky.test.ts`
- `akrogon run-check --name u1-keep -- bun test tests/keep-rule.test.ts`
- `akrogon run-check --name u1-typecheck -- bun run typecheck`

If `akrogon run-check` refuses the caller, plain `bun test <file>` in the worktree is acceptable for iteration, but cite `akrogon run-check` for the final kept output.

## 8. Done-when, evidence and report

All section-7 commands exit 0, cited by their printed `check <label>: <exit> <path>` lines. Commit your chunk (product code only — tests are already committed) with a clear message; no `Test-Change:` trailer needed since no existing test file changes. `git status --porcelain` clean at return.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
