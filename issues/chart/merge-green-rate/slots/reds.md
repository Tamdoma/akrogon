Non-green merge attempts, 2026-10-10 to 2026-10-14. 37 of 99 attempts. Times UTC.
Base for evidence paths: /home/ivan/Work/infra/tamdoma/framework/issues/

Classes: T timeout, F flaky, L leaf defect, D drift, B base/env broken, O other, ? unknown.

| # | Time | Holder | Outcome | Failing tests | Error | Class | Evidence (base-relative) |
|---|---|---|---|---|---|---|---|
| 1 | 10-10 13:37 | audit-errors | held | none found | none found | ? | no log |
| 2 | 10-10 17:36 | fail-fast | red | none found | none found | ? | no log |
| 3 | 10-10 21:55 | root-influence | ejected | none found | none found | ? | no log |
| 4 | 10-10 22:07 | recording-consumers | held | none found | none found | ? | no log |
| 5 | 10-11 06:10 | recording-consumers | held | hooks:selftest root-state-guard | Root activation sentinel absent | O | closed/worktree-isolation/recording-consumers/implementation/check-verify-1791699454160-3984801.log:3288, :3290 |
| 6 | 10-11 06:24 | recording-consumers | held | test:mpa-navigation, rest-a schema tests | browser_launch_failed, exited before DevTools | B | closed/worktree-isolation/recording-consumers/implementation/check-verify-1791700977110-1914269.log:10930-10937 |
| 7 | 10-11 07:04 | root-influence | ejected | not read | not read | ? | candidate closed/worktree-isolation/root-influence/implementation/check-verify-1791702843297-1094.log |
| 8 | 10-11 07:25 | check-scratch | ejected | not read | not read | ? | candidate closed/worktree-isolation/check-scratch/implementation/check-verify-1791704149511-2319583.log |
| 9 | 10-11 07:37 | formspark-build-wiring | ejected | not read | not read | ? | candidate closed/formspark-api/formspark-build-wiring/implementation/check-verify-1791704591905-2726326.log |
| 10 | 10-11 09:25 | check-scratch | reuse | none | none | ? | no red recorded |
| 11 | 10-11 09:50 | rejects-assert | held | not read | not read | ? | candidates closed/merge-flow/rejects-assert/implementation/check-verify-1791712664676-3075087.log, check-verify-1791713170147-3941523.log |
| 12 | 10-11 12:02 | probe-waits | ejected | not read | not read | ? | candidate closed/merge-flow/probe-waits/implementation/check-verify-1791720578570-3509968.log |
| 13 | 10-11 18:12 | parallel-selftest | ejected | not read | not read | ? | candidate closed/merge-flow/parallel-selftest/implementation/check-verify-1791742465896-1614021.log |
| 14 | 10-12 09:33 | backlink-run-identity | ejected | not read | not read | ? | candidate closed/audit-dispatch-contracts/backlink-run-identity/implementation/check-verify-1791797990990-1320743.log |
| 15 | 10-13 16:18 | spec-path-open-categories | red | scratch-writer-isolation.test.ts:618, enforcement-parity.test.ts:199, :221, prereq-fails.test.ts:115 | timed out after 5000ms, headless-chrome prereq 82546ms | T | closed/spec-path-categories/spec-path-open-categories/implementation/check-verify-1791908859884-904143.log, check-verify-1791910844268-2175216.log, check-verify-1791918671936-2161828.log |
| 16 | 10-13 19:52 | favicon-render | red | none, verify exit 0 | could not read Username for github.com at push | O | closed/satellite-favicon/favicon-render/review-B.md (section attempt 3edc6742) |
| 17 | 10-13 20:30 | pass-two-review-notes | red | none, verify exit 0 | GITHUB_AUTH_INVALID at push | O | open/backlink-audit-run/run-unblock/pass-two-review-notes/implementation/check-verify-1791924005362-2594815.log, review-B.md:222-262 |
| 18 | 10-13 20:42 | favicon-render | red | none, no verify run | git ls-remote exit 128 | O | closed/satellite-favicon/favicon-render/review-B.md:355-361 |
| 19 | 10-13 21:18 | pass-two-review-notes | red | test:render-satellite site-nav-e2e.test.ts | runner produced no result.json | ? | open/backlink-audit-run/run-unblock/pass-two-review-notes/implementation/check-verify-1791927740061-3369719.log, check-verify-1791929218640-2528816.log, site-nav-e2e.test.ts:42:55. Same failure in both runs. Leaning L or B |
| 20 | 10-13 23:15 | favicon-render | red | none, no verify run | GitHub auth blocker | O | closed/satellite-favicon/favicon-render/review-B.md:363-369 |
| 21 | 10-13 23:28 | favicon-render | red | none, verify never started | admission gate ~55.5 GiB vs 48 GiB | B | closed/satellite-favicon/favicon-render/review-B.md:387-405 |
| 22 | 10-14 04:09 | pass-two-review-notes | red | playback-probe, render-satellite, cf-workers-deploy | Timeout Page.navigate 15000ms, timed out after 300000ms | T | open/backlink-audit-run/run-unblock/pass-two-review-notes/implementation/check-verify-1791952808269-3348299.log:11439, :15186 |
| 23 | 10-14 04:39 | favicon-render | red | none, no checks ran | admission gate ~50.1 GiB vs 48 GiB | B | closed/satellite-favicon/favicon-render/review-B.md:407-423 |
| 24 | 10-14 05:11 | pass-two-review-notes | red | lens-mockup-types-release.test.ts:20 | timed out after 5000ms | T | open/backlink-audit-run/run-unblock/pass-two-review-notes/implementation/check-verify-1791955480419-196767.log:13279, :15030 |
| 25 | 10-14 06:38 | browser-dies-with-run | ejected | browser-owner.test.ts:508 | Expected -1 Received +3 | ? | closed/test-cost/browser-cost/browser-dies-with-run/implementation/check-verify-1791960375711-289915.log:547-553. Same test fails in 29 and 30, passes in slow-lane 1cb3bbcb. Leaning L or D |
| 26 | 10-14 07:34 | technical-pack-selection | red | none, no verify run | git fetch exit 128, gh token invalid | O | open/backlink-audit-run/service-coverage/technical-pack-selection/review-B.md:247-249 |
| 27 | 10-14 07:46 | technical-pack-selection | ejected | not read | not read | ? | rebase head 63557f9 in review-B.md, no merge check log attributed |
| 28 | 10-14 08:37 | flaky-test-fixes | red | none, no verify run | could not read Username | O | closed/flaky-tests/flaky-test-fixes/review-B.md:641-649 |
| 29 | 10-14 08:57 | flaky-test-fixes | ejected | browser-owner.test.ts:508:21, scratch-root-inventory.test.ts:308:52, prereq-fails chrome-on-PATH | Expected -1 Received +3, chrome not on PATH | ? | closed/flaky-tests/flaky-test-fixes/implementation/check-verify-1791970141722-3700441.log:580, :659, :6270 |
| 30 | 10-14 09:30 | shared-test-browser | ejected | browser-owner.test.ts:508 | Expected -1 Received +4 | ? | closed/test-cost/browser-cost/shared-test-browser/implementation/check-verify-1791970560149-4071330.log:586 |
| 31 | 10-14 10:54 | slow-lane-reads | ejected | none failing | changed-reads entry playback-content/ mapped to [] | ? | closed/test-cost/always-floor/slow-lane-reads/implementation/check-verify-1791975493457-2890037.log:117 |
| 32 | 10-14 11:56 | slow-lane-reads | red | default-browser-policy.test.ts:37, variant-review self-test, scratch-writer-isolation.test.ts:668:72 | ENOENT pack.md, Expected -1 Received +1 | ? | closed/test-cost/always-floor/slow-lane-reads/implementation/check-verify-1791979202420-3801041.log:6098, check-verify-1791979839823-4191664.log:13882, check-verify-1791980061221-1034224.log:8475 |
| 33 | 10-14 13:26 | slow-lane-reads | ejected | none failing | changed-reads entry lists 4 leaves vs 3 covering | ? | closed/test-cost/always-floor/slow-lane-reads/implementation/check-verify-1791984586799-2031798.log:117. Candidate L or D |
| 34 | 10-14 15:35 | technical-pack-selection | ejected | backlink-audit-spine.test.ts:199:56 | Expected -1 Received +1 | ? | open/backlink-audit-run/service-coverage/technical-pack-selection/implementation/check-verify-1791992441807-1305843.log:642 |
| 35 | 10-14 18:30 | promotion-script | red | backlink-audit-spine.test.ts:481:10, verify-aliases.test.ts:267:5, hooks-selftest-hermeticity.test.ts:83:97, promote script byte-for-byte | cheap baseline mismatch | L | open/backlink-audit-run/run-unblock/promotion-script/implementation/check-verify-1792002841643-976066.log:606, :610, :6839, :8792. D possible, main baseline changed in 0d9307f1e and 41561944b |
| 36 | 10-14 18:49 | disavow-evidence-scope | red | verify-aliases.test.ts:267:5 | cheap baseline mismatch | L | open/backlink-audit-run/disavow/disavow-evidence-scope/implementation/check-verify-1792003981329-2299771.log:6711, :8696. D possible |
| 37 | 10-14 20:15 | promotion-script | red | backlink-audit-spine.test.ts:434:59, :476:28, :501:26, :542:28, promotion writes nine artifacts | HALT missing-source-artifact raw/toxic-links-summary.json | ? | open/backlink-audit-run/run-unblock/promotion-script/implementation/check-verify-1792009116922-1827943.log:614, :805, :845, :867, :882. Fixture presence not checked |

