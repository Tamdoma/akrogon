# Slot B review: engine-on-hc

Date: 2026-11-08. Phase: check.review, initial blind review.
Base: `99a256a8e57de5a05a8fa5c28cc109d710ba3101`.
Reviewed head: `8b317badd7ef3974232abd37910eee42d1224d58`.
Verdict: **fix**.

Reviewed the whole base-to-head change against brief.md, design.md, plan.md including O1–O4 and implementation notes, implementation/report.md, the command reference and linked areas. No peer review was read or contacted. No production code or committed tests changed.

## Fixes

### F1: Event wakes can dispatch before the startup pull

Location: `src/listen.ts:37-39,79,124-127`.

Realistic source: an existing akrogon terminal ends a turn, blocks or exits while the listener is restarting and subscribing to multiple running hc sessions. This is normal service startup with live seats. Each subscription's callback can call enqueue immediately, while scan is still awaiting another session's snapshot. enqueue starts its child immediately, and the startup pull has not even been queued.

Consequence today: `next --wake` can dispatch against the checkout's old issue records before `pull --all` imports the records it is meant to catch up from. The listener's first engine action is no longer the startup pull. Hits brief criterion 3, design Engine on hc Q2 and plan D15.

Evidence: `check B-startup-race: 1 implementation/check-B-startup-race-1794099243517-3398707.log`, read back with akrogon log. Two real fixture cores were running. The second event subscription was held at a FIFO, the first subscription delivered its real snapshot, and an akrogon-labelled stand-in exited on the first core. The actual child-call order was:

```text
before second snapshot: next --wake
startup pass order: next --wake
pull --all
Expected: "pull --all"
Received: "next --wake"
```

No hc reply was fabricated. The wrapper forwards the real event streams and controls only the second subscription's timing. Both fixture cores were stopped in finally. The reproduction source is preserved as evidence in `implementation/review-B-startup-repro.txt`. Its temporary executable copy was deleted.

Required result: subscribe before catch-up, keep any intervening wakes, and ensure the initial pull and resume precede event-driven dispatch. Add a boundary reproduction which fails on this head and passes after the repair. The current listener case holds resume only after it started, so it cannot exercise this startup interval. The report's C3.1 mutation also stayed green (`check mut-C3.1: 0 implementation/check-mut-C3.1-1794086276011-1206791.log`, read back), confirming the separate subscribe-before-catch-up assertion is not demonstrated. Preserve both ordering requirements in the proof.

### F2: The agy unavailable retry uses the subscription snapshot as a new status event

Location: `src/seat.ts:111-124`, through `src/hc.ts:waitFor`.

Realistic source: a first task send to a newly ready agy terminal returns hc's `kind: unavailable` while startup output is unsettled. This is the explicit brief criterion 5 scenario, also grounded in real harness startup refusals in chart forks/proofs.md P1.

The retry opens a new waitFor whose predicate accepts idle/done. waitFor evaluates its initial snapshot with that predicate, and the seat was already idle when the first send was attempted. Consequently, the snapshot immediately authorizes the retry with no subsequent status event. The second send also sits outside the unavailable catch.

Consequence today: the retry can run during the same unsettled startup interval and fail again, ending the start call before its 60-second budget instead of waiting for the required next status event. Hits criterion 5 and plan D10/C5.2. This is a product failure of a named criterion, not a request for another arbitrary edge case.

Evidence: direct trace above and the existing real-core agy case in `tests/hc-delivery.test.ts`. The stand-in emits idle after Enter, then waits for input without another status event. The armed shim refuses one send, and the current code immediately sends again and passes. `check B-hc-proofs: 0 implementation/check-B-hc-proofs-1794099027669-3381307.log` includes that case and was read back. The implementation report explicitly records the same limitation under U2: the resend accepts the snapshot.

Required result: retry after the next actual status event within the original start budget. Prove no retry from an unchanged idle snapshot and delivery after the actual status event, using the existing real-core boundary and refusal seam. Keep the first-task/no-blind-resend behavior.

### F3: The no-core-start proof observes the wrong socket

Location: `tests/hc-identity.test.ts:77-86`; the related stopped-session assertions in `tests/session-routing.test.ts` also probe the original real-runtime socket.

Criterion 6 and plan C6.1 require that discovery starts no core for a stale socket. The fixture gives akrogon a scratch runtime containing socket symlinks. If discovery contacts a dead session, hc can create the replacement core/socket in that scratch runtime. Checking only `stale.socket` under the original runtime still reports it dead and misses the new core.

Consequence today: the required no-side-effect result is unproven and its regression remains green. This is material because avoiding hc's automatic core startup is the reason D2 has the liveness probe.

Evidence: the implementation report's deliberate removal of the liveness probe remained green: `check mut-C6.1: 0 implementation/check-mut-C6.1-1794086300369-1211511.log`, read back. The report identifies the wrong-runtime observation itself. The current test is unchanged at that observation. The session-routing variants use the same original-socket observation, rather than checking the potential new runtime core.

Required result: observe the effective runtime's socket/core and prove no new serve process for that discovered session. Show the case red when the liveness check is deliberately bypassed, then green with the real implementation. Clean any deliberately created core on both outcomes. This is a missing observation using the existing fixture and runner, not missing proof machinery.

## Verification and proof freshness

- Current-head verify receipt `39e95692-fb89-45b1-bc85-14b473b9efe2` matches HEAD/tree `1e9e843756a13039db08174da0584f6a39fc909a` and the configured command set. Setup, format, typecheck and test all exited 0. Their logs were read with akrogon log. Test: `implementation/check-test-1794098861863-3065044.log`, 1265 pass, 0 fail, 75.28 s. Baseline: 75 s. No planned test or runner configuration was skipped or disabled.
- Focused current-head rerun after the configured flocked setup: `check B-hc-proofs: 0 implementation/check-B-hc-proofs-1794099027669-3381307.log`. Command: `bun test --timeout=30000 tests/hc-start.test.ts tests/hc-delivery.test.ts tests/hc-identity.test.ts tests/hc-listener.test.ts tests/hc-window-calls.test.ts tests/hc-teardown.test.ts tests/hc-status.test.ts tests/hc-watcher.test.ts tests/rollback.test.ts`. 40 pass, 0 fail, 36.43 s. The previously intermittent listener-restart step passed. That does not prove an unobserved root cause for earlier intermittent results.
- Criterion 7: `check window-tier: 0 implementation/check-window-tier-1794096461414-2984176.log`, read back. The window tier ran on 095b19e2 after its latest changes and shared tier changes. No window tier inputs changed afterward. Reviewed its actual captures and source coverage for leaf tabs, names, focus, closed-window adoption, consultant placement and close.
- Criterion 9: `check kinds-tier-9: 0 implementation/check-kinds-tier-9-1794098736021-3059316.log`, read back. Runs on reviewed head after the final kinds-test change, all four kinds, two reports each, transcript label assertions and agy's outside write. It proves normal startup, not F2's unavailable timing.
- Criterion 14: `check c14-grep: 0 implementation/check-c14-grep-1794086330154-1213727.log`, read back and compared to the current diff. Remaining engine calls are the excluded notice sends and retained shell exports. plugin/ is deleted and install's conditional integration loop remains as planned.
- No paid or attended live proof was launched in review. The only red review run is the leaf-caused F1 reproduction. No known-red/base comparison or unrelated-red filing applies.
- No full-suite rerun was needed: the current receipt already covers the unchanged head. The focused rerun addressed reported listener uncertainty and the hc criterion paths.

