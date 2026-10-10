# Intake: main health

## Operator notes, verbatim, 2026-10-10

- "I'm getting a bunch of new fails now. Is this supposed to happen? Look at all the tabs. This has never happened before these latest merges."
- "because this is not normal, honestly."
- "This is also becoming systemic. WE need to see what's wrong. Watch framework already seeded this. So do akrogon pull and let's solve that here right now."
- "Think about it from the systems perspective and systems thinking. What are the inputs and outputs of the stock flow that are destroying the stock? What is the inflow and outflow? Look at all the reinforcing loop and balancing loops and see what the problem is here and whether we can solve it in one simple and elegant solution."
- Operator screenshots (watch-framework pane, 2026-10-10 17:52-17:54): seeds A1 = framework#221, A2 = akrogon#77, A3 = akrogon#78; watch's view: "Nothing owns 'is main healthy right now'"; F1 unmonitored stock of defects on main, F2 slow repeated discovery (every leaf runs a 15-minute verify), F3 gates depend on machine state, F4 manual unreliable recovery; proposal: run framework:verify on main after each merge and after any root install, notify once and hold dispatch when red (#76 plus a trigger).

## Imported seeds (verbatim copies below)

---

# test:motion-probe fails on main: probe reports reveal-section not visible after scroll while the Playwright spec sees it visible

Source: Tamdoma/tamdoma-framework#220
URL: https://github.com/Tamdoma/tamdoma-framework/issues/220

Unverified intake.

## Observation
`bun run test:motion-probe` exits 1 on main `5cb74c3c6` (2026-10-10):
`MISMATCH reveal/reveal-section after.visible: expected true, got false`.
All 4 Playwright tests pass (reveal, accordion, drawer, disconnected). The blepsis probe stage then records `reveal-section` as not visible after the scroll, while the Playwright observation for the same item is visible, so the comparison in `run.js` fails.
Two leaves reproduced it independently. `spawn-deadlines` ran the command in a clean detached base worktree after `bun install --frozen-lockfile` and got the same MISMATCH (log `/tmp/akrogon-1000/spawn-deadlines-11e0a0ced3b7/base-motion-probe.log`). `selected-check` recorded the identical failure in its `implementation/report.md`. Neither leaf diff touches the probe. `spawn-deadlines` stopped as `failed` because `framework:verify` cannot go green.

## Location
`bun run test:motion-probe` -> `.claude/skills/test-audit-design-impeccable/test/motion-probe/run.js` (comparison at the `after.visible` check) and `motion-probe.spec.ts` (reveal test). Also fails any `framework:verify` run, since `test:motion-probe` is its only failing stage in the `spawn-deadlines` run.

## Reproduction
1. Check out main `5cb74c3c6` in a clean worktree.
2. `bun install --frozen-lockfile`
3. `bun run test:motion-probe`
Reproduced in 2 leaf runs plus the leaf's own verify run. Not tried on other machines. When it first went red is not provided.

## Expected behavior
The probe's `after.visible` for `reveal-section` matches the Playwright observation (visible) after the same scroll, and `test:motion-probe` exits 0.

## Urgency
Medium-high. Every `framework:verify` and select-all run exits 1 until fixed, which blocks leaves that must prove a green verify. Workaround: none known. Leaves record it as a base failure and stop.

## Suspected cause
Agent view, weak. The Playwright reveal test waits up to 5 s for visibility with `expect.poll` after `reach(page, item)`. The blepsis probe may read visibility right after the scroll without that wait, or the reveal observer/transition may not fire in the probe's tab. Neither was checked.
Files read: `run.js` lines 60-120, `motion-probe.spec.ts` lines 70-92, the base log above, and the `spawn-deadlines` and `selected-check` reports. Not read: the blepsis probe script, `probe-map-reveal.json`, `reveal.html`.
Would disprove: the probe sampling after a wait still reporting not visible.
Related: Tamdoma/tamdoma-framework#207 (merge bounces, mentions motion-coverage-probes only, not this failure). No other report of this failure found (search "motion-probe", all states, 1 result).

---

# hooks:selftest C8 passes or fails by where the checkout sits and what the root installed: nested worktrees resolve ffmpeg-static from the parent checkout

Source: Tamdoma/tamdoma-framework#221
URL: https://github.com/Tamdoma/tamdoma-framework/issues/221

Unverified intake.

