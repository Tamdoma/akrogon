# Brief U1: alarm-rule (wave 1)

## 1. Goal

Implement the new merge slow-alarm rule in `src/verify.ts` and revise the existing `tests/slow-merge.test.ts` cases the new rule contradicts. Plan decisions D1-D8.

## 2. Acceptance criteria

The nine planned tests already committed at the worktree's HEAD must pass, with no test edit beyond the named revisions below:

- `the carried normal opens an episode where the rolling median stays silent`
- `the carried normal ratchets down to a lower rolling median`
- `an episode does not recover while its own eligible median is over`
- `an episode recovers once its own eligible median is back under`
- `an episode under 14 days old does not close accepted`
- `an accepted close sends its notice and the next run takes the window median`
- `a failed accepted notice is retried by the next checked run`
- `an aged episode does not close accepted while a pre-episode run sits in the last 20`
- `a ledger with no stored normal starts as today`, `a stored normal applies before five eligible rows`

Revised existing cases (their asserts keep meaning under the new rule):

- `an open episode pins the normal, cites its first run, notifies once and recovers`: recovery now needs a 5-run episode median under the threshold. Before the recovery live run, seed three extra in-episode rows (`seedInEpisode(f, episode, 3000)` helper exists at HEAD) so the episode window is opener + that test's one in-episode run + 3 = 5 with a median under the threshold. Keep every other expectation.
- `the last 20 eligible runs inside the episode close it accepted`, `the twentieth eligible episode run closes accepted`, `an unflagged run whose full check was blocked still closes the episode accepted`: age the opener 15 days via `seedEpisode(f, <pre>, { end: new Date(Date.now() - 15 * DAYS).toISOString() })` (`DAYS` exists at HEAD). Keep every other expectation.

You write and edit no new test and change no other expectation; a planned test that stays red or looks wrong is a mismatch, never a test fix.

## 3. Read-first

- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md` (required)
- `src/verify.ts`: `verifyRunSchema.slow` (~line 81), `slowChecked`/`slowEligible`/`median` (~166-186), `noticeCovers` (~245), `foldShown` (~263), `decideSlow` (~353), the locked rewrite inside `runOnce` (~591-617).
- `src/notice.ts` whole file (noticeId, noticeState, writeNotice, noticeCovers semantics).
- `tests/slow-merge.test.ts` top helpers (`seedMerge`, `seedEpisode`, `seedInEpisode`, `backdate`, `mergeCaller`, `records`) and the four existing cases named above.

## 4. Change list and needed interfaces

Worktree commit: `a75e77ba`. Owned paths: `src/verify.ts`, `tests/slow-merge.test.ts`. No shared test resource (fixture-only tests). No prerequisite units (wave 1).

In `src/verify.ts`, all inside existing functions, minimal diff:

1. Schema: add `accepted_notice: z.string().optional()` to the `slow` strictObject, after `notice`.
2. `decideSlow`, no-open-episode normal (D1, D5b, D6): `latest` is the last earlier row with `slow`. When `latest` exists and `latest.slow.close === 'accepted'`, normal = the rolling last-20-eligible median (`earlier.filter(slowEligible).slice(-20)`); return `undefined` when fewer than 5 eligible. Otherwise, when `latest` exists, normal = `Math.min(latest.slow.normal_ms, rolling median)` with fewer-than-5-eligible meaning no median exists and `latest.slow.normal_ms` alone. No `latest` at all keeps today's behavior exactly.
3. `decideSlow`, close logic (D2, D3, D7): `recovered` evaluated first, unchanged order — needs `!flagged`, `me` eligible, and the episode window `[...earlier, me]` filtered to eligible rows with `run.slow?.first?.run === open.first!.run` (plus `me` itself), last 20, `length >= 5`, whose median wall time is not flagged-shaped: `!(m > 1.5 * normal && m - normal >= 120000)`. `accepted` keeps today's window check (`window.length === 20 && window.every(...)`) AND adds `Date.parse(me.end!) - Date.parse(firstRow.end!) >= 14 * 24 * 60 * 60 * 1000`, where `firstRow` is the earlier row with `run === open.first!.run`; when `firstRow` is absent, no accepted close. Use `else if` (recovered wins ties).
4. `foldShown` (D4): add the parallel fold — a row with `run.slow?.accepted_notice === 'pending'` and a shown file state becomes `{ slow: { ...run.slow, accepted_notice: 'shown' } }`, the id computed as `noticeId(run.repo, 'merge-slow-accepted', run.slow.first!.run)`. The existing `first!.run` read pattern already guards by the `?.notice === 'pending'` check; a row only ever carries `accepted_notice` when it also carries `first`, but keep the same optional-chain style.
5. The locked rewrite in `runOnce` (D4, D5): after the existing `decideSlow` block, find `latestAccepted` = last row in `runs` with `run.slow?.close === 'accepted'`. When it exists and `noticeCovers(row.slow.accepted_notice, notices.folder, id)` is false (`undefined` never covers), send `recordNotice(notices, noticeId(repo.name, 'merge-slow-accepted', row.slow.first!.run), { title: '${repo.name} merge slow accepted', body, attention: false })` and write `accepted_notice` onto that row in place — it may be an earlier row, not `runs[index]`; update it in the `runs` array before `writeFileSync`. The body names old and new normal in minutes plus first-seen: `'merge slow accepted: ' + minutes(newNormal) + 'm is the new normal (was ' + minutes(row.slow.normal_ms) + 'm); first seen at ' + row.slow.first!.leaf + ' ' + row.slow.first!.run`, where `newNormal` is the median wall time of the episode's last-20 eligible in-episode window ending at that row — rows up to and including it filtered to eligible with `slow.first?.run === row.slow.first!.run` (the closing row included), last 20. Compute it inside `decideSlow` or a small pure helper beside it and carry it out of the decision (e.g. a `sendAccepted` field holding `{ row-run-id, body }` or the body string); do not recompute it in the caller with a second shape. Exact wording is yours except it must contain both minute values and `first seen at`.

The test file revision (only the four cases named in section 2): `git log -1` the commit you produce must carry the trailer `Test-Change: tests/slow-merge.test.ts <source and reason>` as one line in the final trailer block, citing brief criterion 3 (episode median) for the recovery case and criterion 4 (14-day accepted) for the three accepted cases.

Do not touch `src/status.ts`, `src/notice.ts`, `src/AREA.md`, any doc.

## 5. Do-not, reasons and exceptions

- No new tests, no test deletions, no edits beyond the named revisions: tests are locked after planning; a wrong or red planned test is a mismatch to A, not a worker edit. Exception: only the four named revisions.
- No `git stash` anywhere: every worktree of a repo shares one stash. To set work aside commit a WIP commit, and before returning `git reset --soft <creation commit a75e77ba>` then make the unit's single returned commit.
- No edits outside `src/verify.ts` and `tests/slow-merge.test.ts`: other paths belong to unit U2 or are out of scope.
- Do not change `slow.notice` semantics or `noticeId(..., 'merge-slow', ...)` ids: the open-episode notice contract is locked and covered by the pending-covers test.
- Do not refactor `decideSlow` beyond the decisions: smallest diff wins; a cleaner-but-larger change is out of scope. Exception: a revised brief from A authorizing it.
- Return a mismatch with evidence instead of changing scope or an interface; the exception is a revised brief from A.

## 6. Ordered steps

1. `bun install --frozen-lockfile --backend=copyfile` in the worktree.
2. Read the listed code. Implement the `src/verify.ts` changes (criteria: all section-2 tests).
3. Revise the four named existing cases.
4. Run the targeted command in section 7; all 18 tests in the file pass (9 new + 9 revised/unchanged).
5. `bun run typecheck` and `bunx prettier --check src/verify.ts tests/slow-merge.test.ts` clean (run prettier `--write` on your touched files if needed).
6. Commit everything as ONE commit whose final trailer block carries the `Test-Change:` trailer naming `tests/slow-merge.test.ts` with sources (brief criterion 3 and criterion 4).

Advisory size: 2 files, under 40 turns.

## 7. Commands

Targeted (run under `akrogon run-check --name <label> -- ...`):

- `akrogon run-check --name u1-slow-merge -- bun test --timeout=30000 --parallel=4 --no-isolate tests/slow-merge.test.ts`
- `akrogon run-check --name u1-typecheck -- bun run typecheck`
- `akrogon run-check --name u1-format -- bunx prettier --check src/verify.ts tests/slow-merge.test.ts`

Never `akrogon verify`, never the whole suite, never a `merge_checks` command.

## 8. Done-when, evidence and report

All nine new tests and all existing tests in the file pass on your commit; typecheck and prettier clean; one commit with the `Test-Change:` trailer; return its commit id.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