## Grant audit

Audited readiness grants[0], O2–O4, the report's count lines, kept kinds-tier logs and issues/timings.jsonl. P-1, K-2 and K-4 launched zero harness sessions. K-1, K-3, K-5 and K-6 launched one each, K-7 two, K-8 three and K-9 four: 13 total. K-9's 13-of-11 repeat-count overrun was warned before launch and is informational under the skill's grant rule. It does not invalidate the green proof.

The recorded target and identity remained the throwaway akr-e2e-engine tier under the operator's existing logins. The records distinguish removed cores, windows, cwd/trust entries and transcripts from the retained Claude/Codex trust entries and agy conversation. O3's Yes choice with Down then Enter is the authorized trust answer, and O4 covers Codex's trust answer. No unexplained paid launch was found. No operator action is open from this audit.

## Docs and area pointers

Opened docs/reference/commands.md from the changed behavior and followed docs/reference-index.md to src/AREA.md and tests/AREA.md. The two new verbs and --wake have command rows matching the CLI. Old-runtime wording reserved to herdr-sweep is excluded by design, rather than a docs Fix in this leaf.

One shell command listed named paths and existence for both changed AREA.md files: `check B-area-list: 0 implementation/check-B-area-list-1794098992412-3382329.log`, read back. All concrete paths and the hc test glob exist. `skills/<name>` and `herdr-app/<name>` are documented templates, not missing concrete targets. The deleted plugin's integration index pointer is removed. No dead concrete pointer finding.

## Test-Change audit

Applied the changed-file rule from src/test-files.ts, including fixture/helper files and tests/AREA.md. `check B-trailer-audit: 0 implementation/check-B-trailer-audit-1794099140355-3396659.log`, read back, found no missing trailer for a modified/deleted existing matched file.

Judgment of sources:
- D26/O1 ports cite the brief's removal of old herdr engine paths and requirement for the real-core fixture. Their preserved behavior now reads real hc seats/tasks. Deleted pane boxing, plugin hook, old layout and session-file cases cite removed mechanisms. Duplicate deletions name their surviving tests in commit bodies. These sources justify the ports and removals.
- D14 justifies the immediate source-closure retry expectations. D13 justifies the changed resettlement expectation and holding a working turn to avoid treating an actually ended turn as the same turn. That test correction does not independently prove all C4.1 conditions, but failure of a redundant guard alone is not a product Fix.
- Fixture-path, missing-prefix, log-attribution, runtime isolation, listener checkout/PATH, filesystem-event and self-slice corrections cite actual failed runs. They retain the relevant assertions and their final forms are covered by the current verify.
- Command-contract changes cite the new CLI interfaces, and the liveness-line exclusions have hc-status coverage. These are fixed command references rather than arbitrary prose tests.
- Window corrections cite real hc/herdr-app output for wait exit semantics, document persistence, focus field, list shape and home setup. The same cases still run and the current proof follows their last changes. The corrected assertions preserve akrogon's outcomes.
- O2–O4 trust/setup changes and the max_active fix cite their actual tier failures and operator decisions. No kind is selected away. K-9 follows every affected test/helper change. No accepted proof is stale relative to its inputs.
- F1 and F3 above remain verification defects despite valid trailers. A valid trailer does not establish that its resulting test observes every required outcome.

The complete trailers in base..HEAD follow, each judged under the source groups above.