## Observation
`bun run hooks:selftest` fails on one test, `C8: missing ffmpeg-static/ffprobe-static fails the run naming the dependency; no PATH spawn happens` (`.claude/hooks/tests/video-intake-optimizer.test.ts:625`), when run from a worktree under `issues/worktrees/<slug>`. Terminal result in `fail-fast`: 3490 pass, 1 fail on a detached base worktree of main `5cb74c3c6`, `Expected: not 0` at line 635. The same command in a base worktree outside the checkout (`/tmp/...`) passed, 3491 pass, 0 fail.
The test renames `<worktree>/node_modules/ffmpeg-static` and `ffprobe-static`, then spawns the optimizer and expects a non-zero exit. From a nested worktree the optimizer still finds both packages in the parent checkout's `node_modules` and exits 0.
Timeline 2026-10-10 (local): the root `node_modules/ffmpeg-static` was installed at 13:29. After that, `cheap-checks`, `fail-fast` and `page-measure-full-id` each reproduced the red on base and went `failed` (`blocked`). At 15:44 the root copies were removed by hand as a stopgap. A later root `bun install` would restore them and the failure.

## Location
`.claude/hooks/tests/video-intake-optimizer.test.ts:625-641` (C8, `NODE_MODULES = path.resolve(import.meta.dir, '../../../node_modules')`), `.claude/skills/_shared/scripts/video-intake-optimizer.ts:173-185` (`createRequire(import.meta.url)`, `binaryPath`), `bun run hooks:selftest`.

## Reproduction
1. Have `ffmpeg-static` and `ffprobe-static` in the root checkout's `node_modules` (any root `bun install` of current `package.json`).
2. Create a worktree under `issues/worktrees/<slug>` and run `bun install --frozen-lockfile` there.
3. `bun run hooks:selftest` or `bun test --isolate ./.claude/hooks/tests/video-intake-optimizer.test.ts`: C8 fails.
Reproduced by three leaves independently. Not tried with the dependency absent from the root.

## Expected behavior
C8 gives the same result in the root checkout, in a nested worktree and in `/tmp`, whatever the parent directories contain.

## Urgency
High while it lasts. It failed three leaves and blocks merge of any leaf whose gate runs selftest in a worktree. Workaround: remove the two packages from the root `node_modules` (breaks video intake in the root until the next root install).

