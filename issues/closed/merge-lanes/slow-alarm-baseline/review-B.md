# Slot B review

- Phase `check.review`
- Base `4f5e3fd2ae13439c7fd8d8507c18ec524c0f9444`
- Reviewed head `2983cb0bac17d5aaaa33a7b06bc33cb0996b97d1`
- Verdict `fix`

## Fixes

### F1. A delivered accepted notice can be sent again

An ordinary `akrogon verify` from an implementing leaf worktree runs with scope `leaf` and a null notice folder. The accepted-notice block runs anyway. `foldShown` leaves the accepted row pending, `noticeCovers` treats pending as uncovered with a null folder, and `recordNotice` replaces it with `error` (`src/verify.ts:236`, `:257`, `:283`, `:633`, `:680`, `:942`). The next merge verify sends again even after Herdr displayed the notice and removed its file. Herdr does that in normal use (`/home/ivan/Work/infra/herdr-setup/mods/session-status/notices.js:24`, `:32`). The CLI reproduction delivered the notice, removed the file as the consumer does, ran an unrelated leaf verify, then ran a merge verify. It observed `afterLeaf=error`, the leaf diagnostic `no notice folder resolved for this run`, and one duplicate file. Criterion 4 requires one notice and retries failed sends on checked runs.

The same Herdr consumer can remove the file after `foldShown` sees it and before `noticeCovers` looks a second time. The second lookup then treats the delivered notice as uncovered and sends it again. This path is traced from the consumer's removal and the two reads. The leaf-scope path is reproduced in `implementation/check-review-b-accepted-boundaries-1795296860893-4182168.log`.

### F2. An overlapping verify changes the baseline after an accepted close

Verify appends receipts on start and evaluates only earlier append positions. If an earlier run is still unfinished when a later one closes accepted, the earlier run can become eligible afterward and displace a member of the closing window before the next baseline is computed (`src/verify.ts:397`, `:407`, `:410`, `:427`, `:541`, `:642`). This order occurs in framework's real ledger. Its eligible merge receipts `30d44c7a-758f-4712-a504-6cc00927b932` and `e3b15367-b3d4-4b57-b826-0ad4d746eb5e` overlap on 2026-11-20 and the later-appended receipt ends first (`/home/ivan/Work/infra/tamdoma/framework/issues/verify-runs.jsonl:2942` and `:2943`). Red commands remain eligible when they ran without blocked or reused entries.

In a CLI reproduction, a short run closed an aged episode with an eligible-window median of 600,000 ms and sent the 10-minute notice. An earlier-appended merge run then finished. The ledger had two accepted rows for the episode and a fresh verify after both runs stored 750,113 ms. The next run tests against a higher threshold than the notice announced. Criterion 4 and Taken 2(a) require the median from the window that closed the episode. Evidence is in `implementation/check-review-b-accepted-boundaries-1795296860893-4182168.log`.

### F3. The recovery tests miss both window limits

The C3 tests exercise the direction of the median and episode membership. They do not catch recovery before five eligible episode runs or an older in-episode row influencing a median that must use only the last 20. In a scratch copy I removed both the five-run condition and the recovery window slice. All 18 current slow-merge tests still passed. The required outcomes are independent: an opener and one fast eligible run can already have an under-threshold median with only two samples, and a long episode can have early fast eligible runs that move the all-episode median while the last 20 remain over. Criterion 3 names both limits. The current CLI fixture and runner can prove both. Evidence is in `implementation/check-review-b-recovery-coverage-1795296905139-92526.log`.

### F4. Both docs give the wrong five-run comparison gate

`docs/reference/checks.md:81` says the comparison runs only once five eligible runs exist and `src/AREA.md:17` says it is checked only from five. A ledger with a stored normal can be checked before that point. The existing `a stored normal applies before five eligible rows` CLI case starts with three earlier eligible rows, and the fourth run opens an episode against the stored normal. The unconditional wording tells a reader that run could not have opened the alarm. Criterion 6 requires the rule from Taken 2(a), where five eligible runs is the starting gate for ledgers without a stored normal. The recovery description should also include D2's requirement that the current eligible run is unflagged, since an under-threshold window can include a current run that still flags.