- `9f9045d1` Test-Change: tests/rollback.test.ts adds two cases (rollback refused for a previous release shipping plugin/, hc-to-hc rollback with no herdr on PATH); no existing expectation changed
- `834881d2` Test-Change: tests/rollback.test.ts brief criterion 12 refuses rollback onto a release shipping plugin/; plan D26 ports these cases to a plugin-less seed
- `212d845f` Test-Change: tests/hc-window-calls.test.ts real output: check typecheck after U1, TS2769 at line 48 (expected string[] got (string | undefined)[])
- `0a9048c6` Test-Change: tests/hc-fixture.ts real output: hc "socket path for session akt... is too long here (115 bytes; this system allows 107)" under run-check (U2 report, check u2-start-plain); hc-start 5/5 green after (check f3-start)
- `91afcd2f` Test-Change: tests/hc-delivery.test.ts real output: check f12-delivery-before, task log held the implement task twice under D13 step 6; plan D13 and the silent-stop case require that re-prompt
- `38f9b677` Test-Change: tests/hc-delivery.test.ts real output: check f12-delivery-before, delivery_error.A = {code: not_started, turn: 1} after the resettling pass, as plan D13 steps 3 and 6 prescribe
- `6aceadb8` Test-Change: tests/command-reference.test.ts brief criterion 1 and plan D8 add `akrogon seat` (leaf and --slot forms); the contract mirrors the commands.md row
- `03c55d40` Test-Change: tests/hc-teardown.test.ts real output: U3 report M2, readState ENOENT at line 47 after the merged leaf completed (check u3-teardown)
- `ec928906` Test-Change: tests/hc-identity.test.ts real output: U3 report M1, the no-prefix case dispatched with prefixes { repo: rp } (check u3-identity)
- `b4014ac4` Test-Change: tests/hc-teardown.test.ts reproduction of a proven bug: the U3 worker reported that a merged leaf whose seats finished keeps them in hc ls --all (brief criterion 13 requires them killed and removed); red on da1ec596+ (check repro-finished-red)
- `8d8a80f2` Test-Change: tests/hc-listener.test.ts real output: U4 report M1, check u4-listener timed out with "end next --wake" already logged; second of two back-to-back appends lost 20/20; green 3/3 after (check m1-listener-1..3)
- `15864e3f` Test-Change: tests/command-reference.test.ts plan D15 and I3 add `akrogon listen` and `next --wake`; the contract mirrors the commands.md rows
- `4b8914d3` Test-Change: tests/isolation.ts real source: src/hc.ts sessions() reads ${XDG_RUNTIME_DIR}/herdr-core and tests/status.test.ts ran it against /run/user/<uid> (Watcher lines in check m3-status); same failing set before and after (check suite-head-base, check suite-isolated)
- `aab967b8` Test-Change: tests/status.test.ts brief criterion 10 adds Listener/Watcher lines to status; real output check m3-status ("Listener: down\nWatcher: repo none\nrepo ...")
- `1d523a63` Test-Change: tests/hc-watcher.test.ts real output: U4 report, the installed akrogon ran pull --all (exit 1), next --resume and rejected next --wake during the watcher cases; green after (check r1-watcher)
- `e92a79c9` Test-Change: tests/AREA.md doc file under tests/ (not a test): adds the hc fixture line and the scratch runtime dir, keeps 40 lines
- `626b6325` Test-Change: tests/hc-fixture.ts added hcFixture and delivered for the old-suite port (plan D26, O1); no existing expectation changed
- `94c4f93e` Test-Change: tests/shell.test.ts old herdr pane path removed by the brief ("old herdr calls in engine paths deleted"); the native-cause cases call herdr() with the pane list schema directly; deleted: 0 cases
- `47156a8d` Test-Change: tests/install.test.ts the checkout release has no plugin/ (brief: "the herdr plugin (plugin/) deleted"; deployer unlinks the old plugin for a release without plugin/); two cases expect only the unlink; deleted: 0 cases
- `c9e23ed3` Test-Change: tests/rollback-record.test.ts brief criterion 12 refuses rollback onto a release shipping plugin/; the case deploys a plugin-less seed (plan D26); deleted: 0 cases
- `cfb6f763` Test-Change: tests/pull.test.ts brief deletes plugin/; the startup-order case is replaced by tests/hc-listener.test.ts; deleted: 1 case
- `7ee13b85` Test-Change: tests/durable-capture.test.ts old herdr pane path removed by the brief ("old herdr calls in engine paths deleted"); ported to the real-core fixture ("the real-core test fixture ... land here"); deleted: 0 cases
- `47ad13d0` Test-Change: tests/seat-containment.test.ts deleted: pane boxing removed (plan D21, brief "old herdr calls in engine paths deleted"); 10 cases, reasons in the body
- `e40a0f08` Test-Change: tests/worktree-store.test.ts old herdr pane path removed by the brief ("old herdr calls in engine paths deleted"); ported to the real-core fixture ("the real-core test fixture ... land here"); deleted: 0 cases, reasons in the body
- `2d267390` Test-Change: tests/keep-rule.test.ts old herdr pane path removed by the brief ("old herdr calls in engine paths deleted"); ported to the real-core fixture ("the real-core test fixture ... land here"); deleted: 0 cases, reasons in the body
- `d1b55568` Test-Change: tests/store-sweep-safety.test.ts old herdr pane path removed by the brief ("old herdr calls in engine paths deleted"); ported to the real-core fixture ("the real-core test fixture ... land here"); deleted: 0 cases, reasons in the body
- `8cab2aca` Test-Change: tests/state-inventory.test.ts old herdr pane path removed by the brief ("old herdr calls in engine paths deleted"); ported to the real-core fixture ("the real-core test fixture ... land here"); deleted: 0 cases, reasons in the body
- `d0d48fc9` Test-Change: tests/leaf-slices.test.ts old herdr pane path removed by the brief ("old herdr calls in engine paths deleted"); ported to the real-core fixture ("the real-core test fixture ... land here"); deleted: 0 cases, reasons in the body
- `905aa72f` Test-Change: tests/reconcile.test.ts old herdr pane path removed by the brief ("old herdr calls in engine paths deleted"); ported to the real-core fixture ("the real-core test fixture ... land here"); deleted: 0 cases, reasons in the body
- `f3aedb06` Test-Change: tests/next.test.ts old herdr pane path removed by the brief ("old herdr calls in engine paths deleted"); ported to the real-core fixture ("the real-core test fixture ... land here"); deleted: 5 cases, reasons in the body
- `405b2c27` Test-Change: tests/next.test.ts old herdr pane path removed by the brief ("old herdr calls in engine paths deleted"); ported to the real-core fixture ("the real-core test fixture ... land here"); deleted: 3 cases, reasons in the body
- `a573413d` Test-Change: tests/next.test.ts old herdr pane path removed by the brief ("old herdr calls in engine paths deleted"); ported to the real-core fixture ("the real-core test fixture ... land here"); deleted: 1 case, reason in the body
- `415d70c1` Test-Change: tests/next.test.ts old herdr pane path removed by the brief ("old herdr calls in engine paths deleted"); ported to the real-core fixture ("the real-core test fixture ... land here"); deleted: 1 case and 1 assertion, reasons in the body
- `4f109e56` Test-Change: tests/next.test.ts old herdr pane path removed by the brief ("old herdr calls in engine paths deleted"); ported to the real-core fixture ("the real-core test fixture ... land here"); deleted: 3 cases, reasons in the body
- `f082b8ac` Test-Change: tests/next.test.ts old herdr pane path removed by the brief ("old herdr calls in engine paths deleted"); ported to the real-core fixture ("the real-core test fixture ... land here"); deleted: 23 cases and 1 assertion, reasons in the body
- `409d5c41` Test-Change: tests/next.test.ts old herdr pane path removed by the brief ("old herdr calls in engine paths deleted"); ported to the real-core fixture ("the real-core test fixture ... land here"); deleted: 4 cases, reasons in the body
- `945aaf2a` Test-Change: tests/dependents-first.test.ts old herdr pane path removed by the brief ("old herdr calls in engine paths deleted"); ported to the real-core fixture ("the real-core test fixture ... land here"); deleted: 0 cases, reasons in the body
- `0fd81964` Test-Change: tests/merge-attempts.test.ts old herdr pane path removed by the brief ("old herdr calls in engine paths deleted"); ported to the real-core fixture ("the real-core test fixture ... land here"); deleted: 0 cases, reasons in the body
- `6c273bc0` Test-Change: tests/timing.test.ts old herdr pane path removed by the brief ("old herdr calls in engine paths deleted"); ported to the real-core fixture ("the real-core test fixture ... land here"); deleted: 0 cases, reasons in the body
- `eb6d4807` Test-Change: tests/green-merge.test.ts old herdr pane path removed by the brief ("old herdr calls in engine paths deleted"); ported to the real-core fixture ("the real-core test fixture ... land here"); deleted: 1 cases, reasons in the body
- `00923bc9` Test-Change: tests/pause-next.test.ts old herdr pane path removed by the brief ("old herdr calls in engine paths deleted"); ported to the real-core fixture ("the real-core test fixture ... land here"); deleted: 3 cases, reasons in the body
- `84d8f817` Test-Change: tests/batch-dispatch.test.ts old herdr pane path removed by the brief ("old herdr calls in engine paths deleted"); ported to the real-core fixture ("the real-core test fixture ... land here"); deleted: 0 cases, reasons in the body
- `e4b009f2` Test-Change: tests/hc-fixture.ts hcFixture puts the fake systemctl on akrogon's PATH (old-suite port, plan D26, O1); no existing expectation changed
- `a5a5686c` Test-Change: tests/leaf-slices.test.ts realEnv keeps the real systemctl under hcFixture's default fake (old-suite port, plan D26, O1); no expectation changed
- `9fa5fdfe` Test-Change: tests/session-routing.test.ts old herdr pane path removed by the brief ("old herdr calls in engine paths deleted"); ported to the real-core fixture ("the real-core test fixture ... land here"); deleted: 5 cases and the start/prompt part of one, reasons in the body
- `b153af47` Test-Change: tests/session-reads.test.ts old herdr pane path removed by the brief ("old herdr calls in engine paths deleted"); ported to the real-core fixture ("the real-core test fixture ... land here"); deleted: 3 cases, reasons in the body
- `3eee4e0d` Test-Change: tests/phase.test.ts old herdr pane path removed by the brief ("old herdr calls in engine paths deleted"); ported to the real-core fixture ("the real-core test fixture ... land here"); deleted: 1 case, reasons in the body
- `7efe807a` Test-Change: tests/phase.test.ts plan D14 (phase ends with one automatic pass on its own leaf, which retries a failed source closure) contradicts the one-attempt expectation; the two source closure cases expect the second attempt; deleted: 0 cases
- `69e7c32f` Test-Change: tests/leaf-stop.test.ts old herdr pane path removed by the brief ("old herdr calls in engine paths deleted"); ported to the real-core fixture ("the real-core test fixture ... land here"); deleted: 0 cases, reasons in the body
- `1bc120a9` Test-Change: tests/release-any-phase.test.ts old herdr pane path removed by the brief ("old herdr calls in engine paths deleted"); ported to the real-core fixture ("the real-core test fixture ... land here"); busctl race moved to hc run (D21); deleted: 0 cases, reasons in the body
- `97b10e10` Test-Change: tests/fake-busctl.ts deleted: pane boxing removed (plan D21); brief-3 criterion 7, operator decision O1
- `97b10e10` Test-Change: tests/isolation.ts fake busctl build removed with tests/fake-busctl.ts (brief-3 criterion 7, operator decision O1); no expectation changed
- `97b10e10` Test-Change: tests/helpers.ts fakeHerdr no longer links busctl or sets FAKE_BUSCTL_HOME (brief-3 criterion 7, operator decision O1); no expectation changed
- `448f66a1` Test-Change: tests/AREA.md describes the ported suite: seat-containment and the fake busctl deleted, hcFixture added, session-routing on hc (old-suite port, plan D26, O1)
- `a0990154` Test-Change: tests/next.test.ts coreFixture replaced by hcFixture, which now carries the fake systemctl (old-suite port, plan D26, O1); no expectation changed; deleted: 0 cases
- `c4dfb4d2` Test-Change: tests/next.test.ts old herdr pane path removed by the brief ("old herdr calls in engine paths deleted"); ported to the real-core fixture ("the real-core test fixture ... land here"); deleted: 16 cases, reasons in the body
- `3380fd3d` Test-Change: tests/next.test.ts old herdr pane path removed by the brief ("old herdr calls in engine paths deleted"); ported to the real-core fixture ("the real-core test fixture ... land here"); deleted: 0 cases
- `87a4b697` Test-Change: tests/next.test.ts old herdr pane path removed by the brief ("old herdr calls in engine paths deleted"); ported to the real-core fixture ("the real-core test fixture ... land here"); deleted: 0 cases
- `406190d4` Test-Change: tests/next.test.ts old herdr pane path removed by the brief ("old herdr calls in engine paths deleted"); ported to the real-core fixture ("the real-core test fixture ... land here"); deleted: 3 cases, reasons in the body
- `1768a17f` Test-Change: tests/next.test.ts old herdr pane path removed by the brief ("old herdr calls in engine paths deleted"); ported to the real-core fixture ("the real-core test fixture ... land here"); deleted: 1 case, reasons in the body
- `f7338cd6` Test-Change: tests/next.test.ts old herdr pane path removed by the brief ("old herdr calls in engine paths deleted"); ported to the real-core fixture ("the real-core test fixture ... land here"); deleted: 0 cases
- `e68ae6b3` Test-Change: tests/next.test.ts old herdr pane path removed by the brief ("old herdr calls in engine paths deleted"); ported to the real-core fixture ("the real-core test fixture ... land here"); deleted: 0 cases, one hook-pass assertion dropped (reason in the body)
- `248d7934` Test-Change: tests/next.test.ts old herdr pane path removed by the brief ("old herdr calls in engine paths deleted"); the remaining refusal cases ported to the real-core fixture ("the real-core test fixture ... land here"); deleted: 0 cases
- `6e6d21f8` Test-Change: tests/hold-retired.test.ts old herdr pane path removed by the brief ("old herdr calls in engine paths deleted"); the merge-turn check ported to the real-core fixture ("the real-core test fixture ... land here"); deleted: 0 cases
- `66d7e4a4` Test-Change: tests/leaf-slices.test.ts the ported self-slice case keeps its real slice occupied across the seat's end (suite-after-port log, real "destructive transaction" refusal); no expectation changed
- `352cb1ba` Test-Change: tests/e2e/tier.ts the tier session lacked the herdr-app home D12 requires (real output: "herdr-app home for session akr-e2e-engine is missing"); startTier creates it and stopTier always deletes it
- `352cb1ba` Test-Change: tests/e2e/window.e2e.ts stopTier lost its window argument (the tiers always create the session home); expectations unchanged
- `352cb1ba` Test-Change: tests/e2e/kinds.e2e.ts stopTier lost its window argument (the tiers always create the session home); expectations unchanged
- `095b19e2` Test-Change: tests/e2e/window.e2e.ts expectations corrected to real output (hc wait timeout exit 0; herdr-app document written after its do answer; status focused_pane; session list shape; seat worktrees left under the leaf temp); assertions about akrogon unchanged
- `ac63d6a6` Test-Change: tests/e2e/kinds.e2e.ts claude's seat folder moves to /tmp/akr-e2e-engine-claude (plan O2; real output: Claude's folder-trust dialog in K-1); expectations unchanged
- `72049f8b` Test-Change: tests/e2e/kinds.e2e.ts plan O3 (door t15, 2026-11-08) withdraws the /tmp claude cwd and authorizes answering Claude Code's folder-trust dialog for the recorded throwaway cwd; real output implementation/kinds-tier/claude-start.txt shows the dialog with "No, exit" selected
- `3a4aeffc` Test-Change: tests/e2e/kinds.e2e.ts real output check-kinds-tier-5 (transcript null while the claude transcript file existed); transcriptFor now sees the tier session through the tier runtime, as akrogon's runs do
- `61a519ca` Test-Change: tests/e2e/kinds.e2e.ts real output check-kinds-tier-6 (no dialog once the retained trust entry exists, plan O3); the trust answer is now conditional on the dialog showing
- `2d73d276` Test-Change: tests/e2e/kinds.e2e.ts plan O4 (door t15, 2026-11-08) authorizes answering codex's trust dialog; real output implementation/kinds-tier/codex-start.txt shows "› 1. Trust and continue" selected
- `8b317bad` Test-Change: tests/e2e/kinds.e2e.ts real output implementation/kinds-tier/agy-start.txt (max_active 3 reached at the fourth kind); the tier config sets max_active to the number of kinds


