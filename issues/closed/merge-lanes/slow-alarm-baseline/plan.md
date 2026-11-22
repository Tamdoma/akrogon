# Plan: slow-alarm-baseline

Slot A, plan.synthesis. Source: brief.md + design.md (forks/extras.md Taken 2 copied verbatim). Live surface: `src/verify.ts` `decideSlow`, `foldShown`, `runOnce` locked rewrite, `verifyRunSchema.slow`; `src/notice.ts`; `src/status.ts` slow scan; `tests/slow-merge.test.ts`.

## Decisions

- D1 Carried normal. With no open episode the normal is `latest.slow.normal_ms` (the latest earlier row holding `slow`), lowered to the rolling last-20-eligible median when that median is lower. With no stored `slow` row the rule is today's: median once 5 eligible rows exist, no `slow` record below 5. With a stored row and fewer than 5 eligible earlier rows the carried normal stands alone (no median available). The stored `slow.normal_ms` on each checked row is the normal just used, which is what carries it forward.
- D2 Episode-median recovered close. An open episode pins `open.normal_ms`. `recovered` is evaluated first (same order as base): it needs `me` eligible, `me` not flagged, and the median of the episode's own last 20 eligible runs — `[...earlier, me]` filtered to eligible rows whose `slow.first.run === open.first.run`, last 20, `me` included — at least 5 rows and under the threshold. "Under the threshold" is the existing flagged formula `!(m > 1.5 * normal && m - normal >= 120000)` evaluated on the median against the pinned normal, so the two literal bounds are decided once.
- D3 Accepted close and its notice. `accepted` needs the base rule unchanged — the last-20-eligible window full and every member inside the episode (`run.slow?.first?.run === open.first.run` or `run === me`) — plus `Date.parse(me.end) - Date.parse(firstRow.end) >= 14 * 86400000`, where `firstRow` is the earlier row whose `run === open.first.run`. If `firstRow` is not in the ledger the episode cannot close `accepted` (traced: the opener row always precedes `latest` in ledger order, so this can only fail on a truncated ledger; no close is the safe side). The closing row keeps `normal_ms` at the old normal.
- D4 Accepted notice send state. The send state lives on the accepted closing row only, as a new optional `slow.accepted_notice` (`'pending' | 'shown' | 'error'` — same value rule as `slow.notice`, so no key is needed on retry rows). In the same locked rewrite, after `decideSlow`, the caller finds the latest row whose `slow.close === 'accepted'` (the fresh closing row included) and, when `noticeCovers(row.slow.accepted_notice, folder, id)` is false, sends via `recordNotice` and writes `accepted_notice` onto that row in place. `undefined` counts as uncovered, so a pre-change accepted row retro-sends once. `foldShown` gains the parallel fold for `accepted_notice` keyed on `run.slow.first.run`; the retry touches only `accepted_notice`, never `first`, so `src/status.ts` cannot reopen.
- D5 Notice id and body. `noticeId(repo, 'merge-slow-accepted', first.run)` = `<repo>.merge-slow-accepted.<run>`, distinct from the episode's `<repo>.merge-slow.<run>`. Title `<repo> merge slow accepted`; body names the old and new normal in minutes plus the `first seen at` text. One send per episode, `error` retried by the next checked run through D4.
- D6 Run after an accepted close. Recompute, no stored field: in `decideSlow`, when `latest.slow.close === 'accepted'`, the normal is the current rolling last-20-eligible median — identical to the closing window's median at that step, and the stored `slow.normal_ms` on the closing row stays the old normal as locked. If fewer than 5 eligible rows remain (unreachable without ledger truncation), the carried old normal stands.
- D7 Both closes reachable. When `me` satisfies `recovered` and `accepted` together (aged episode whose median is back under), `recovered` wins — D2's evaluation order, matching base order and the design's intent that `accepted` marks a sustained higher level.
- D8 Schema. `slow` gains only `accepted_notice`, optional: old ledgers parse unchanged; a ledger holding the new key does not parse under an older akrogon, same consequence `docs/reference/files.md` states for `failures` — carried as one clause in the rewritten `src/AREA.md` verify line.

## Read-first

- `src/verify.ts` — `verifyRunSchema.slow` (line 81), `slowChecked`/`slowEligible`/`median` (166-186), `noticeCovers` (245), `foldShown` (263), `decideSlow` (353), the locked rewrite in `runOnce` (591-617).
- `src/notice.ts` — `noticeId`, `noticeState`, `writeNotice`, `noticeCovers` semantics.
- `tests/slow-merge.test.ts` — `seedMerge`, `seedEpisode`, `backdate`, `mergeCaller`, `setEpisodeNotice`, `records`; the four existing cases to revise (below).
- `tests/helpers.ts` — `fixture`, `cli`, `seedRun`, `register`.
- `tests/hc-fixture.ts` — `hcCore`, `noticeFiles`, `noticeFolder`, `blockNotices`, `coreEnv`.
- `src/status.ts` — slow scan lines 118-129, 684-709, 898-910 (read only; unchanged).
- `docs/reference/checks.md` slow paragraph (line 81); `src/AREA.md` verify line (17); `docs/reference/files.md` verify-runs entry (71).