Summary

Counts: T 3 (15, 22, 24), F 0, L 2 (35, 36), D 0, B 3 (6, 21, 23), O 7 (5, 16, 17, 18, 20, 26, 28), ? 22 (1-4, 7-14, 19, 25, 27, 29-34, 37). Total 37.

Top failing test files by attempts: browser-owner.test.ts 3 (25, 29, 30), backlink-audit-spine.test.ts 3 (34, 35, 37), scratch-writer-isolation.test.ts 2 (15, 32), verify-aliases.test.ts 2 (35, 36).

Reds in tests the leaf did not touch: not determined. Leaf file lists were not checked.

Logs not found: attempts 1-4. Merge verify logs missing or never started for 16, 18, 20, 21, 23, 26, 28. merge-verify-95ebc0cd.log is not on disk.

Surprises
- GitHub push auth (token invalid) blocked 6 attempts. Operator fix per review-B: gh auth login -h github.com, then gh auth setup-git.
- The 48 GiB admission gate stopped favicon-render verify runs 21 and 23 before any test ran.
- browser-owner.test.ts failed the same way in 25, 29, 30 and passed in slow-lane 1cb3bbcb.
- verify-aliases cheap baseline changed on main four times on 10-14 (37aae4944, 4cb918f55, 41561944b, 0d9307f1e).
- Merge verify 16bc27c7 exited 1, then 297e20e4 exited 0, then attempt 2b3b95c6 merged.
- 630a9d0b site-nav-e2e failed identically in two runs.