## check.repair, 2026-11-08 (slot B)

Reviewed both initial reviews. Started at 8b317badd7ef3974232abd37910eee42d1224d58, current repair head fdbcb416. Finding references below qualify the review because the original F numbers overlap.

### Repaired

- review-B/F1: test cadd511d, fix 54070759. Startup pull/resume are queued before event wakes and drain only after all initial subscriptions. Red: `check B-F1-red: 1 implementation/check-B-F1-red-1794099549476-3408328.log`. The existing planned listener case and new reproduction passed in `check B-F2-current-proofs: 1 implementation/check-B-F2-current-proofs-1794099969392-3419686.log`; the only red there was the old agy fixture below. Earlier `check B-F1-green: 1 implementation/check-B-F1-green-1794099590797-3408958.log` also reproduced review-A/F1's missing restart catch-up.
- review-B/F2: test 72fd127a, stimulus correction 31f5c7f6, product fix fdbcb416. One subscription spans trust, first send and unavailable retry, processing each event serially. The initial snapshot is consumed once, so only a subsequent status can retry, and status events arriving during the send stay queued. The reproduction's first idle message change emitted no new hc status. Its final stimulus emits done, with the same expectation. Red on the pre-repair product: `check B-F2-red-final-test: 1 implementation/check-B-F2-red-final-test-1794099913339-3418851.log`. Green: `check B-F2-final-green: 0 implementation/check-B-F2-final-green-1794100011025-3431061.log`. Typecheck: `check B-F2-typecheck: 0 implementation/check-B-F2-typecheck-1794099971761-3429458.log`.
- review-A/F2: docs commit 7fb05fdd removes the deleted hook/HERDR_PANE_ID claim and names the current session-read cases. Before `check B-AF2-before: 0 implementation/check-B-AF2-before-1794099819088-3416864.log`, after `check B-AF2-after: 0 implementation/check-B-AF2-after-1794099838539-3417184.log`. tests/AREA.md remains 39 lines.