## Verification

- Read the current-head criterion logs `check-c1-carried-1795295846085-1868428.log`, `check-c3-recovered-1795295848353-1869094.log`, `check-c4-accepted-1795295850966-1870678.log` and `check-c5-starts-1795295852830-1873616.log` under `implementation/`. The grouped patterns ran all planned cases on the configured Bun runner after the test changes. The whole-file run `check-slow-merge-file-1795295855551-1874678.log` records 18 passing tests. The plan's T1 base log records 449,000 ms normal and no opener on the creeping ledger, and the current-head T1 passes. The other red records reach the assertions described in the plan, with the T4c removed assertion downstream of its red state check.
- Confirmed green leaf receipt `df9f9cb2-c2d0-4ee2-90bc-f8c25c92234d` on the reviewed tree `730c8bdc19d1f6a37b9c4f7324619de42a81e73f`. Setup, format, typecheck and test all exited 0. The kept test log `implementation/check-test-1795296660694-2813112.log` records 1,273 passing tests. The first attempt's recorder error is documented in the implementation report. `git diff --check` passed.
- Read `docs/reference/checks.md`, `src/AREA.md`, `docs/reference/files.md`, `tests/AREA.md` and the reference index. Every concrete repository path named in the changed `src/AREA.md` exists. `skills/<name>` is an unchanged installation template. The file reference's description of when `slow` is present still holds. The strict-schema compatibility consequence is documented. The status reader still uses the latest `slow` row and its existing `first` and `close` fields. Eligibility and the excluded surfaces are unchanged.
- Readiness has no grants and status has no missing env names. Existing and review-only proof runs use local fixtures. No covered launch or count discrepancy was found when comparing the check logs and timing records.

## Test-Change trailers

The path `tests/slow-merge.test.ts` matches `src/test-files.ts`.

- `a75e77ba` — `Test-Change: tests/slow-merge.test.ts added nine slow-merge cases and a seedEpisode end option; no existing expectation changed`. Verified against the commit diff and the C1–C5 plan. The helper's default preserves the prior setup and the commit adds cases without changing existing assertions.
- `248c6b16` — `Test-Change: tests/slow-merge.test.ts brief criterion 3 episode median (recovery test seeds 3 in-episode rows) and criterion 4 14-day accepted (three accepted cases age the opener 15 days, 'the last 20' asserts the one merge-slow-accepted file, and the planned retry test drops its noticeFiles call that threw ENOTDIR under blockNotices)`. C3 and C4 require the new setup and the accepted file. The fixture replaces the folder with a plain file, making the old directory listing invalid while blocked. The persisted error assertion and the post-unblock file checks still test send failure and retry. Sources match the brief, diff and worker report.

## 2026-11-21 check.repair

Head `45b12662`. Slot A's F1 and slot B's F1 cover the same send path.

- **F1** Reproduction `53f979e7`, fix `fdaa8009`. The latest accepted row is eligible to send only on a checked merge pass. A successful pending send is covered and `foldShown` records consumption, so the sender no longer rechecks the file while Herdr can remove it. The pre-fix run recreated one file after delivery. The repaired run found zero and the row folded to `shown`. The existing C4 retry case still passes. Logs `implementation/check-repair-f1-red-1795297097614-166875.log` (1) and `implementation/check-repair-f1-green-1795297118239-170024.log` (0).
- **F2** Reproduction `7a5afe44`, fix `62bbad84`. The locked rewrite places a late checked completion after the checked receipts that decided before it. This keeps the accepting window fixed for both the retry body and the next normal, without adding a receipt key. The final reproduction on the pre-fix commit measured 725,000 ms where the closing median was 600,000 ms. The fixed run kept 600,000 ms in both subsequent verifications and recorded one accepted close. The existing C4 closing-window proof still passes. Logs `implementation/check-repair-f2-before-1795297220455-193709.log` (1) and `implementation/check-repair-f2-after-1795297220147-193359.log` (0).
- **F4** Docs `45b12662`. Before, both docs said comparison starts only at five eligible runs. After, both say the stored normal applies below five, while a ledger without one starts with the rolling median at five prior eligible runs. Both describe recovery on an eligible, unflagged run and identify the accepting window as the source of the next normal. Read both against Taken 2 and the stored-normal C5 proof.

