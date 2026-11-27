# Slot B review

- Base `8ea0ff7320227e1e45785410787481e71989851e`
- Reviewed head `b161af407a8612fe953a26d59f0f441465dd2461`
- Verdict **fix**

## Fix

**F1. The C4/C7 tests gate builds on documentation wording.** The new assertions in `tests/watch-timer.test.ts:1405–1407` require prose tokens and phrases across the skill, guide, SVG and area index. An ordinary edit to the diagram can say “run observe for repository state and leaves” and “stop if the repo is on hold or the read fails,” preserving C7 while making the configured test command fail. The check also accepts text that describes a second read as “call the status subcommand,” even though that would violate C7. The wording repro in `implementation/check-review-b-doc-wording-1795645256801-3126871.log` extracted the actual pause regex and confirmed that the equivalent SVG text fails it. Keep mechanical checks for literal commands and fixed references, including C4's ban on the `akrogon status` command in the skill. Read the guide, diagram and area index for C7's meaning. This hits C4/C7 and the check-issue rule against akrogon tests of prose wording.

## Verification

- **C1–C3** passed the planned `hc-observe` command, 5 cases in `implementation/check-hc-observe-1795644135455-1720755.log`. Observe resolves the session and reads pause before stdout. Its paused return precedes inventory, seat and transcript reads, and the unchanged formatter preserves leaf and unreadable rows. The base and deliberate-break receipts in the plan show failures for the old framing, extra seat reads and partial stdout on invalid pause.
- **C4–C5** passed the planned timer suite, 22 cases in `implementation/check-watch-timer-1795644160599-1723293.log`. The shell and root stand-in cells passed in `implementation/check-watch-live-standin-shell-1795644250327-1741821.log` and `implementation/check-watch-live-standin-root-1795644322844-1780929.log`. The start and tick share Observe, and the merged-leaf, command-error and Consult resume re-reads use the same gate. The command-error path still forbids further mutation even with a good re-read. The plan's deliberate breaks caught stale rows and dispatch on paused or failed reads.
- **C6** passed the planned Pi shell cell in `implementation/check-watch-live-pi-shell-1795645101286-2974222.log`. The matching timer screen and call log show one observe on accepted dues 1, 2, 4, 5 and 6 and zero status calls. Due 4 found no leaves. Due 5, turn 4, called `next watch-staged-leaf` and the test confirmed its seat record. Due 6, turn 5, ran successfully with `paused=true` and made no next call while an eligible staged leaf's state stayed unchanged. The Pi transcript shows that it reported the pause and ended the check. Due 2 also demonstrates the failed-read stop on a timeout. Evidence is under `implementation/e2e-pi-shell-resumed/`; `pi-paused-turn.json` ties the paused due to `pi-watch-transcript.jsonl`.
- **C7** is correct in the current guide, SVG and area index. Their single initial read covers pause and inventory, and the skill specifies the gate for re-observations. A repository-root listing resolved the file references in `skills/AREA.md`, including its chart- and watch-relative entries. The docs test design is F1.
- **Configured checks** passed on the reviewed tree in verify run `149ba4de-448e-4153-9d98-b22b6bda673c`. Setup, format, typecheck and test exited 0. The test log `implementation/check-test-1795644836278-2455918.log` shows 1,544 passing tests and 135 passing reruns. The earlier run's lone pin-death failure in `implementation/check-test-1795644523592-1862899.log` is inconsistent. Its unchanged case starts a standalone timer, kills its pinned shell and loses a race with hc reporting the shell terminal finished. It never calls observe. The same configured test command passed on retry.
- **Proof currency and grant**. The four free criterion commands and the green Pi cell used the planned tests and cases on the reviewed head. All six test and fixture blobs match the files frozen at handoff. The paid evidence accounts for three Pi sessions across three attempts, each with a 2-session and 10-minute budget under readiness grant 0. Two provider rate-limit attempts produced no tool calls. The green run followed the operator's post-reset recovery. All three absence records were empty, and the review reused the green run and transcript.

## Test-Change trailers

All six paths match `src/test-files.ts`. Listed trailers are from `ca86d8c6b1d4cd11c7da9e4b96694a68bc82fe13`.

- `Test-Change: tests/hc-observe.test.ts observe-paused brief criteria 1–3 add pause framing, short-circuit and malformed-state cases.` C1 replaces obsolete session-only framing. C2/C3 add the paused and error cases, preserving existing row checks.
- `Test-Change: tests/watch-timer.test.ts observe-paused brief criteria 4, 5 and 7 replace status markers, verify paused and failed dues, and check the docs.` C4/C5 justify replacing the old command and changing timer markers. C7 justifies updating docs coverage. The prose assertions themselves are F1.
- `Test-Change: tests/fixtures/watch-agent.sh observe-paused brief criterion 5 reuse the hook for the accepted start check.` C5 replaces the separate status-based bootstrap check with the same observe path as the tick.
- `Test-Change: tests/fixtures/watch-hook.sh observe-paused brief criterion 5 replace the status gate with the observe contract.` C5 justifies the exit-code and line-2 gate after receipt, with a row required for the fixture's next call.
- `Test-Change: tests/e2e/watch-live.e2e.ts observe-paused brief criteria 5 and 6 record observe per turn, stage fresh leaves and retain the Pi transcript.` C5/C6 justify the new marker and moving shell-cell dispatch proof to the first due that sees the newly staged leaf. The paused due has its own eligible leaf and the real Pi transcript supplies the pause report.
- `Test-Change: tests/e2e/watch-tier.ts observe-paused brief criteria 1 and 6 require the unpaused header before launch.` C1 gives the new header and C6 needs isolated unpaused setup before launch. The existing session and exit checks remain.

## 2026-11-25 check.repair

**F1 repaired** in `15582bcdcfd1f14ab30f11fee4333a7da6a4871d`.
The old docs tests required the words `observe` and `pause` or `paused` and rejected
`read status` prose. The same four cases now check for the absence of the literal
`akrogon status` command, and the skill case requires
`bun <skill-folder>/scripts/observe.ts <root>`. Brief C4 names the command contract,
and C7 requires the single-read flow in the guide, SVG and area index. Read those
three docs for meaning as recorded in the review above.

Ran the planned C4/C5/C7 command unfiltered for each proof:
`akrogon run-check --name watch-timer -- bun test --timeout=120000 tests/watch-timer.test.ts`.

- On the reviewed head, the equivalent diagram wording from F1 failed the old pause
  regex. 21 passed, 1 failed in `implementation/check-watch-timer-1795645456928-3184119.log`.
  With the same wording and corrected assertions, all 22 passed in
  `implementation/check-watch-timer-1795645495659-3200181.log`.
- Deliberately restoring the `akrogon status` step in the watcher instructions and
  diagram turned those two corrected cases red. 20 passed, 2 failed in
  `implementation/check-watch-timer-1795645532604-3225914.log`. Restored both
  product files and ran the same suite on the committed repair. All 22 passed in
  `implementation/check-watch-timer-1795645578844-3261127.log`.

The repair changes only the timer test file. The observe suite, stand-in tier proofs
and Pi recording use the same scripts, fixtures, prompts and assertions as before.
Their prior evidence still applies, with no fresh paid launch. A's turn-attribution
nit remains deferred on the recorded run, which has complete call attribution and
a matching transcript.

Configured `akrogon verify` run `97eaf7a6-e4f1-4370-8ca5-0b5c9089a0a5` passed on
the committed repair in 6m57s. Setup, format, typecheck and test exited 0.
`implementation/check-test-1795645971303-3261394.log` records 1,544 passing tests
and 135 passing reruns. All blocking findings are resolved.