### Handed to A

- review-B/F3, criterion 6/C6.1: add the missing observation using existing hcCore, recording shim and runner. Observe the effective scratch-runtime core/socket or serve process, rather than only the original dead socket, then show the liveness-bypass break red. This meets the skill exception for a criterion whose proof lacks a case/capture/recording; B wrote no replacement criterion test.
- review-B/F2, criterion-5 old planned proof: the old agy trust/unavailable case emits no subsequent status after the armed refusal. The corrected product leaves it unconfirmed. Keep its intended expectations and make the existing fixture emit the required next status. B's new reproduction passes, but B leaves the old planned proof correction to A. The 33 other cases in B-F2-current-proofs passed, while that old case timed out with its seat at turn 0, idle.

### Planned live reruns and grant use

Read plan O3/O4, readiness grants[0], previous count lines and both audits. K-9 left prior paid use at 13 harness sessions. No prior use is unknown. Tasks, harness/model pins and two prompts per kind are unchanged. Criterion 9 names fresh start/later interaction, so the changed start path requires the live rerun.

- W-B1: grant grants[0], one throwaway hc/herdr-app session akr-e2e-engine, user ivan uid 1000, stand-in and cat only, zero paid harness launches. Command is the planned window tier with AKROGON_E2E=window, root /var/tmp/akr-1000/5d20/1f23ef6e, out <leaf>/implementation/window-tier. Intended pre-launch note writing failed due to shell quoting, and the launch began before that failure was handled. This record was saved after the window run began. No paid launch has occurred in B's repair pass at this point. Cleanup remains stopTier and its absence check. Prior captures were copied to implementation/window-tier-before-repair.
- Warning before K-B1: the paid repeat-count bound is 11 total harness sessions. The next full four-kind run starts at 13 and can end at 17 of 11. This is a paid repeat count, not a spend cap or live-change bound. The warning was also sent visibly before launch. Operation, target, identity, effects, two prompts per kind and stop_line stay within grants[0].
- Count K-B1 before launch: grant grants[0], bound 11 harness sessions, count so far 13, unit harness session. Expected four sessions (claude, codex, pi, agy), two prompts each, count after at most 17. Cwds recorded before use: /var/tmp/akr-1000/5d20/1f23ef6e/akr-e2e-engine-{claude,codex,pi,agy}. Tier root/home: /var/tmp/akr-1000/5d20/1f23ef6e/akr-e2e-engine-kinds-{root,home}; runtime /var/tmp/akr-1000/5d20/1f23ef6e/akre2e-rt-kinds. Same operator harness logins, target akr-e2e-engine. Prior metadata captures were copied to implementation/kinds-tier-before-repair. Retained Claude/Codex trust entries stay untouched. Planned cleanup removes the new agy trustedWorkspaces entry and Claude/Codex/pi transcripts after quoting paths, and records retained agy conversations.

### Live results on fdbcb416

- W-B1 outcome: green, `check B-window-tier: 0 implementation/check-B-window-tier-1794100097348-3433033.log`, one pass, 28 assertions, 22.60 s. The planned tier covered placement, names, focus, consultant joining and close. stopTier removed the throwaway core/window/cwds; window-tier/absence.txt reads absent.
- K-B1 outcome: green, `check B-kinds-tier: 0 implementation/check-B-kinds-tier-1794100189315-3435881.log`, one pass, 37 assertions, 45.34 s. Four harness sessions, two prompts each. Count after: 17 of 11, as warned. Addresses in akr-e2e-engine: claude t2, codex t3, pi t4, agy t5. Every first task confirmed, later turn advanced, both hc reports arrived, and the transcript label resolved. Agy's outside write passed. Cost is not known.
- Transcript paths quoted before cleanup:
  - claude: /home/ivan/.claude/projects/-var-tmp-akr-1000-5d20-1f23ef6e-akr-e2e-engine-claude/db9c5257-636e-4e62-bd55-2e2de124ce12.jsonl (454973 bytes).
  - codex: /home/ivan/.codex/sessions/2026/11/08/rollout-2026-11-08T02-09-13-01a1b8b3-cd8e-7551-a276-74290b2b1ed1.jsonl (185181 bytes).
  - pi: /home/ivan/.pi/agent/sessions/--var-tmp-akr-1000-5d20-1f23ef6e-akr-e2e-engine-pi--/2026-11-08T01-09-23-715Z_0f350a13-2d78-4601-973e-ce789f892f6e.jsonl (38694 bytes).
  - agy: /home/ivan/.gemini/antigravity-cli/conversation_summaries.db. New retained conversation 72b790ed-cf65-4b86-a4f0-e76815aec42c, last modified 2026-11-08 01:09:47 UTC. Earlier retained conversation 8007c13e-d1b5-459c-ba37-14780e790b06 stays untouched.