## Suspected cause
Agent view, supported by two leaf reports. The test hides only the checkout-local package directory, but module resolution also walks ancestor directories. `spawn-deadlines/implementation/report.md` adds that both system Bun 1.4.2 and the pinned 1.4.3-canary auto-install missing packages into `~/.cache/.bun/install/cache`, a second way around directory hiding. The test therefore depends on checkout location, parent directories and the user cache, none of which are in git.
Files read: the test lines above, `page-measure-full-id/implementation/report.md`, `fail-fast/review-B.md`, `cheap-checks/review-B.md`, `spawn-deadlines/implementation/report.md` (that leaf's diff changes the C8 mechanism and is itself failed on #220). Not read: the optimizer source itself beyond the cited lines.
Related: Tamdoma/tamdoma-framework#220 (separate base red, motion-probe), #207 (merge bounces). No other report of C8 found (search "C8 ffmpeg" and "video intake", all states).

---

# Heavy check runs from all seats share one host with no concurrency limit; load flakes bounce leaves at merge

Source: Tamdoma/akrogon#69
URL: https://github.com/Tamdoma/akrogon/issues/69

Unverified intake.

## Observation
Up to `max_active: 20` seats run full test suites on one host at the same time: leaf `checks`, review reruns, and the merge turn's `merge_checks`. Nothing limits how many heavy runs overlap. Consumer `Tamdoma/tamdoma-framework` 2026-10-07..08: 7 merge bounces were load flakes in the full gate (deploy EPIPE x2, 5 s timeouts x3, a cache miss, a nested `bun test --isolate` zombie stall), plus 2 runtime-record failures, out of 34 classified bounces.

## Location
akrogon seat dispatch and check execution: `src/config.ts:25` (`max_active`), `src/next.ts:323-336` (`activeCount` counts leaves, not running checks), merge turn `merge_checks`.

## Reproduction
Run 10+ active seats that each start full suites while the merge turn runs `merge_checks`. Timeouts and EPIPE failures in the merge run increase. Frequency on framework: about 7 bounces in 36 h.

## Expected behavior
A merge run fails only because of the code under test, not because other seats saturate the host.

## Urgency
Medium. Each flake bounce costs a full gate run plus a check.fix round and a re-queue. Workaround: lower `max_active` by hand, which slows all phases.

## Suspected cause
Agent and Codex/Fable consult view: the only capacity control is the count of active leaves. Heavy check processes are not counted or queued, so peak load follows how many seats happen to test at once. The link from seat load to flake rate is inferred from timing, not measured.
Files read: `src/config.ts`, `src/next.ts` (`activeCount`).
Not inspected: host CPU/memory at the failing timestamps. Would disprove: flake bounces at times with few concurrent check processes.
Related reports: Tamdoma/tamdoma-framework#207 (lists the load flakes), Tamdoma/tamdoma-framework#208 (lane race on shared files, a separate isolation defect), Tamdoma/akrogon#53 (closed, merge_checks timeouts under seat load). Searched Tamdoma/akrogon all states: "concurrent verify load" (none).

---

# Red main fails leaves one by one at implement and check.review: each reruns a full verify to find it, nothing tells the operator main is red

Source: Tamdoma/akrogon#76
URL: https://github.com/Tamdoma/akrogon/issues/76

Unverified intake.

## Observation
Consumer `Tamdoma/tamdoma-framework`, 2026-10-10. Main `5cb74c3c6` was red on two checks the leaves did not touch. Seven leaves were running in `merge-gate` and `formspark-api`.
- `bun run hooks:selftest` C8 (video-intake ffmpeg-static) failed on base. Three leaves (`cheap-checks`, `fail-fast`, `page-measure-full-id`) each ran their own base comparison, reproduced it, and went `failed` (`blocked@implement` or `blocked@check.review`). Their `implementation/report.md` files record a full `framework:verify` of about 15 min each.
- `test:motion-probe` (`MISMATCH reveal/reveal-section after.visible`) failed identically on base. `spawn-deadlines` stopped on it (`failed`, `blocked@implement`). `selected-check` recorded the same failure in its report.
- Nothing told the operator that main itself was red. The signal was only in the failed leaves' reports and the `failure.reason` of each.
- The operator moved two of the failed leaves back to `check.review` by hand (`failed -> check.review`, no seat slot, 0.3 s apart in `issues/log.jsonl`) after the root `node_modules` was edited. `fail-fast` was moved separately. `cheap-checks` then failed again at `check.review` on the same cause.

## Location
akrogon phase handling for a leaf whose base comparison is red (`failed` with `cause=blocked`), the watch/operator notification path, and the base-run rule in `skills/check-issue/SKILL.md`. Consumer: `Tamdoma/tamdoma-framework`, `issues/open/merge-gate/*`.

## Reproduction
1. Main turns red on a check no leaf owns (here: a root `bun install` made C8's package-hiding ineffective for worktrees under `issues/worktrees/`).
2. Several leaves reach implement or check.review and run the full gate.
3. Each reproduces the red on base and moves to `failed`.
Seen once on 2026-10-10 with 4 of 9 leaves. Frequency otherwise not provided.

## Expected behavior
When a leaf finds the same base failure another leaf already recorded, it waits instead of rerunning the full gate and failing. The operator is told once that main is red and which check, rather than per leaf. Leaves held by a red base resume when main is green, without a manual `phase` move.

## Urgency
Medium-high. Each affected leaf lost one full verify run (about 15 min wall) and stopped, and the operator had to recover leaves by hand. No known workaround except fixing main and moving each leaf manually.

## Suspected cause
Agent view. No akrogon step tracks main health across leaves. #67 pauses the merge queue while main is red and #64 resumes bounced leaves, but both act at the merge turn. Leaves before merge treat a red base as their own stop condition (`failed`), so every leaf rediscovers it separately and none shares it. The two base reds are consumer defects (a test that depends on directory layout, and a probe/Playwright mismatch not yet diagnosed), so only the handling is claimed to be akrogon's.
Files read: `issues/open/merge-gate/{page-measure-full-id,spawn-deadlines,selected-check}/implementation/report.md`, `issues/log.jsonl`, `observe.ts` output; gh issues #67 and #64 bodies. akrogon source not re-read for this report.
Not inspected: how `check-issue` decides `blocked` vs red, and whether `src/pause.ts` can be driven by a base-red signal.
Related: Tamdoma/akrogon#67 (red main stalls merge queue, closed, merge turn only), #64 (bounced leaf not resumed after main fixed, closed), #47 and #50 (base failures attributed at handoff and check evidence, closed). Consumer report Tamdoma/tamdoma-framework#207 (merge bounces, different repo, not read).

---

# Moving a base-failed leaf back to check.review reuses its recorded base-red evidence: reviewers fail it again within minutes without a fresh run

Source: Tamdoma/akrogon#77
URL: https://github.com/Tamdoma/akrogon/issues/77

Unverified intake.

## Observation
Consumer `Tamdoma/tamdoma-framework`, 2026-10-10. `cheap-checks` and `fail-fast` had failed at check.review with `selftest` red on base. An operator moved both back to `check.review` by hand (`failed -> check.review`, `issues/log.jsonl`, 13:44:44 and 13:45:13 UTC) after removing the cause from the root `node_modules` (13:44:39 UTC). Both went `check.review -> failed` by seat B again, `cheap-checks` after 4 min 4 s (13:48:48) and `fail-fast` after 6 min 27 s (13:51:40), with the same reason.
`fail-fast/review-B.md` says it reused saved logs: "Both saved logs were inspected to their terminal results" (`implementation/ff-leaf-selftest.log` and `ff-base-selftest.log`) and "Existing completed evidence is reused without another full suite". The `cheap-checks` review text is the earlier F1 with the leaf log `/tmp/akrogon-1000/cheap-checks-8809b3689156/cheap-checks-B-leaf-selftest.7eOPHp.log`. Its reported selftest runs took 7 min 5 s (leaf report) and 189 to 227 s (fail-fast), so the 4 min re-review likely did not rerun both.

## Location
akrogon `check-issue` skill (the base-red stop rule and the evidence reuse rule), and what `akrogon phase <slug> check.review` carries over from a failed pass.

## Reproduction
1. A leaf fails at check.review on a base-red check.
2. Fix the base cause outside akrogon.
3. `akrogon phase <slug> check.review` then `akrogon next <slug>`.
Seen twice in the same session. Frequency otherwise not provided.

## Expected behavior
After a leaf re-enters check.review from `failed`, base-red evidence recorded before the move is not reusable. The reviewer reruns the red check on the current head and base before it stops the leaf again.

## Urgency
Medium. Each recovery attempt costs a seat turn and a notification, and the leaf stays failed after the cause is fixed. Workaround: delete the recorded logs and review file before the move, which an operator should not need to do.

## Suspected cause
Agent view, partly confirmed. The check rule lets a reviewer reuse completed evidence "rather than repeating completed broad checks", and the red-on-base stop applies to recorded runs. Nothing marks that evidence stale when the leaf re-enters check.review or when main or the environment changes. Confirmed for `fail-fast` by its own text. Likely for `cheap-checks` from timing only.
Files read: `fail-fast/review-B.md` lines 16-30, `cheap-checks/review-B.md` lines 23-40, `issues/log.jsonl` records for both. Not read: the `check-issue` skill source.
Related: Tamdoma/akrogon#64 (bounced leaf not resumed after main fixed, closed), #47 and #50 (base failure attribution and check evidence, closed), #76 (red main fails leaves one by one, open, filed today).

---

# Busy-seat duration is still only noticed in 'next': formspark-build-wiring ran 4h with notified= empty and no operator notice

Source: Tamdoma/akrogon#78
URL: https://github.com/Tamdoma/akrogon/issues/78

Unverified intake.

## Observation
Consumer `Tamdoma/tamdoma-framework`, 2026-10-10. Leaf `formspark-build-wiring` had seat A busy in `check.fix` for 3h09m to 3h12m at the time of the user's complaint, and kept iterating on a 13-case live-session proof harness (12+ `proof:` commits since 12:51 local, each rerun about 10 min). Every observe line for it showed `notified=` empty. `akrogon next` was not run for this leaf, because it was blocked on a merged sibling and the watch ran no `next` for it. The seat had been busy since 07:36 UTC session start. The user noticed it by eye. No operator notice came from akrogon.

## Location
`src/next.ts` (`STALL_MS` = 60 minutes, `observeBusy`), observe field `notified=`, and the `check.fix` phase of the `implement-issue`/`check-issue` skills.

## Reproduction
1. A leaf stays in a phase with its seat working, and `akrogon next` is not invoked for that leaf.
2. Check `notified=` after 60 minutes busy.
Seen once in this session (4+ hours). Frequency otherwise not provided.

## Expected behavior
A seat busy past a set time in one phase triggers an operator notice once, whether or not `next` ran for that leaf, and the notice names the leaf, phase and elapsed time.

## Urgency
Medium-high. The leaf cost more than 4 hours of wall time and the operator found it by looking. Workaround: run `akrogon next <slug>` often, or a watch that flags elapsed time (not built into the watch skill today).

## Suspected cause
Agent view, same mechanism as the closed #51. The stall notice is only evaluated on the `next` path, so a leaf `next` skips (blocked, or an operator watch that avoids `next` for busy leaves) never notifies. Note the notice is a stall check (60 min), not a per-phase duration against a charted estimate. #75 (closed, merged `975139d`) only added a charting-time estimate line.
Files read: observe output for the leaf, `log-tail.ts` lines, #51 and #75 bodies and comments. Not read: `src/next.ts` itself in this pass.
Related: Tamdoma/akrogon#51 (no duration ceiling, closed 2026-10-01), #75 (closed), Tamdoma/tamdoma-framework#116 (stall notice only in `next`, referenced from #51, not opened).