The planned proofs were rerun after all commits using the Bun runner flags and the C1–C5 patterns. Kept green logs under `implementation/` are `check-repair-c1-c2-1795297259074-203339.log`, `check-repair-c3-1795297259578-203341.log`, `check-repair-c4-1795297259770-203340.log` and `check-repair-c5-1795297259283-203342.log`. The existing C3 cases are green and the coverage gap remains. The whole-file run `check-repair-slow-file-1795297277608-212094.log` passed all 20 cases. `check-repair-verify-boundaries-1795297277321-212096.log` passed five receipt, join and notice cases. `check-repair-format-1795297276612-212095.log` and `git diff --check` passed.

### Handed to A

- **F3** Criterion 3 lacks two cases for its recovery window limits. Use the existing Bun runner and CLI ledger fixtures in `tests/slow-merge.test.ts` to prove that an under-threshold episode median with fewer than five eligible runs does not recover and that earlier eligible runs from the same episode cannot influence a later last-20 median. Each proof should go red when its respective limit is removed.

## 2026-11-21 check.review after repair

- Prior reviewed base `4f5e3fd2ae13439c7fd8d8507c18ec524c0f9444`, prior reviewed head `2983cb0bac17d5aaaa33a7b06bc33cb0996b97d1`, and prior slot B repair head `45b12662`.
- Rebased base `852ddb916496b4211561ab15076c85bb02a61672`, reviewed head `88d40095369bea34e4d2a5fd263e526a35715d38`.
- Verdict `nits`.

Computed the range-diff from both the original reviewed head and the slot B repair head. The repair range adds two C3 cases and preserves the prior changes across rebase. The two conflict resolutions preserve the base branch's patch-ID inheritance and main-red cover documentation, as well as the leaf's locked alarm receipt order and slow-alarm documentation. Every concrete path in the changed area file exists. The report names `62acec49` and the handoff uses `88d40095`. Both have exactly the same tree, `dfbb8d56b07c6670ff6d23d6abc309a636edb7be`.

- **F1 and F2** Closed. Both regression tests passed in the reviewed head's configured suite.
- **F3** Closed. The first new CLI test keeps an episode open at four eligible runs with an under-threshold median. The second keeps it open when older eligible rows from the same episode would bring the median below the threshold. The `Test-Change:` trailer in `88d40095` cites C3 and correctly describes the two additions. In separate scratch runs from this tree I removed one limit at a time. Both breaks produced an unexpected `recovered` in the corresponding case. After restoring both limits the two cases passed with the plan's runner flags. Logs `implementation/check-recheck-recovery-minimum-1795298167584-931679.log` (1), `implementation/check-recheck-recovery-window-1795298167946-931921.log` (1) and `implementation/check-recheck-recovery-both-1795298168314-932172.log` (0).
- **F4** Closed. The rebased docs keep the five-run startup requirement scoped to ledgers without a stored normal and require an eligible, unflagged run for recovery.

One nonblocking nit at `tests/slow-merge.test.ts:657`. The last-20 fixture comment counts all 20 entries as 950,000 ms. The window also includes the current unflagged run, so 19 entries are 950,000 ms and the median is still 950,000 ms. The assertions and deliberate-break evidence remain valid. This would block if the actual median failed to distinguish the capped and uncapped windows.

Receipt `d2f7b88f-81b4-43cd-a879-14c9b7460913` matches the reviewed head and tree. Setup, format, typecheck and test exited 0. Read the full-suite summary and the four regression results in `implementation/check-test-1795297748341-420660.log`. It records 1,301 passing tests, including both C3 cases and both earlier regressions. `git diff --check` passed. The readiness file has no grants and this re-check used local fixtures only.