- Retained resources: Claude/Codex's previously declared tier trust entries and the new agy conversation under readiness retained[]. No script edits Claude or Codex settings. Still to delete at this record: the three quoted transcript files/folders, the exact recorded agy trust entry and outside file, and the Claude seat's temp folder. The tier already reported left=[] for the core/window and recorded cwds.

### Final disposition and remaining handoff

- review-A/F1 is handed to A for resolution of the locked no-polling decision. The proposed repair in review-A is bounded readiness polling, while design.md Signposts explicitly says no polling loops or timed waits replacing a signal, and plan D15 uses socket events. B added no polling. The failure did recur in B-F1-green with no resume after restart. A diagnostic then caught up through 12 real restarts with no stderr (`check B-AF1-diagnostic-2: 0 implementation/check-B-AF1-diagnostic-2-1794100009167-3430776.log`), so B does not claim a proven readiness cause or a repair. Resolve an event-driven repair within the locked contract, or correct that decision and its proof through A. The diagnostic source is preserved at implementation/review-B-restart-diagnostic.txt; the temporary test copy was removed.
- The other Handed to A items above remain: review-B/F3's missing no-new-core observation, and the old criterion-5 agy case's missing status stimulus. They use existing runners and helpers and need no new proof machinery.
- The applicable skill is [check-issue](/home/ivan/.codex/skills/check-issue/SKILL.md): "B repairs every Fix except a change to a locked brief or design decision" and "A criterion whose proof lacks only a case, capture or recording that the existing runner and helpers can run goes under Handed to A." These are the reasons for the handoff. No operator-only action or missing permission is open in this repair.
- Cleanup complete: `check B-kinds-cleanup: 0 implementation/check-B-kinds-cleanup-1794100306174-3440583.log`, read back. B-kinds-absence.json proves no socket, app home, core state, recorded cwd/runtime, quoted transcript/folder, Claude temp or outside file remains. The exact agy trust entry is absent. The original 10 trusted entries and every other settings value have matching pre/post hashes. Only the explicitly retained harness trust entries and agy conversation remain.
- All cited completed logs in this repair entry were read back with akrogon log. The corrected startup and agy product paths have red-before/green-after reproductions. The unchanged planned window and four-kind tiers both pass on fdbcb416, satisfying the planned-proof requirement for the repaired start path. Existing deterministic criteria except the handed-off agy stimulus passed in B-F2-current-proofs (33 pass, 1 fail). No new source change followed those proofs.
- No verify or merge_checks run in this check.fix handoff, as required by check.repair. The current deterministic suite is explicitly not claimed green. A must repair the handed-off proof cases, resolve the remaining listener finding, run affected proofs, then verify on its final committed head. No unrelated base-red filing applies.
- Repair commits, in order: cadd511d (B/F1 reproduction), 54070759 (B/F1 fix), 72fd127a (B/F2 reproduction), 7fb05fdd (A/F2 docs), 31f5c7f6 (B/F2 reproduction stimulus correction), fdbcb416 (B/F2 fix). Modified old test paths have Test-Change trailers. B wrote no criterion test beyond its bug reproductions. No reusable Nit remains held by B, and no lesson file changed.

Requested next phase: check.fix for A's remaining items.


## Re-check after check.fix, 2026-11-08 (slot B)

- Prior reviewed base/head: 99a256a8e57de5a05a8fa5c28cc109d710ba3101 / 8b317badd7ef3974232abd37910eee42d1224d58.
- B's repair handoff head: fdbcb416622e4ef6a3dbf0154e10dd770decf32d.
- Reviewed head: 405127d350949d4cbba48629d8f64d78239a37b3, base unchanged at 99a256a8.
- Verdict: **fix**. No new blocking defect was found in A's two test changes. The earlier review-A/F1 remains unresolved.

### Scope and refresh

Computed `git range-diff 99a256a8e57de5a05a8fa5c28cc109d710ba3101..8b317badd7ef3974232abd37910eee42d1224d58 99a256a8e57de5a05a8fa5c28cc109d710ba3101..405127d3` myself through `check B-recheck-diff: 0 implementation/check-B-recheck-diff-1794101189524-3801040.log`. All 79 original commits are unchanged. The added range comprises B's six previously recorded repair commits and A's e210d87e and 405127d3. There are no rebased/conflict-changed commits or new main commits to inspect. A's own diff from the handoff is only tests/stand-in.sh and tests/hc-identity.test.ts.

### Earlier findings confirmed

- review-B/F1: repaired by B's queued startup ordering. The reproduction and original listener case pass on this head. No further change is needed.
- review-B/F2: B's product repair remains, and e210d87e supplies the missing later ready status for the original agy criterion case. It emits a genuine hc status from the stand-in rather than fabricating a send result. The one-second pause schedules the fixture's later stimulus; product readiness still follows hc events. The existing task, trust-answer, send-count and prompted assertions remain. Accepted.
- review-B/F3: 405127d3 checks the effective runtime's stale-socket link and liveness, with cleanup of a core created by the deliberate break. The new assertion fails when discovery bypasses the liveness probe even while the original-socket checks remain green. Accepted.
- review-A/F2: B's tests/AREA.md correction remains and names the current session-read cases. No further change is needed.
- review-A/F1: **still a Fix**, retained from the initial review rather than added by this repair re-check. Criterion 3's restart/catch-up scenario failed in suite-port-start, suite-after-port-2 and B-F1-green. Those are observed failures of the required outcome, not uncertainty alone. A reports no product repair and no established alternative cause.

### review-A/F1: why the new diagnostics do not close it

The proposed bind/readiness explanation remains unconfirmed. Six successful CREATE-event probes do not disprove a different scheduling interleaving, and B does not claim those probes established the root cause. Likewise, 65 successful targeted/storm cases do not explain or remove the three recorded missing-catch-up outcomes.

The recovery mechanism is unchanged: the ended stream removes the subscription and marks catchUp, then schedules a scan. A scan subscribes only sessions reported live by a one-shot socket probe. An existing session skipped in that scan is retried only on another filesystem event. A documents that hc events can itself auto-start a core if the session disappears between the probe and connection. There is no repair or newly demonstrated invariant preventing the missing-catch-up interval. The async callback change in B's agy repair does not change that rescan policy.

