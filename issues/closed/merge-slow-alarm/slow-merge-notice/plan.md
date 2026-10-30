# Plan: slow-merge-notice

Source: brief.md 4 done-criteria; design.md binding decisions 1a/2a/3a/4a, carried locks (never fail merges on wall-clock, no timers — the check runs once at the end of the verify pass).

## Read-first

- `src/verify.ts` — `verifyRunSchema`, `completed`, `runOnce`'s initial append and locked final rewrite, `sendMainRedNotice` + `noticeSchema` + `noticeCovers`, `reportRun`, `verify`, `passOnce`.
- `src/status.ts` — `statusCommand` scan loop, `unpackedLines` block placement.
- `src/verify-pass.ts` — `pidAlive`, `bootId`, `passLive`.
- `src/shell.ts` — `herdr`, `repoSession`, `spawnFiles`.
- `tests/verify.test.ts` — `noticeEnv`, `noticeCalls`, `herdrDb`, `callerWorktree`, `--holder` merge-scope invocation, `memberFailureScript`, seeded-run patterns.
- `tests/helpers.ts` — `fixture`, `cli`, `seedRun`, `leaf`, `register`-style config.
- `tests/fake-herdr.ts` — `notification show` handler, `failNotification`/`failNotificationOnce` seams.
- `tests/status.test.ts` — `register`, status output parsing style.
- `src/AREA.md`, `docs/reference/checks.md`, `docs/reference/commands.md`, `docs/reference/files.md`, `tests/AREA.md` — doc surfaces for the new lines and receipt field.

## Decisions

- **D1 `slow` field shape (Open for the plan: resolved).** `verifyRunSchema` gains `slow: z.strictObject({ ms: z.number().int(), normal_ms: z.number().int(), first: z.strictObject({ run: z.string(), leaf: z.string() }).optional(), close: z.enum(['recovered', 'accepted']).optional(), notice: z.string().optional() }).optional()`. `slow` is written only when the comparison ran (checked run with ≥5 eligible earlier runs or an open episode); `first` present ⇔ the row lies inside an episode; `flagged` is never stored — it is derivable as `ms > 1.5 × normal_ms && ms − normal_ms ≥ 120000`. `slow.notice` is separate from the main-red `notice` field.
- **D2 Checked vs eligible predicates.** Checked: `scope === 'merge' && compares === undefined && end !== undefined` (a completed partial head run is checked; thrown passes have no `end` and are never checked; `compares` runs never checked). Eligible: checked plus `setup === 0` and no command entry carrying `reused` or `blocked`. Both are ledger-local pure functions on the row array, decided once inside the run's own locked final rewrite over earlier rows only (ledger order = receipt append order, per the design's (A,B) lock).
- **D3 Normal computation.** Outside an open episode, `normal_ms` is the median wall time (`end − start`) of the last 20 eligible rows in ledger order; the comparison runs only at ≥5 eligible rows. Inside an open episode, `normal_ms` is the episode's stored `normal_ms` regardless of the rolling set. Flagged: `ms > 1.5 × normal_ms && ms − normal_ms ≥ 120000`.
- **D4 Episode mechanics.** A flagged run with no open episode opens one: `slow.first = {run: own run id, leaf: own leaf}`, `normal_ms` = the rolling normal. Inside an open episode every checked row carries `first`; a non-flagged eligible row closes `recovered`; otherwise the row stays open unless the last 20 eligible rows (excluding the current row — an under-threshold eligible row closes recovered first) all hold `first` naming the episode, which closes `accepted`. `recovered` wins over `accepted`. `akrogon status` and the next run read the last ledger row holding `slow`: `first` set with `close` absent means open.
- **D5 Lines.** Flagged run: `verify slow: <ms>m measured vs <normal>m normal; first seen at <leaf> <run>` on stdout (minutes via `Math.round(ms/60000)`); on the opener `first seen at` names the run itself. Accepted close: `verify slow: <ms>m measured vs <normal>m normal; first seen at <leaf> <run>; accepted as new normal`. `recovered` close and non-flagged in-episode rows print no `verify slow:` line — the receipt records the close and the `Slow merge:` status line disappears, matching the design's enumeration of exactly the two line cases. `akrogon status` (unscoped) prints `Slow merge: <repo> first seen at <leaf> <run>, last <ms>m vs normal <normal>m` per scanned repo whose latest `slow` row is open, next to `unpackedLines`.
- **D6 Notification (Open for the plan: resolved — sibling, shared plumbing).** New `sendMergeSlowNotice(repo, runId, lock, message)` mirrors `sendMainRedNotice`: herdr `notification show "<repo> merge slow" --body "<message>" --sound none`, `noticeSchema` reply → the run's `slow.notice`, `error` on failure, stderr `notice: <err>` on throw, reply recorded through a second locked rewrite of the sender's own row. Shared helpers extracted: `rewriteRun(repo, lock, runId, mutate)` (the locked ledger rewrite now inlined in `sendMainRedNotice`) and `noticeSend(repo, args)` (resolve session + `herdr` + capture). Reservation happens inside the run's locked final rewrite: when the decided row lies inside an episode (including the opener and any close row) and no earlier in-episode row holds `slow.notice === 'shown'` or a `pending` whose reserving row's `boot_id` equals this boot with `pidAlive(row.pid)`, the row gains `slow.notice: 'pending'` and a `sendSlow` flag arms the post-lock send. Delivered means reason `shown` exactly; any other reason or `error` is retried by the next checked in-episode run, including one that closes the episode.
- **D7 Placement.** All of D2–D6's decision lives inside `runOnce`'s existing `withLock` final rewrite after `runs[index]` gains `end`, guarded by the checked predicate; `sendSlow`/`printSlow` are computed there and acted on after the lock (print then send, alongside the existing `send`/`sendMainRedNotice` pair, before the worktree remove). No new lock, no timer, no exit-code path changes: `reportRun` is computed in `verifyPassCommand` from the returned record exactly as today, and `requireGreenReceipt`, `reuseSource`, `greenRun`, `redRun`, `knownRedReceipt`, `newRedUnits` read no `slow` field.
- **D8 Status read.** `scanRepo` reads `readVerifyRuns(repo)` inside its existing `try` (a corrupt ledger reports the repo `ok:false` against the records file, matching how `log.jsonl`/`timings.jsonl` failures already behave) and the unscoped `statusCommand` prints `Slow merge:` lines in the same block as `unpackedLines`. Targeted `status <slug>` is unchanged — the brief's criterion 4 names `akrogon status` and the per-repo line carries the repo name itself.
- **D9 No `env`/credential needs.** `akrogon status slow-merge-notice` `Missing:` lines: checked below; `env_names` is empty and herdr needs no credential (proof in `readiness.yaml`).