## Interfaces

- `slow.accepted_notice?: string` on the accepted closing row (D4). `slow` stays `z.strictObject` — additive optional key only.
- `SlowDecision` unchanged; the accepted send is a ledger pass in the caller, not a `decideSlow` output, because it targets an earlier row, not `runs[index]`.
- Notice id/body per D5. `first` and `close` fields unchanged.

## Units and waves

All planned tests land in `tests/slow-merge.test.ts` in this pass, committed before product code.

Wave 1 (2 units, disjoint paths, no shared test resource):

- U1 `alarm-rule`: `src/verify.ts` (schema, `decideSlow`, `foldShown`, locked rewrite) and the existing-case revisions in `tests/slow-merge.test.ts` — every product file, one shared fixture file.
- U2 `docs`: `docs/reference/checks.md` slow section, `src/AREA.md` verify line.

U2 depends on nothing U1 produces (rule text is locked in the design). Implementation order inside the wave does not matter.

Existing cases the new rule contradicts (revised in U1's test commits, `Test-Change` trailer citing the criterion): `an open episode pins the normal, cites its first run, notifies once and recovers` (recovery now needs a 5-run episode median under the threshold — seed three extra in-episode rows so the median holds), `the last 20 eligible runs inside the episode close it accepted`, `the twentieth eligible episode run closes accepted`, `an unflagged run whose full check was blocked still closes the episode accepted` (all three need the opener aged >= 14 days via the `end` parameter this pass adds to `seedEpisode`).

## Criteria and proof

All test proofs run the configured runner's flags plus `-t`: `bun test --timeout=30000 --parallel=4 --no-isolate -t '<pattern>' tests/slow-merge.test.ts` through `akrogon run-check --name <label> --`. Size: seconds-to-minutes each (fixture repos plus, where notices are asserted, one fixture hc core). Rerun trigger: any change to `decideSlow`, the `slow` schema, `foldShown`, the locked rewrite, or this test file. No model or outside stage; nothing to record or replay. Restart boundaries: none (not a slow-run leaf; each proof is one self-contained test).

### C1 (criterion 1, proven bug — red on base)

- Test T1 `the carried normal opens an episode where the rolling median stays silent` (`-t 'carried normal'`). Ledger: 20 eligible rows at 300000ms stamped `normal_ms:300000`, then 11 eligible steps at 449000ms (each under 1.5x the rolling median at its step; rolling median lands 449000), then a live run backdated to 600000ms: 600000 > 1.5x300000 and +300000 >= 120000 over the carried normal, while 600000 < 1.5x449000 silences today's code.
- Observation: the real run's `slow.first.run === its own run` with `normal_ms 300000` and `verify slow:` printed; no earlier step row carries `first`.
- Deliberate break: not needed — red on base (the bug). Red output recorded below.
- Conditions checked: baseline is the carried normal, not the rolling median (D1 — case T1); the rising median never lets the normal drift up (D1 — T1 asserts exactly one `first` in the ledger).

### C2 (criterion 2)

- Test T2 `the carried normal ratchets down to a lower rolling median` (`-t 'ratchets down'`). Ledger: 20 eligible rows at 300000 stamped `normal_ms:300000`, then 11 eligible rows at 200000 stamped `normal_ms:300000` (last-20 median 200000 < carried 300000); live run at 10000. Assert `slow.normal_ms === 200000`.
- Base is green here (today's code already uses the rolling median) — shown red by deliberate break: `Math.min` replaced by `Math.max` in the new-code form; on the base the equivalent is `normal = median + 100000`. Red output recorded below.

### C3 (criterion 3)

- Test T3a `an episode does not recover while its own eligible median is over` (`-t 'does not recover'`). Ledger: aged-not-needed open episode (opener 600000, `shown`), 5 stamped in-episode rows at 500000, live run 3000 eligible and unflagged. Episode window = 7 rows, median 500000 > 450000 → no close; assert `close` undefined and `first` still the episode.
- Red on base: today's code closes `recovered` on the one unflagged run. Red output recorded below.
- Test T3b `an episode recovers once its own eligible median is back under` (`-t 'recovers once'`). Ledger: 6 pre-episode eligible rows at 900000, opener 600000, stamped in-episode rows 2x600000 + 2x3000, live run 3000. Episode window = 6 incl. `me`: median 450000, `!(450000 > 450000 && ...)` → under → `close: 'recovered'`. `me` in the median is what tips it: without `me` the median is 600000.
- Base is green (it recovers regardless) — shown red by deliberate break on the decision's violation: median computed over all eligible runs (pre-episode rows included, median 600000 over) → no close. Red output recorded below.
- Conditions checked: episode-only membership (D2 — T3b's pre rows and break); `me` included (D2 — T3b discriminates); at-least-5 bound (D2 — traced: an episode shorter than 5 eligible runs can only reach `recovered` through the same path T3a's no-close asserts, and the existing `recovers` case exercises the positive path once revised); `me` must be eligible and unflagged (unchanged condition — guarded by the existing blocked-entry test which stays).

### C4 (criterion 4)

- Test T4a `an episode under 14 days old does not close accepted` (`-t 'under 14 days'`). Ledger: opener aged 13 days, 19 stamped in-episode rows at 500000, live flagged run 500000 (episode count 21, window all inside). Assert `close` undefined, no `accepted_notice`, no notice file.
- Red on base: base closes `accepted` with no age check. Red output recorded below.
- Test T4b `an accepted close sends its notice and the next run takes the window median` (`-t 'accepted close sends'`). Ledger: opener aged 15 days, 18 stamped rows at 500000, live run 500000 eligible+flagged (episode count 20, all inside). Assert `close: 'accepted'`, `normal_ms: 300000` (old normal kept), `accepted_notice: 'pending'`, one file `<repo>.merge-slow-accepted.<opener>` titled `<repo> merge slow accepted` whose body names 5m and 8m, stdout `accepted as new normal`. Then a live run at 300000: `slow.normal_ms === 500000` and no `first`.
- Red on base: no `accepted_notice` field, no file. The run-after-median half is green on base (rolling median equals it) — shown red by deliberate break: drop the D6 reset so the pinned 300000 persists. Red output recorded below.
- Test T4c `a failed accepted notice is retried by the next checked run` (`-t 'retried by the next'`). `hcCore` + `blockNotices` across the accepted close (same ledger as T4b): closing row gets `accepted_notice: 'error'`; unblock, next checked run retries in place → closing row `accepted_notice: 'pending'`, exactly one accepted notice file; a third run leaves it covered (file count stays 1); `akrogon status` prints no `Slow merge:` line (the in-place rewrite never reopens).
- Red on base: no accepted-notice machinery. Red output recorded below.
- Test T4d `an aged episode does not close accepted while a pre-episode run sits in the last 20` (`-t 'pre-episode run'`). Ledger: 1 plain pre row 300000, opener aged 15 days, 17 stamped rows, live run 500000 — exactly 20 eligible, the window holding one outsider, episode count 19. Assert `close` undefined.
- Base is green (base's inside-window check already refuses) — shown red by deliberate break: drop the `window.every(...)` clause so `window.length === 20` alone closes. Red output recorded below.
- Conditions checked: age >= 14d from first-flagged `end` to `me.end`, both from the ledger (D3 — T4a at 13d, T4b at 15d; the 14d boundary is a decided literal, flagged-formula class); window membership (D3 — T4d); notice send once with own id naming old and new (D5 — T4b file asserts); retry only on failure, next checked run, in place (D4 — T4c); run-after normal (D6 — T4b); closing row keeps old normal (D3 — T4b `normal_ms`); no reopen of `src/status.ts` (D4 — T4c status assert).

### C5 (criterion 5)

- Test T5a `a ledger with no stored normal starts as today` (`-t 'no stored normal'`). Ledger: 4 eligible rows at 300000, live run → `slow` undefined; bump, second live run (5th eligible) → `slow` defined with `normal_ms 300000`. The ledger's old-shape rows parse through `records()`' schema parse.
- Base is green — shown red by deliberate break: `< 5` becomes `< 6`. Red output recorded below.
- Test T5b `a stored normal applies before five eligible rows` (`-t 'stored normal applies'`). Ledger: 3 eligible rows stamped `normal_ms:250000`, live run 500000 → flagged against the carried 250000 (`first` defined, `normal_ms 250000`).
- Red on base: no `slow` record below 5 eligible. Red output recorded below.

### C6 (criterion 6)

- No command proof: the reviewing seat reads `docs/reference/checks.md` slow section and `src/AREA.md` verify line against Taken 2 as copied in the design. U2 owns the rewrite; the lines must state the carried normal, the lower-median ratchet, the pinned-episode normal, the episode-median `recovered` (>= 5), the 14-day plus all-inside `accepted`, the accepted notice and its retry, the run-after median, and the strict-key parse consequence.

## Docs checklist

- `docs/reference/checks.md` — slow paragraph rewritten (U2).
- `src/AREA.md` — verify line slow clause rewritten (U2).
- `docs/reference/files.md` — no change: the verify-runs entry describes `slow` presence, not its keys.
- `tests/AREA.md` — no change: the `slow-merge.test.ts` line already covers the episode lifecycle.
- `src/status.ts`, `tests/status*.test.ts` — unchanged (D4 keeps the open-episode shape).

## Notes

- No credentials or grants: `readiness.yaml` empty, `akrogon status` shows no `Missing:` lines, all tests run local fixtures.
- No reusable lesson written this pass; `learnings/LESSONS.md` read, nothing new to record.
- Held disagreement (C's green-only eligibility and 14-day drift check) is unanswered by the operator — eligibility stays unchanged per the locked design.
- Brief/design conflicts: none found; the brief's "the run after it takes that window's median as the normal" and the design's "the closing row stores the old normal" reconcile under D6 (recompute, closing row keeps old normal).

## Red records

All under `implementation/` in this leaf folder; `akrogon log <path>` reads back.

- T1 `carried normal` — base RED at line 524 (`normal_ms 449000`, no `first`): the creeping ledger silences the alarm as the brief describes. `check slow-t1-carried-final: 1 .../check-slow-t1-carried-final-1795295185741-398024.log`
- T2 `ratchets down` — base GREEN. `check slow-t2-ratchet: 0 .../check-slow-t2-ratchet-1795295128019-372276.log`. Break `normal = median + 100000` RED at line 551 (`normal_ms 300000`). `check slow-t2-ratchet-break: 1 .../check-slow-t2-ratchet-break-1795295131214-375036.log`
- T3a `does not recover` — base RED at line 578 (`close: "recovered"` on the one under-threshold run). `check slow-t3-no-recover: 1 .../check-slow-t3-no-recover-1795295134134-376582.log`
- T3b `recovers once` — base GREEN. `check slow-t3-recovers: 0 .../check-slow-t3-recovers-1795295136460-377663.log`. Break `recovered` gated on the all-eligible median (pre-episode rows included) RED at line 607 (no `close`). `check slow-t3-recovers-break: 1 .../check-slow-t3-recovers-break-1795295139929-380108.log`
- T4a `under 14 days` — base RED at line 634 (`close: "accepted"` at 13 days). `check slow-t4-young: 1 .../check-slow-t4-young-1795295143714-381914.log`
- T4b `accepted close sends` — base RED at line 668 (`accepted_notice` `undefined`, no machinery). `check slow-t4-accepted: 1 .../check-slow-t4-accepted-1795295145393-383891.log`. Step-up break (`normal` pinned to `latest.normal_ms`, D6 dropped) RED at line 684 (`normal_ms 300000` where the criterion needs `500000`), run with the accepted-notice asserts temporarily neutralized to reach line 684. `check slow-t4-stepup-break2: 1 .../check-slow-t4-stepup-break2-1795295160783-389969.log`
- T4c `retried by the next` — base RED at line 710 (`accepted_notice` `undefined`). `check slow-t4-retry: 1 .../check-slow-t4-retry-1795295167096-391144.log`
- T4d `pre-episode run` — base GREEN. `check slow-t4-outsider: 0 .../check-slow-t4-outsider-1795295169085-392204.log`. Break `window.every(...)` dropped RED at line 755 (`close: "accepted"`). `check slow-t4-outsider-break: 1 .../check-slow-t4-outsider-break-1795295171808-393278.log`
- T5a `no stored normal` — base GREEN. `check slow-t5-cold: 0 .../check-slow-t5-cold-1795295174484-394139.log`. Break `< 5` to `< 6` RED at line 780 (`slow` null object). `check slow-t5-cold-break: 1 .../check-slow-t5-cold-break-1795295177387-395229.log`
- T5b `stored normal applies` — base RED at line 803 (`slow` undefined: no record below 5 eligible). `check slow-t5-stored: 1 .../check-slow-t5-stored-1795295180286-396248.log`

All temporary breaks reverted before the test commit; `git diff src/verify.ts` empty, typecheck and prettier clean. Tests committed aa2da066 ahead of any product change. One test-defect fix during the pass: exact `ms` equality replaced by `toBeGreaterThanOrEqual` (recorded ms includes jitter).

## Implementation notes

- 2026-11-21: Criterion 4 and design Taken 2(a) require the next checked run to use the accepting window's median. Finalize checked merge rows in locked decision order so an overlapping run cannot enter an already decided window. D6 still recomputes the median from the ledger.