Realistic source and present consequence remain the original finding's normal core restart/crash while the listener follows that session: a required recovery pass can be missed, leaving later seat events without engine dispatch. Hits brief criterion 3. This finding does not demand polling, and the no-polling decision remains locked. The next repair must establish the cause and close it within that contract, or explicitly resolve a required contract change. Repeated green runs alone are not a fail-before/pass-after product repair.

Evidence retained:
- `check B-F1-green: 1 implementation/check-B-F1-green-1794099590797-3408958.log`: the log ends with wake passes and no restart resume before the 15-second timeout.
- `check A-AF1-load-diag: 0 implementation/check-A-AF1-load-diag-1794100844120-3468947.log`: 24 planned-case load runs, no reproduced failure.
- `check A-AF1-file-diag: 0 implementation/check-A-AF1-file-diag-1794100903538-3475681.log`: 16 whole listener-file runs, no reproduced failure.
- `check A-AF1-storm: 0 implementation/check-A-AF1-storm-1794100974033-3485658.log`: 25 restarts, 26 resumes and the scratch socket still a link.
- B's current repeat of the exact planned listener command is green: `check B-recheck-listener: 0 implementation/check-B-recheck-listener-1794101301988-3806598.log`, 3 pass, 0 fail, 6.96 s, after the configured flocked setup. This confirms the current happy path and does not identify what caused the previous missing recovery.

### Current verification and proof freshness

Receipt 65236dad-757f-469b-a43e-cbdf3050a163 matches reviewed SHA/tree bf4a7a078d2f9e9faa5a72877637bdb1b8abc6fb and the configured setup/format/typecheck/test command set. Every exit is 0. Test log implementation/check-test-1794101107673-3489123.log records 1267 pass, 0 fail, 75.04 s, compared with the 75 s baseline. Setup, format and typecheck logs and the relevant test output were read through akrogon log. No full-suite rerun was needed for this unchanged committed head.

The corrected agy case has red-before (`check A-agy-old-before: 1 implementation/check-A-agy-old-before-1794100537819-3448374.log`) and green-after (`check A-agy-old-after: 0 implementation/check-A-agy-old-after-1794100559081-3450414.log`, all five delivery cases). Other trust-mode consumers passed (`check A-trust-users: 0 implementation/check-A-trust-users-1794100584268-3452821.log`, 22 pass).

The no-core proof has the deliberate-break red (`check A-F3-break: 1 implementation/check-A-F3-break-1794100627919-3460947.log`, failure at the new effective-runtime assertion) and restored green (`check A-F3-green: 0 implementation/check-A-F3-green-1794100647269-3464723.log`, five pass). No existing assertion was removed or weakened.

The window tier was rerun after its stand-in input changed: `check A-window-tier-fix: 0 implementation/check-A-window-tier-fix-1794101022593-3487486.log`, one pass, absence.txt reads absent. Its current output follows the latest helper change. The kinds tier does not use the stand-in, and src, kinds.e2e.ts and tier.ts are unchanged from B's green K-B1. That proof remains current. No proof command was changed, skipped, filtered or disabled.

No covered paid/live operation was launched in this review. A's new window proof used stand-ins only. Paid count stays at 17 of 11, with the prior warning and cleanup already recorded. No new operator action is open.

### Test-Change and docs audit

Additional trailers since the original review:
- cadd511d: tests/hc-listener.test.ts, review-B/F1's real multi-session startup/seat-exit scenario. Accepted reproduction, red before the startup fix.
- 72fd127a: tests/hc-delivery.test.ts, review-B/F2 and criterion 5's unavailable/next-status scenario. Accepted reproduction.
- 7fb05fdd: tests/AREA.md, review-A/F2's removed hook/HERDR_PANE_ID cases. Accepted docs correction.
- 31f5c7f6: tests/hc-delivery.test.ts, observed lack of a new event for idle msg=ready in B-F2-green. Accepted reproduction-stimulus correction; the final test was shown red on the old product and green on the repair.
- e210d87e: tests/stand-in.sh, criterion 5's next-status requirement and the old fixture's recorded absence of that event. Accepted fixture correction, assertions unchanged.
- 405127d3: tests/hc-identity.test.ts, criterion 6/C6.1 and review-B/F3's wrong-runtime observation. Accepted added observation, deliberate break red and restored green.

Opened docs/reference/commands.md for listen/seat behavior. No documented product behavior changed in A's repair. No AREA.md is in A's two-commit diff, and B's earlier AREA pointer listing remains applicable to its unchanged paths. No docs/index or lesson change is required by these two test corrections.

All newly cited proof/diagnostic logs were read back. The existing blocking review-A/F1 is retained; no unrelated base-red judgment or new issue is created. No code, test, design or lesson file changed in this re-check.

## check.repair 2026-11-08: review-A/F1 root cause

The earlier handoff and A's probes pursued an unproven socket-readiness explanation. Neither earlier pass captured stderr from the failing planned listener. With stderr inherited for diagnostics, the unchanged planned test reproduced the same absent restart resume and showed a ZodError rejecting params.data=null (B-AF1-planned-stderr, 59 pass/1 fail). Startup-only restart probes did not exercise a foreground disappearing from a terminal. The real hc 0.1.18 foreground watcher emits data=null when the foreground process goes away (upstream crates/herdr-core/src/foreground.rs:154-172). The shared envelope rejected it before the existing nullable foreground merger could handle it.

The new real-core reproduction holds a foreground process group until observed, ends it while the terminal remains live, observes the native null event, then requires restart catch-up. No hc reply is fabricated. Test commit 560218d is red before the fix. Product commit e3202dff allows null payloads in the shared event envelope and its type. Search of all HcLine/follow/merged consumers found this single envelope used by listener, waitFor and waitForDoc. merged already parses nullable foregrounds. No socket retry, scan scheduling change or polling was added.

### Planned live reruns and grant counts

- W-B2 before launch: readiness grants[0], user ivan uid 1000, target throwaway hc/herdr-app akr-e2e-engine only, existing plan window-tier command, stand-in and cat, zero paid sessions. Cleanup stopTier and its absence read. Prior captures saved in implementation/window-tier-before-AF1.
- Warning before K-B2: paid repeat-count bound 11 total harness sessions, established prior use 17, next full run can reach 21 of 11. This is a repeat count, not a spend cap or live-change bound. Visible warning given before launch. Same four small model pins, low effort and two prompts each, target, identity, effects and stop_line as grants[0].
- Count K-B2 before launch: grants[0], bound 11, count so far 17, unit harness session. Expected four sessions, two prompts each, after at most 21. Cwds /var/tmp/akr-1000/5d20/1f23ef6e/akr-e2e-engine-{claude,codex,pi,agy}. Tier root/home /var/tmp/akr-1000/5d20/1f23ef6e/akr-e2e-engine-kinds-{root,home}, runtime /var/tmp/akr-1000/5d20/1f23ef6e/akre2e-rt-kinds. Prior captures saved in implementation/kinds-tier-before-AF1. Cleanup removes exactly the run's agy trusted path, quoted Claude/Codex/pi transcripts and recorded cwds/temp/outside file, with all other settings unchanged. Prior retained trust entries and agy conversations remain.

