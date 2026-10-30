# Brief U1: slow-merge-notice mechanism

Worktree: `/home/ivan/.akrogon/worktrees/akrogon/slow-merge-notice-u1`
Leaf plan: `/home/ivan/Work/infra/akrogon/issues/open/merge-slow-alarm/slow-merge-notice/plan.md` (authoritative; this brief copies its binding facts).

## 1. Goal

Implement plan decisions D1–D7: every completed merge-scope head verify run is compared against the recent normal merge wall time; slow runs open an episode pinned to its pre-jump normal, print a `verify slow:` line, send one `repo merge slow` herdr notification per episode (retried by later in-episode runs on failure), and leave `Slow merge:` visible in `akrogon status` while the episode is open. Merge exit status and receipt gates never change.

## 2. Numbered acceptance criteria

1. `bun test --timeout=30000 tests/slow-merge.test.ts` fully green (6 tests — the committed contract: flag boundary at >1.5×normal and ≥120s, ≥5 eligible gate, eligibility kinds, episode normal pinning, `recovered`/`accepted` closes, notice retry, `Slow merge:` status line).
2. `bun run typecheck` exits 0.
3. `tests/verify.test.ts` green — every receipt consumer (`requireGreenReceipt`, `greenRun`, `redRun`, `reuseSource`, `knownRedReceipt`, `newRedUnits`, `sendMainRedNotice`, `reportRun`) is byte-for-byte behavior-identical; the `slow` field is never read outside the new code.
4. No timer, poll or watchdog: the comparison runs once inside `runOnce`'s existing locked final rewrite.

## 3. Read-first list

- `src/verify.ts` — whole file; `verifyRunSchema`, `completed`, `runOnce` (initial `appendFileSync` + `finally` `withLock` rewrite), `sendMainRedNotice`, `noticeSchema`, `noticeCovers`, `recordsPath`, `readVerifyRuns`.
- `src/status.ts` — `statusCommand` scan loop and the `for (const scan of scans) { if (scan.ok) for (const line of unpackedLines(scan.repo.root)) console.log(line); }` block.
- `src/verify-pass.ts` — `pidAlive`, `bootId`.
- `src/shell.ts` — `herdr`, `repoSession`, `SessionResolution`.
- `tests/slow-merge.test.ts` — the contract, committed red; read every assertion.
- `tests/verify.test.ts` — `noticeEnv`, `noticeCalls`, `--holder` invocation, seeded-run patterns.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

Owns (no other unit touches these): `src/verify.ts`, `src/status.ts`. Must land first: nothing. Shared test resource: none. Consumes: the committed `tests/slow-merge.test.ts` (do not edit).

In `src/verify.ts`:

- `verifyRunSchema` gains:
  ```ts
  slow: z
    .strictObject({
      ms: z.number().int(),
      normal_ms: z.number().int(),
      first: z.strictObject({ run: z.string(), leaf: z.string() }).optional(),
      close: z.enum(['recovered', 'accepted']).optional(),
      notice: z.string().optional(),
    })
    .optional(),
  ```