## Interfaces

- `src/verify.ts`: `slow` field on `verifyRunSchema`; private `slowEligible(run)`, `median(values)`, `decideSlow(runs, index, boot): {slow, print?, send?}`; `sendMergeSlowNotice`; exported `readVerifyRuns` reused by status; extracted `rewriteRun` + `noticeSend`.
- `src/status.ts`: `scanRepo` carries the repo's latest `slow` row; `statusCommand` prints `Slow merge:` lines in the `unpackedLines` block.
- `tests/slow-merge.test.ts` (new): helpers `mergeSetup` (direct worktree + holder), `mergeVerify(f, direct, holder, extraArgs)`, `seedMerge(f, {ms, slow?})`, `backdate(f, ms)` (polls `issues/verify-runs.jsonl` for the appended open merge row — `scope:'merge'`, no `end` — and rewrites its `start` to `end-of-pass − ms` before the pass's final rewrite preserves it), `noticeCalls`/`noticeEnv` copied from `tests/verify.test.ts`.

## Units and waves

| Wave | Unit | Owns | Shared test resource | Must land first |
| --- | --- | --- | --- | --- |
| 1 | U1 mechanism | `src/verify.ts`, `src/status.ts` | committed `tests/slow-merge.test.ts` | — |
| 1 | U2 docs | `src/AREA.md` (verify sentence), `docs/reference/checks.md` (slow comparison + `verify slow:`), `docs/reference/files.md` (`verify-runs.jsonl` row), `docs/reference/commands.md` (status line), `tests/AREA.md` (new test file line) | none | — |

Wave 1 holds 2 units (disjoint owned paths, no ordering) — A implements per implement-issue's wave rule; tests land at plan.synthesis before any product code.

Docs affected (one line each): `src/AREA.md` — extend the `src/verify.ts` sentence with the slow comparison, `slow` receipt field and `merge slow` notice; `docs/reference/checks.md` — a merge-scope completed run compares its wall time to the eligible-run normal, flags at >1.5× and ≥2 min, prints `verify slow:`, notifies once per episode; `docs/reference/files.md` — the `verify-runs.jsonl` row gains the `slow` comparison record; `docs/reference/commands.md` — `akrogon status` shows `Slow merge:` while an episode is open; `tests/AREA.md` — `tests/slow-merge.test.ts` checks the merge-slow comparison, episode lifecycle, notice and status line. No skill file or README affected.

## Criterion proofs

All proofs run through `akrogon run-check --name <label> -- bun test tests/slow-merge.test.ts [-t <name>]`; sizes minutes; rerun trigger: any change to `src/verify.ts`, `src/status.ts` or the test file.

### C1 (brief 1) — flagged run: line, receipt, notice, unchanged verdict

Test `T1 'a slow merge run is flagged, recorded, printed and notified once'`: config `{unit: 'echo unit'}`; seed 4 eligible merge rows at 5m (300000ms); run A (`--holder`) is never compared — only 4 eligible earlier rows, `slow` absent, no line, no notice; run B (new commit, backdate 600000) — stdout holds `verify slow: <ms>m measured vs 5m normal; first seen at checkout <B.run>`; `B.slow` = `{ms≥600000, normal_ms:300000, first:{run:B.run, leaf:'checkout'}}`; `noticeCalls` = `[['notification','show','repo merge slow',...]]`; `B.slow.notice === 'shown'`; `result.code === 0` and `requireGreenReceipt(repo, sha, 'merge')` resolves. (Test corrected at implement: run A carries no `slow` at all, proving the ≥5 gate directly.)
Conditions traced per decision: C1's "exit code/requireGreenReceipt unchanged" reaches every exit path via D7 (`reportRun` consumes the record the pass already produced; the slow field is extra, `green` is computed from setup/commands only); "at least 5 eligible" proven by run A staying silent at 4 (D3 count gate); "more than 1.5× and ≥2m" is the flag formula tested at 600000 vs 300000. Red: no `slow` field, no line, no call on current code.

### C2 (brief 2) — eligibility and checked boundaries

Test `T2 'only eligible rows enter the normal and checked bounds follow the design'`: seed 4 eligible (4m–7m: 240000,300000,360000,420000) plus 4 ineligible kinds — `reused` entry, `blocked` entry, `setup: 9`, `scope: 'leaf'` — at 5500ms; run 1 (backdate 1000) silent (only 4 eligible earlier); run 2 (backdate 1000) gets `slow.normal_ms === 300000` (median of the 4 eligible seeds + run 1's 1000ms; any ineligible kind leaking gives 5500 or ~270000) and no flag; a seeded `compares` row and a real `--known-red` base run carry no `slow` ever; T3's `reused`-entry run is still checked (flagged inside the episode).
Conditions: "compares neither checked nor counted" — the seeded `compares` row is ineligible (asserts `normal_ms` unchanged) and the live `--known-red` pair asserts the base row exits with no `slow`; "leaf-scope never checked" — the leaf seed is outside both predicates; "fewer than 5 ⇒ silent" — run 1; "partial head still checked" — T3's reused-entry run. Red: no `slow` written on current code.

### C3 (brief 3) — episode lifecycle and single notification

Test `T3 'an open episode pins the normal, cites its first run, notifies once and recovers'`: seed 4 eligible pre-episode rows at 300000, episode opener O (`slow:{ms:600000, normal_ms:300000, first:{run:O.run, leaf:'firstleaf'}, notice:'shown'}`), 10 eligible rows at 3000 (rolling median 3000 — a rolling read would store `normal_ms 3000`, the episode read stores 300000) and a green merge run G on the test tree; run A backdate 600000 on the same tree reuses `unit` from G (`reused` entry: checked, never eligible) → `slow.first.run === O.run`, `slow.normal_ms === 300000`, no close, `noticeCalls` stays 0; run B (new commit, no backdate) is eligible and under threshold → `slow.close === 'recovered'`, `first.run === O.run`; run C (new commit) is evaluated fresh — `slow` has no `first`.
Test `T4 'a failed slow notice is retried by the next in-episode run and a stale pending is resent'`: seed O with `slow.notice:'error'`; `failNotificationOnce` armed → run A flagged in-episode sends, `slow.notice === 'error'`, stderr `notice: `; run B flagged in-episode → second `repo merge slow` call, `B.slow.notice === 'shown'`; seeded O with `slow.notice:'pending'` on a dead `boot_id` → next checked run sends.
Test `T6 'the last 20 eligible runs inside the episode close it accepted'`: seed 1 eligible pre-episode row + episode `ep1` + 19 more in-episode eligible rows (all `slow.first.run === 'ep1'`, walls 300000ms); current run backdate 600000 → `slow.close === 'accepted'`, stdout `verify slow: ... accepted as new normal`.
Conditions: "compares with pre-jump normal" — D3's episode branch, proven by the 3s rolling seeds; "no second notification" — reservation requires no delivered/covered earlier row (D6); "retried by the next run" — D6 scan over earlier in-episode rows; "recovered needs eligible + under threshold" — run D eligible by construction; "accepted needs all 20 inside" — D4 ordering, recovered first. Red: no `slow`/`close`/line/calls on current code.

### C4 (brief 4) — status line while open only

Test `T7 'status prints Slow merge only while that repo's episode is open'`: seed one open episode (`slow.first`, no `close`) on `repo`, register a second fixture `other` without one; `akrogon status` from outside any repo prints exactly one `Slow merge: repo first seen at <leaf> <run>, last 10m vs normal 5m`; append a `slow.close:'recovered'` row → the line is gone.
Conditions: "latest episode open" is the last-`slow`-row rule (D4/D8) — a closed last row prints nothing, an absent `slow` prints nothing; per-repo scoping asserted by the second repo. Red: no `Slow merge:` line exists on current code.

## Proof commands recorded

| Criterion | Command (via `akrogon run-check --name slow-merge --`) | Red at planning (check `slow-merge`: 1 `implementation/check-slow-merge-1793192908071-1145760.log`) |
| --- | --- | --- |
| C1 | `bun test --timeout=30000 tests/slow-merge.test.ts` | `a.slow` is undefined → `Matcher error: received value must be a non-null object` at the `normal_ms` assertion (line, receipt field and notice all absent) |
| C2 | same file run | `second.slow` undefined → same matcher error; the seeded/run boundary legs hold (exit 0, ledger unchanged) |
| C3 (episode, retry, accepted) | same file run | `ZodError: Unrecognized key: "slow"` from `seedRun`'s `verifyRunSchema.parse` — the `slow` field does not exist yet |
| C4 | same file run | `ZodError: Unrecognized key: "slow"` seeding the open episode |

All 6 tests ran through the real `verify --holder`/`status` commands (the `code === 0` asserts and the mid-pass backdate already pass); only the missing `slow` behavior is red. Red shown once per file per `run-check` log; `-t` filters were skipped in favour of one `slow-merge` label covering all criteria.

No credentials needed: `akrogon status slow-merge-notice` shows no `Missing:` lines (env_names empty; the herdr proof is recorded in `readiness.yaml`, herdr 0.9.1, and the fake covers both send seams). No new proof machinery: `bun test`, `fixture`, `cli`, `seedRun`, `fakeHerdr`, `spawnFiles` all exist at AKROGON_BASE; the mid-pass `start` backdate uses the real ledger the pass itself writes.

## Implementation notes

(planned constraints and deviations found at planning)

- The mid-pass `start` backdate is the only way to reach a flagged run quickly: flagging needs `ms ≥ normal + 120s` while a real fixture pass is seconds; seeding a tiny normal makes a ≥121s command unaffordable under the 30s test budget. The pass preserves `runs[index].start` through its locked rewrite, so the recorded wall time is the pass's own ledger value — a test-visible seam on the real boundary, not a product seam.
- `docs/reference/{checks,commands,files}.md` are added to Owned beyond the design's listed surfaces: they document the exact `verify`/status/receipt surfaces this leaf changes, and tests/`docs-links` will flag stale claims. `tests/AREA.md` gets one line for the new file.
- 2026-10-28 check.repair F1: include the completed current eligible row in the acceptance window, as brief criterion 3 and design Q2 require; this corrects D4's exclusion while retaining recovery precedence.