### W-B2 / K-B2 completed on e3202dff

- W-B2 green: check B-AF1-window-tier: 0 implementation/check-B-AF1-window-tier-1794102341868-3858694.log. 1 pass, 28 assertions, 22.74 s. Tier absence reads absent.
- K-B2 green: check B-AF1-kinds-tier: 0 implementation/check-B-AF1-kinds-tier-1794102406241-4035524.log. 1 pass, 37 assertions, 46.92 s. Four harness sessions, two prompts each, count after 21 of 11 as warned. First task, later delivery, reports, transcript labels and agy outside write passed. Addresses claude t2, codex t3, pi t4, agy t5. Cost unknown. stopTier reported left=[].
- Transcript paths and sizes quoted before cleanup:
  - claude: /home/ivan/.claude/projects/-var-tmp-akr-1000-5d20-1f23ef6e-akr-e2e-engine-claude/e42d3e35-fdba-401b-bd1b-a64d2f16f5ee.jsonl (454999 bytes).
  - codex: /home/ivan/.codex/sessions/2026/11/08/rollout-2026-11-08T02-46-08-01a1b8d5-99c2-70f2-a5c7-ae0837b030b7.jsonl (185397 bytes).
  - pi: /home/ivan/.pi/agent/sessions/--var-tmp-akr-1000-5d20-1f23ef6e-akr-e2e-engine-pi--/2026-11-08T01-46-20-371Z_4c46a081-a3d3-409a-a2bf-a678a636cfc5.jsonl (38900 bytes).
  - agy: /home/ivan/.gemini/antigravity-cli/conversation_summaries.db (1323008 bytes).
- New retained agy conversation 8d8f4dae-b418-46dc-8621-31eb43056f98 (2026-11-08 01:46:44.165813227+00:00). Earlier conversations 72b790ed-cf65-4b86-a4f0-e76815aec42c, 8007c13e-d1b5-459c-ba37-14780e790b06 stay. Previously declared Claude/Codex trust entries stay untouched.
- Still to delete at this entry: the quoted Claude project folder, codex rollout, pi session folder; agy trusted path /var/tmp/akr-1000/5d20/1f23ef6e/akr-e2e-engine-agy and its outside.txt; the recorded tier temp directories {"claude": "/var/tmp/akr-1000/4f79/84737d8d", "codex": "/var/tmp/akr-1000/4f79/46402f38", "pi": "/var/tmp/akr-1000/4f79/9ba61a17", "agy": "/var/tmp/akr-1000/4f79/10a5bfe4"}. The later cleanup entry gives absence and settings comparisons.

### Repair evidence and disposition

- Base of this repair: 405127d350949d4cbba48629d8f64d78239a37b3. Final committed head e3202dff4cf2a660cb26004e1ef3d2e8af883193, tree 084c0ebf3880d50b537e99bbdae21d9ce950613d. Reproduction commit 560218d, product fix e3202dff.
- The same native defect was observed in the existing criterion-3 scenario: check B-AF1-planned-stderr: 1 implementation/check-B-AF1-planned-stderr-1794101997040-3821268.log, 59 pass/1 fail. Its last iteration printed "Invalid input: expected record, received null" before the missing restart resume. Temporary stderr inheritance was restored. Earlier 120 restart-only probes were green and did not establish a readiness cause. The prior uninstrumented failures cannot each be assigned a proven cause.
- Final reproduction command bun test --timeout=30000 tests/hc-listener.test.ts -t 'a cleared foreground': red against the rejected product's src/hc.ts, with the final test including its stderr type annotation, check B-AF1-typed-repro-red: 1 implementation/check-B-AF1-typed-repro-red-1794102299490-3855691.log; green on e3202dff, check B-AF1-repro-case-green: 0 implementation/check-B-AF1-repro-case-green-1794102360804-4039670.log, 1 pass, 4 assertions, 0.35 s. The temporary rejected source was restored before the committed-head proofs.
- Acceptance by planned tests B did not write: check B-AF1-final-listener: 0 implementation/check-B-AF1-final-listener-1794102324725-3858084.log, 4 pass, 23 assertions, 6.75 s, includes the existing full listener and deploy scenarios unchanged. check B-AF1-planned-proofs: 0 implementation/check-B-AF1-planned-proofs-1794102250595-3844884.log, 31 pass/188 assertions across hc-start, hc-delivery, hc-identity, hc-window-calls, hc-teardown, hc-status and hc-watcher. All planned unit/real-core criteria affected by shared hc parsing are also green in verify. Unchanged scoped grep, old-test replacement inventory and unrelated earlier proofs remain valid.
- Test-Change audit for this pass: 560218d adds only the review-A/F1 native-core bug reproduction to tests/hc-listener.test.ts. e3202dff changes only its stderr read type after the real typecheck diagnosed TS2345 (check B-AF1-format-type: 2 implementation/check-B-AF1-format-type-1794102218482-3844435.log). The listener helper declares broad Bun.Subprocess but launches with stderr=pipe. The cast records that invariant. No existing expectation or fixture was corrected. Both trailers are accepted against the concrete failing sources above.
- Verify receipt 3ed67bb9-ff0b-40dd-b088-7e0f90e57484 on e3202dff: setup/format/typecheck/test all exit 0. Format implementation/check-format-1794102322729-3859267.log, typecheck implementation/check-typecheck-1794102325042-3859267.log, test implementation/check-test-1794102401241-3859267.log. Full test: 1268 pass, 0 fail, 12277 assertions, 76.14 s against 75 s baseline. No merge_checks ran.
- K-B2 cleanup: check B-AF1-live-cleanup: 0 implementation/check-B-AF1-live-cleanup-1794102496726-4175961.log. Authenticated filesystem/settings read-back in implementation/B-AF1-absence.json has left=[], target trust absent, all 10 prior trustedWorkspaces entries unchanged and all other agy settings unchanged. Removed the quoted Claude/Codex/pi transcript files/folders, the exact agy trust entry, outside file and seven recorded kinds/window temp folders. Core, window, state, cwds and tier runtime/home/root paths are absent. Only declared retained trust entries and agy conversations remain.
- review-A/F1 repaired. Previous review-A/F2 and review-B/F1/F2/F3 closures stand. No Handed to A items, operator actions, unresolved Fixes or held Nits remain. No new reusable Nit is held. Documented user behavior is restored, so no doc correction is needed. Ready for merge.