- Private helpers near `completed`/`reuseSource`: `slowChecked(run)` = `run.scope === 'merge' && run.compares === undefined && run.end !== undefined`; `slowEligible(run)` = `slowChecked(run) && run.setup === 0 && run.commands.every((item) => item.reused === undefined && item.blocked === undefined)`; `median(values: number[]): number`; `minutes(ms)` = `Math.round(ms / 60000)`.
- Extract from `sendMainRedNotice` a shared `rewriteRun(repo, lock, runId, mutate: (run: VerifyRun) => VerifyRun): Promise<void>` holding the existing `withLock` + `readVerifyRuns` + `findIndex` + temp-write + `renameSync` block, and a shared `noticeSend(repo, args): Promise<string>` holding `repoSession` + `herdr(args, noticeSchema, {session})` returning `result.reason`; `sendMainRedNotice` keeps its exact behavior through both.
- `decideSlow(runs, index, boot)`: pure function over the in-memory array used by `runOnce`'s final rewrite (earlier rows = indices `< index`; ledger order is append order, no sorting). Skip entirely when `!slowChecked(runs[index])`. Else compute `ms = Date.parse(me.end) - Date.parse(me.start)`; `latest` = last earlier row with `slow` !== undefined; `open` = `latest?.slow?.first !== undefined && latest.slow.close === undefined` ? `latest.slow` : undefined; `normal = open?.normal_ms ?? (eligible earlier `.slice(-20)` median, only when ≥5, else return)`. `flagged = ms > 1.5 * normal && ms - normal >= 120000`. `first = flagged ? (open?.first ?? {run: me.run, leaf: me.leaf}) : open?.first`. `close`: when `open !== undefined && !flagged` → `'recovered'` if `slowEligible(me)` else (when open && all of the last 20 eligible earlier rows have `slow?.first?.run === open.first!.run`) → `'accepted'` else undefined — recovered is checked before accepted. `print`/`send` side outputs: `print` on `flagged` (`verify slow: ${minutes(ms)}m measured vs ${minutes(normal)}m normal; first seen at ${first.leaf} ${first.run}`) and additionally `; accepted as new normal` when `close === 'accepted'`; `send` when `first !== undefined` and no earlier in-episode row (rows with `slow?.first?.run === first.run`, including only those `< index`) holds `slow.notice === 'shown'` or `slow.notice === 'pending'` with `row.boot_id === boot && pidAlive(row.pid)`; `send` carries the notification body `merge verify ${minutes(ms)}m vs ${minutes(normal)}m normal; first seen at ${first.leaf} ${first.run}`. When `send` is armed the row's `slow.notice` is `'pending'` in the same locked write.
- `runOnce`'s `finally` block: inside the existing `withLock`, after `runs[index]` gains `end`, call `decideSlow(runs, index, bootId())` and merge `slow` into `runs[index]` (only when a decision object exists); after the lock: `process.stdout.write(print + '\n')` when a line exists, then `await sendMergeSlowNotice(repo, id, lock, body)` when `send` — placed next to the existing `send`/`sendMainRedNotice` pair, before the worktree remove. Exit paths, `reportRun`, `receipt` return value: untouched.
- `sendMergeSlowNotice(repo, runId, lock, body)`: sibling of `sendMainRedNotice` — `herdrArgs = ['notification','show',`${repo.name} merge slow`,'--body',body,'--sound','none']`; `delivery = await noticeSend(repo, herdrArgs)` catching to `'error'` with stderr `notice: <err>`; then `rewriteRun(repo, lock, runId, (run) => ({...run, slow: {...run.slow!, notice: delivery}}))`.

In `src/status.ts`:

- Import `readVerifyRuns`, `VerifyRun` from `./verify`.
- `Scan` ok-variant gains `slow: VerifyRun | undefined`; `scanRepo` computes it inside its `try` as `readVerifyRuns(repo).findLast((run) => run.slow !== undefined)` after `path = resolve(repo.root, 'issues/verify-runs.jsonl');`.
- In `statusCommand`'s unscoped section, in the same block that prints `unpackedLines` lines, for each `scan.ok` where `scan.slow?.slow?.first !== undefined && scan.slow.slow.close === undefined` print `Slow merge: ${scan.repo.name} first seen at ${scan.slow.slow.first.leaf} ${scan.slow.slow.first.run}, last ${Math.round(scan.slow.slow.ms / 60000)}m vs normal ${Math.round(scan.slow.slow.normal_ms / 60000)}m`.

## 5. Do-not, reasons and exceptions

- Do not edit `tests/slow-merge.test.ts` or any test file — a red or wrong planned test returns a mismatch with evidence, never a fix. Exception: a revised brief from A.
- Do not change `reportRun`, exit codes, `requireGreenReceipt`, reuse/known-red logic, the `notice` field semantics for main-red, or add a file — reasons: locked design (exit/receipt never change; slow delivery separate from main-red `notice`; ledger-derived, no new file). Exception: revised brief.
- Do not guard the slow decision behind try/catch or defaults — a thrown check is a product bug, and errors must surface, same as `newRedUnits` inside the same rewrite. Exception: none.
- Do not print `verify slow:` on `recovered` closes or unflagged rows, and do not print `Slow merge:` in targeted `status <slug>` — the design enumerates exactly the two line cases and the unscoped board. Exception: revised brief.
- Reasons restated: receipt/exit invariants are locked; line cases are enumerated; tests are the contract. The only exception route is a revised brief from A.

## 6. Ordered steps

1. `src/verify.ts` — schema field, eligibility/normal/episode helpers, `rewriteRun`/`noticeSend` extraction, `sendMergeSlowNotice`, `decideSlow`, `runOnce` wiring. (AC 1–4)
2. `src/status.ts` — `Scan` field, `scanRepo` read, `Slow merge:` print. (AC 1, 4)
3. `bun install --frozen-lockfile --backend=copyfile` in the worktree, then the commands in §7 until green.

Advisory size: ~2 files, ~30 turns.

## 7. Commands

- `bun test --timeout=30000 tests/slow-merge.test.ts`
- `bun test --timeout=30000 tests/verify.test.ts`
- `bun run typecheck`

Keep output through `akrogon run-check --name <label> -- <cmd>` run from this worktree (`--holder` is not needed; the `-u1` suffix resolves) and cite the printed `check <label>: <exit> <path>` lines.

## 8. Done-when, evidence and report

All §2 criteria green; `git diff --stat` covers only the two owned files; commit on detached HEAD (`git -C <worktree> commit`), return the commit id.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
