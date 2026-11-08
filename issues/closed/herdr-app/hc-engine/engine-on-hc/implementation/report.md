# engine-on-hc implementation report (slot A)

Mode: subagents (wave 1 has two units). Refresh at pass start: fetch, branch up to date with origin/main, AKROGON_BASE 99a256a8, HEAD 9f9045d1.

## Commits

- 834881d2 test: start the rollback cases from a plugin-less seed (A, D26, `Test-Change` trailer). The cases "rollback flips current", "the hold blocks redeploy" and "restores the previous release skill links" deploy releases with `plugin/`, which D22 now refuses; they start from a plugin-less seed. Green before the guard landed: `check port-rollback-base: 0 .../check-port-rollback-base-1794064428452-3656637.log`.
- U5 (worker, cherry-picked): rollback guard D22, `plugin/` deleted, reference-index Integration line removed. `check u5-landed-rollback: 0 .../check-u5-landed-rollback-1794064451630-3659559.log` (rollback + docs-links, 16 pass).

## Condition cases shown red after their decision landed (N4)

- C12.1 guard moved after `flip`: `check c12-1-mutation: 1 .../check-c12-1-mutation-1794064456887-3663619.log` ("rollback refuses a previous release that ships plugin/" fails); reverted.

## Units and notes

- I4 in plan.md re-splits U2/U3 by flow (both rewrite `src/next.ts`). The command-reference contract rows and old-test ports are A's test edits.
- 6efbd57e (U1 worker f4686761, cherry-picked): `src/hc.ts` (I1 interface), `repoPrefix` in `src/config.ts`, init duplicate refusal. Worker checks: `check u1-schema: 0 .../check-u1-schema-1794081888019-227521.log`, `check u1-prettier: 0 ...-1794081888337-227768.log`, `check u1-init: 0 .../check-u1-init-1794081892148-228240.log` (init + config, 50 pass); ad-hoc run against a throwaway core `akw1-1` (stopped and removed). Worker limitations: `hc kill` on a finished terminal exits 0, so `end` has no special case; the doc block schema needs `content.terminal` when `content` is present (a block of another content kind makes the session unreadable); `waitFor` rejects when the stream ends before a match; unverified by the worker: the init refusal end to end and the two-core/unreadable verdicts (covered by `tests/hc-identity.test.ts` after U3).
- 212d845f test: parse the recorded tab in `tests/hc-window-calls.test.ts:48` (A, `Test-Change`): typecheck TS2769, assertion unchanged. After it only `tests/e2e/kinds.e2e.ts` fails typecheck (imports `src/transcript`, U2): `check typecheck-after-u1: 2 .../check-typecheck-after-u1-1794081933456-236111.log`.
- U2 (worker 753b27d2, cherry-picked): `src/seat.ts`, `src/transcript.ts`, `src/session-file.ts` deleted, hc allocation/D13 delivery/`observeBusy`/D14/per-pass rename in `src/next.ts`, state schema additions, `seat` case, `docs/reference/commands.md` row; `src/hc.ts` gained `waitForDoc` (doc events carry no terminal). Worker limitations: reconcile is fed a null pane list (keep everything) until U3; argv starts record `prompted.turn = 0` (the turn the task went in at); the agy resend fires on the first idle/done state of the stream including the snapshot; consultant form only smoke-tested (no planned case); transcript resolver exercised only returning null (real files are the kinds tier); `logMove` warns and writes `session: null` on an `HcError` (as before for herdr).
- Worker mismatches resolved by A:
  - F3 0a9048c6 test: the fixture's scratch runtime moves to `$XDG_RUNTIME_DIR/<session>`: under `akrogon run-check` hc refused the scratch socket link as too long (115 bytes), so every real-core test failed before reaching akrogon (`check u2-landed-start: 1 .../check-u2-landed-start-1794083340633-348224.log`); after: `check f3-start: 0 .../check-f3-start-1794083388997-351047.log`. The planning red runs of the real-core tests were therefore red at least partly for this cause; their intended red was not compared at planning (allowed), and each case is shown green now on the real path.
  - F1 (commit "hold the prompted implement turn open"): hc counts a turn when the status leaves `working`, so a stand-in finishing the implement task before the second pass is a silent stop (D13 step 6). `check f12-delivery-before: 1 .../check-f12-delivery-before-1794083412653-353092.log`; the case now holds the implement turn on the gate: `check f1-delivery: 0 .../check-f1-delivery-1794083434493-357808.log`.
  - F2: D13 step 3 resettles then step 6 prompts the new idle turn; the case now expects `prompted.A.turn = error.turn` and a fresh `not_started` at `error.turn + 1`: `check f2-delivery: 0 .../check-f2-delivery-1794083457772-359277.log`.
- 6aceadb8 test: `seat` in the command contract: `check cmdref-seat: 0 .../check-cmdref-seat-1794083491076-371458.log`.
- After wave 2: `check u2-landed-suites: 1 .../check-u2-landed-suites-1794083484470-361860.log`, 14 pass; the 2 red are U3's first-switch inventory case and U4's `status ... tab unnamed` assertion.
- da1ec596 (U3 worker ca155dc8, cherry-picked): D17 refusal (`predatesHc`/`refusePredatesHc` in `src/state.ts`), teardown `endSeats` (kill then rm) for stop/merged close with `closeTab` only when the window is open, reconcile on `Seen`, pane boxing and herdr pane/tab listing deleted, `observeBusy` and `commitMove`→failed call `wakeWatcher`, phase tab renames through `src/hc.ts`, `land` unit `--setenv=XDG_RUNTIME_DIR`, the dead plugin hook-event path removed. Beyond the brief (accepted): reconcile does not stop the slice of a pre-hc leaf, since hc cannot see old herdr tabs and the pass could kill this leaf's own old-herdr merge slot (plan Q1). Worker checks: `check u3-watcher: 0 .../check-u3-watcher-1794084235798-428360.log`, `check u3-grep: 0 .../check-u3-grep-1794084239096-430858.log` (remaining hits: `observeBusy` notice and `mergeNotice` in next.ts, `herdrCall` used only by `announceFailed` in phase.ts, the kept shell.ts exports, and the `herdr.tab` label key). Worker mismatches resolved by A:
  - M2 03c55d40 test: `hc-teardown` merged case read state from the open path after completion moved it to `issues/closed` (ENOENT).
  - M1 ec928906 test: `hc-identity` no-prefix case passed `undefined`, which took the default prefix.
  - M3 (criterion 7 of brief 3, `tests/fake-busctl.ts` delete): `tests/isolation.ts` builds it for every test and `release-any-phase.test.ts` imports its type; deferred to A's old-test port. `tests/fake-proc.ts` has nothing to trim (every export used by `tests/fake-herdr.ts`).
  - Defect found in review (worker's own limitation): a merged leaf whose seats finished kept them in `hc ls --all` (criterion 13). Reproduction b4014ac4 red: `check repro-finished-red: 1 .../check-repro-finished-red-1794084363674-445732.log`; fix 08a2ee22 (reconcile and the land-wake close end finished seat terminals when no live terminal holds the tab; a broadcast-in-progress leaf is untouched): `check repro-finished-green3: 0 .../check-repro-finished-green3-1794084418287-453312.log`.
- After wave 3: `check u3-landed: 0 .../check-u3-landed-1794084341848-437996.log` (teardown, identity, three watcher cases: 13 pass).
- U4 (worker ad6eb3eb, cherry-picked): `src/listen.ts` (one `follow` per live session plus `fs.watch` on the socket folder and on the real folder of a symlinked socket; catch-up after every snapshot; single flight with one pending pass; wakes on turn, blocked, finished, lost; stream end re-subscribes then `next --resume`; listener watcher wakes, including a seat already finished in the snapshot), `listen` case and `next --wake` (resume sweep without self-update), status `Listener:`/`Watcher:` lines and `tab unnamed`, `systemd/akrogon-listener.service` (install/self-update already handled the unit), docs rows. `src/hc.ts` edited outside the unit (accepted): `follow` skips hc's `heartbeat` lines, which crashed the listener. Worker checks: `check u4-watcher: 0 .../check-u4-watcher-1794085461072-717043.log`, `check u4-status: 0 .../check-u4-status-1794085539030-732424.log`, `check u4-earlier: 0 .../check-u4-earlier-1794085649524-747098.log`. Worker limitations: status prints Watcher lines only for the repos it shows; every listener start wakes the watcher for repos with unremoved finished seats; the `restarted` wake is untested (hc 0.1.18 reported `finished` for a `--keep` program exit); in `tests/hc-watcher.test.ts` the listener's passes ran the installed akrogon from the process PATH under the fixture's HOME/AKROGON_HOME (`pull --all` exit 1, `next --resume` exit 0, `next --wake` rejected by the old parser) with no action seen outside the fixture (R1 below).
- Review fix by A: `wakeWatcher` resolved the space through the per-process memo, so the long-running listener kept a stale or failed lookup forever; it now resolves fresh (commit "hc: resolve the repo space fresh for each watcher wake"). No reproduction case: producing a memoized failed lookup needs a wake before the space exists; `check wake-fresh: 0 .../check-wake-fresh-1794085860311-763549.log` shows no regression. Recorded as unreproduced for review.
- Worker mismatches resolved by A:
  - M1 test: `hc-listener`'s `until()` missed back-to-back appends (Bun `fs.watch`); re-checks 20 ms after each event: `check m1-listener-1/2/3: 0` (`.../check-m1-listener-1-1794085887204-766419.log` and the two after it).
  - M4 15864e3f test: `listen` and `--wake` in the command contract (both cases, including the reordered-alternatives case): `check m4-cmdref3: 0 .../check-m4-cmdref3-1794085926585-770998.log`.
  - M3 aab967b8 test: four `tests/status.test.ts` cases compare boards without the liveness lines (they read the host's systemd manager; `hc-status` covers them on a fake): `check m3-status2: 0 .../check-m3-status2-1794086150830-1194144.log`.
- 4b8914d3 test: every test gets a scratch `XDG_RUNTIME_DIR` (bus/systemd links only). Before it, tests outside the hc fixture probed and read the operator's live hc sessions through `sessions()`/`docGet` (status tests). Neutral on the failing set: `check suite-head-base: 1 .../check-suite-head-base-1794086119033-981834.log` and `check suite-isolated: 1 .../check-suite-isolated-1794086050650-778009.log` fail the same test names.
- R1 resolved (commit "run the watcher listener's passes from the checkout under test"): `check r1-watcher: 0 .../check-r1-watcher-1794086193913-1200491.log`.

## Other evidence this pass

- Criterion 14 grep: `check c14-grep: 0 .../check-c14-grep-1794086330154-1213727.log`. Every hit is a kept notice send (`observeBusy` notice and `mergeNotice` in `src/next.ts`, `herdrCall` used only by `announceFailed` in `src/phase.ts`), a kept `src/shell.ts` export, or the `herdr.tab` label key. `plugin/` is absent, and the `herdr integration install` loop is still at `src/install.ts:150`.
- N4 condition mutations (each reverted, tree clean after):
  - Red as intended:
    - C1.1 (task sent twice): `check mut-C1.1: 1 .../check-mut-C1.1-1794086265632-1205652.log`
    - C1.2 (no `not_confirmed` record): `check mut-C1.2: 1 ...-1794086269108-1206167.log`
    - C3.2 (no single flight): `check mut-C3.2: 1 ...-1794086276344-1207500.log`
    - C4.2 (`attempts` kept across a move): `check mut-C4.2: 1 ...-1794086281920-1208727.log`
    - C5.2 (resend twice): `check mut-C5.2: 1 ...-1794086299632-1210985.log`
    - C11.1 (wake sent to a working watcher): `check mut-C11.1: 1 ...-1794086305315-1211993.log`
    - C12.1: as above.
  - Green, so the planned case does not catch the violation (gaps for review):
    - C3.1 (catch-up enqueued before subscribing): `check mut-C3.1: 0 ...-1794086276011-1206791.log`. The subscription still completes while the shim holds the catch-up.
    - C4.1 (D13 step 5 dropped): `check mut-C4.1: 0 ...-1794086278206-1207912.log`. Step 1 (busy seat) refuses first, because the gate holds the prompted turn working.
    - C5.1 (D13 step 2 dropped): `check mut-C5.1: 0 ...-1794086297113-1209770.log`. Step 5 still blocks a resend on an unchanged turn, and the end state is the same.
    - C6.1 (liveness probe skipped): `check mut-C6.1: 0 ...-1794086300369-1211511.log`. The case checks the killed core's own socket, while an hc call through akrogon's scratch link resolves elsewhere. No stray core was left (checked `/run/user/<uid>/herdr-core` and the serve processes).
- Docs: `docs/reference/commands.md` gained the `seat` and `listen` rows and `next --wake`, and the `install` row now names the listener unit (U2/U4). `docs/reference-index.md` lost its Integration line (U5). `src/AREA.md` and `tests/AREA.md` were updated at 40 lines (e92a79c9): the `tests/AREA.md` lines for session-routing, session-reads and seat-containment wait on the old-test decision below. `check docs-links: 0 .../check-docs-links-1794086369345-1214930.log`.
- Not run this pass: the attended window tier (criterion 7 live half), the paid kinds tier (criterion 9), the criterion 15 timing, and `akrogon verify`. Grant `grants[0]` count line: 0 harness sessions launched this pass (prior use 0: planning count line P-1 started 0 sessions), so 0 of 8 are used.

## Blocker (pass 1, resolved by operator decision O1): the old test suite needed an operator decision

- Input: plan decision D26 (old tests ported by A during implement), already flagged by plan note N8.
- Attempted operation: making the `test` check green on head e92a79c9 so that `akrogon verify` can write the receipt the `check.review` move requires.
- Error: about 400 old tests fail on head e92a79c9 (`check suite-isolated: 1 .../check-suite-isolated-1794086050650-778009.log`, 949 pass and 401 fail, before the status fix). By file: next 200, reconcile 38, batch-dispatch 23, pause-next 16, session-routing 15, green-merge 13, leaf-slices 11, seat-containment 10, release-any-phase 10, leaf-stop 10, session-reads 9, phase 8, state-inventory 6, worktree-store 5, timing 5, store-sweep-safety 4, keep-rule 3, shell 2, merge-attempts 2, install 2 (failing before U4 too, per the U4 worker), and one each in rollback-record, pull, durable-capture and dependents-first. They drive the removed herdr pane path through the fake herdr database (panes, tabs, agent start and prompt records) and the deleted plugin hook events (`HERDR_PLUGIN_EVENT_JSON`), so no helper-level shim can port them. Each case needs a rewrite onto `tests/hc-fixture.ts`, or a deletion that names its reason (removed behavior: layout, focus, agent naming, session-file settlement, pane boxing, hook gating) or the hc test that still catches the same bug. `implementation/old-tests-inventory.md` has the per-file tags.
- Why A stopped: implement-issue allows A three test edits during implement (one wrong-expectation correction in a planned test, one reproduction test, check.fix cases). Rewriting or deleting about 400 existing tests is none of them. The locked design (tests Q1, "each leaf ports its own tests") puts the port in this leaf, and the plan put it in implement (D26). This pass made only small edits to existing tests that the new behavior forces, each with a `Test-Change` trailer, for B to judge: 834881d2 rollback seed, the `seat`/`listen`/`--wake` command contract rows, aab967b8 status boards, 4b8914d3 scratch runtime dir.
- Owner: the operator.
- Next action (operator, choose one):
  1. Authorize A to port the old suite in this leaf's next implement pass under D26. Each file goes in its own commit with a `Test-Change` trailer naming the brief outcome or the replacing hc test. The pass also deletes `tests/fake-busctl.ts` and its build in `tests/isolation.ts` (U3 brief criterion 7).
  2. Or send the leaf back to planning to port the suite at `plan.synthesis`, before product code, as the plan-issue order expects.
- Head at stop: e92a79c9. Base: AKROGON_BASE 99a256a8. The branch was not refreshed this pass after the start-of-pass refresh. Every unit (U1 to U5) has landed and every worker worktree is removed.

## Implement pass 2 (2026-11-08): old-suite port, tiers

Authority: plan.md O1 (port authorized in implement) and O2 (claude's kinds-tier folder). Refresh at pass start: fetch, `origin/main` still 99a256a8 = AKROGON_BASE, so no rebase. Head at pass start e92a79c9, at stop ac63d6a6. Brief for the ports: `implementation/port-brief.md`. Ports ran in forks of this A session (p1 to p6), each in its own worker worktree. A reviewed each diff and cherry-picked it, then removed every worktree. A ported shell, install, rollback-record, pull, durable-capture, seat-containment, hold-retired and the remaining next.test.ts refusal cases itself.

### Starting point

`check suite-port-start: 1 .../check-suite-port-start-1794091141822-1372888.log`: 953 pass, 397 fail in 25 files (next 200, reconcile 38, batch-dispatch 23, pause-next 16, session-routing 15, green-merge 13, leaf-slices 11, seat-containment 10, release-any-phase 10, leaf-stop 10, session-reads 9, phase 8, state-inventory 6, worktree-store 5, timing 5, store-sweep-safety 4, keep-rule 3, shell 2, merge-attempts 2, install 2, rollback-record 1, pull 1, durable-capture 1, dependents-first 1, hc-listener 1). The five small files pass on the base (`check small-files-base: 0 .../check-small-files-base-1794091458362-1585386.log`), so their reds came from this leaf.

### Shared test changes

- 626b6325 `hcFixture`/`delivered` in `tests/hc-fixture.ts`: one fixture core per test, both seats on the stand-in, prefix `rp`; clean stops the core.
- e4b009f2 `hcFixture` gives akrogon a fake systemctl in its own folder after `f.home/bin`. A leaf slice is named from repo and slug only, so a real stop from reconcile or `stop` ended concurrent cases' seats (seen by forks p1 and p3). An earlier draft put the fake as a symlink in `f.home/bin`. A leaf-slices case then wrote its stub through that link and overwrote `tests/fake-systemctl.ts` with a script that waits forever. Every systemctl call hung, one run leaked 93 test cores (stopped with `hc server stop`, load average peaked near 8800), and the draft was reverted before any commit.
- 97b10e10 `tests/fake-busctl.ts` deleted with its build in `tests/isolation.ts` and its link in `fakeHerdr` (brief-3 criterion 7, O1). d3871ca7 drops the dead `FAKE_BUSCTL_HOME` from verify's forwarded env. 448f66a1 updates `tests/AREA.md` (39 lines).

### Ports, by file (every commit carries a `Test-Change` trailer; deleted cases are named with reasons in each commit body)

- next.test.ts: 196 cases pass (`check port-next-leftovers: 0 .../check-port-next-leftovers-1794095122634-1841933.log`). About 60 deleted:
  - hook events: 14
  - herdr layout, focus and allocation: 17
  - herdr session data: 4
  - herdr prompt failures and error decoding: 7
  - session-file settlement: 9
  - prompt-reset cases contradicted by D13: 2
  - duplicate or removed state: about 5
  
  248d7934 moves the 12 refusal cases still on fake herdr to hcFixture. Their "no dispatch" checks read fake herdr prompts, which hc dispatch never writes, so they proved nothing.
- reconcile, leaf-slices, state-inventory, store-sweep-safety, keep-rule, worktree-store: 88/88, 0 deleted (`check port-p2-all: 0 .../check-port-p2-all-1794091945280-1753319.log`).
- batch-dispatch, green-merge, pause-next, dependents-first, merge-attempts, timing: 89/89, 4 deleted. These are the pane-boxing broadcast case (D21) and the three plugin hook variants (`check port-p3-all: 0 .../check-port-p3-all-1794092338160-1964110.log`).
- session-routing, session-reads, phase: 86/86 on the branch (`check port-p5-on-branch: 0 .../check-port-p5-on-branch-1794094464574-1596391.log`). 9 deleted for removed herdr routing, hook gating or the error-code split, or because an hc test catches the same bug. 7efe807a ports the two source-closure cases to D14: the move's own-leaf pass retries a failed closure once in the same command. That is the old next-pass retry, now immediate. Recorded for B as a D14 consequence (extra gh calls after a failed closure).
- leaf-stop, release-any-phase: 24 ported, 0 deleted (`check p6-busctl-smoke: 0 .../check-p6-busctl-smoke-1794094685921-1645208.log`). The release-any-phase lock race now parks inside the seat's `hc run`. Its tab_closed case now asserts that the slice is kept (D6 keeps the tab id) instead of a new tab id and a stopped slice.
- seat-containment.test.ts deleted, 10 cases (D21 pane boxing).
- shell, install, rollback-record, durable-capture, hold-retired ported. pull's plugin startup case was deleted; `tests/hc-listener.test.ts` asserts the startup order.
- 66d7e4a4 is a port-introduced race. The self-slice case's real seat emptied its slice when the tab closed, and another case's real host slice step stopped the empty slice ("Transaction ... is destructive", `check suite-after-port: 1 .../check-suite-after-port-1794095251668-1911202.log`). A sleeper now holds the slice; the pass reads a fake cgroup root.

### Checks

- Full suite on 66d7e4a4: `check suite-after-port-2: 1 .../check-suite-after-port-2-1794095476865-2231852.log`, 1264 pass and 1 fail. The failure is the planned listener case, at its last step: after `hc server restart` no catch-up `next --resume` ran within 15 s. It passed 3 times alone and once under a heavier mixed load (`check listener-load-dbg`). It also failed the same way in `check suite-port-start`. Cause unconfirmed. The likely candidate is that the listener's re-subscribe after a core restart misses readiness under load (`src/listen.ts` scan and socket watch). Recorded as an open risk for B, not fixed. Typecheck: 0 errors repo-wide.
- `akrogon verify` on 66d7e4a4: green. That covers setup, format, typecheck and test, with test at 1265/1265 in 76.23 s (`verify test: 0 .../check-test-1794095738052-2648798.log`). The later commits touch only `tests/e2e/*.e2e.ts`, which the `test` check does not run. The next pass reruns verify on its head.
- Criterion 15: the verify test duration is 76.23 s against the 75 s median baseline, about +1 s. Replaced old tests are named in the commit bodies listed above.

### Window tier (criterion 7 live half): green

`check window-tier: 0 .../check-window-tier-1794096461414-2984176.log` on 095b19e2. Artifacts are in `implementation/window-tier/` (closed-then-open.json, open.json, consultants.json, status-before/after.txt, absence.txt = `absent`). Two tier commits correct its machinery to real output:
- 352cb1ba: a herdr-app session home exists only once its window has opened, and D12 refuses a session without one ("herdr-app home for session akr-e2e-engine is missing"). startTier opens and stops the window once and drops the core state herdr-app left. stopTier always deletes the session.
- 095b19e2:
  - `hc wait` exits 0 at its timeout (reason "timeout").
  - herdr-app writes its document after answering `do` (the failed tab read "" and then "e2e-failed failed" 1.5 s later), so document checks wait up to 10 s.
  - `herdr-app status` names the focused pane `focused_pane`.
  - `herdrapp session list --json` returns an object with a `sessions` array that uses `session_dir`.
  - The seat worktrees left under the leaf temp are now removed.

These are more planned-test corrections than the one per pass the skill names. B judges them.

### Kinds tier (criterion 9): red, operator decision needed (Blocker below)

Count lines are below. 2 of 8 granted sessions are used, both claude launches that stopped at the trust dialog; no model prompt was sent. Pre-existing defect seen on the way and not fixed here (outside this leaf): `emitEnvFile` (`src/next.ts`, c4a9ffdd) renames its temp file from the repo's git dir into the worktree, so a `worktree_root` on another filesystem than the repo fails with EXDEV.

## Blocker (pass 2): Claude's folder-trust dialog stops the kinds tier

- Input: criterion 9, `tests/e2e/kinds.e2e.ts`, grant `grants[0]`, plan O2.
- Attempted operation: the claude kind's `akrogon seat` in akr-e2e-engine. K-1 ran in a leaf temp worktree. K-3 ran in O2's `/tmp/akr-e2e-engine-claude`, with the tier root moved to `/tmp/akr-e2e-engine` because of the EXDEV defect above.
- Identity: the operator's existing claude login (Claude Code 2.1.319), user ivan.
- Error: both launches stopped at "Quick safety check: Is this a project you created or one you trust?" (`implementation/kinds-tier/claude-start.txt`). A leaf seat always runs in the leaf's git worktree. Claude treats that worktree, a worktree of the tier's untrusted throwaway repo, as its own project, so the trusted, non-git `/tmp` does not cover it. Real leaves run in worktrees of registered, trusted checkouts, which see no dialog.
- Why A stopped: answering the dialog writes `~/.claude.json`, which the grant's stop line forbids ("never Claude settings writes"). The tier gives no other way to reach a trusted git project without new proof machinery.
- Owner: the operator (door).
- Next action (operator, choose one):
  1. Allow the claude kind to accept the trust dialog for its throwaway folder. That writes a `~/.claude.json` `projects` entry, which the tier's cleanup removes after the run.
  2. Name a trusted git repository whose throwaway worktree the claude kind may use, for example a worktree of `/home/ivan/Work/infra/akrogon`, which Claude trusts. That widens the grant's targets.
  3. Accept the claude part of criterion 9 from other evidence, and run only codex, pi and agy in the tier.
- State at stop: head ac63d6a6, worktree clean, no worker worktrees, akr-e2e-engine absent, no `akr-e2e` entry in `~/.claude.json`, no claude transcript folder. Sessions used: 2 of 8.

## Implement pass 2: grant count lines

- Count line K-1 (kinds tier `tests/e2e/kinds.e2e.ts` on head 095b19e2): grant `grants[0]`, bound 8 harness sessions (at most 4 prompts each), count so far 0 (planning P-1: 0 sessions; implement pass 1: 0), unit harness session. Expected: 4 sessions (claude, codex, pi, agy), 2 prompts each. Outcome: red at the first kind (`check kinds-tier: 1 .../check-kinds-tier-1794096557533-2987439.log`). The claude seat started (terminal t2) and stopped at Claude Code's folder-trust dialog for `/var/tmp/akr-1000/5d20/1f23ef6e/akr-e2e-engine-claude` (`implementation/kinds-tier/claude-start.txt`: "started, not confirmed t2"). No task reached the model, and codex, pi and agy were not launched. Harness sessions: 1 (claude, live stage reached, no model prompt). Count after: 1 of 8. IDs: terminal t2 in akr-e2e-engine (removed by the tier's cleanup). Cost: none known. Absence after: `{"left":[],"trusted_added":[]}`.
- Count line K-2 (kinds tier on head ac63d6a6, plan O2): grant `grants[0]`, bound 8 harness sessions (at most 4 prompts each), count so far 1 (K-1), unit harness session. Expected: 4 sessions (claude, codex, pi, agy), 2 prompts each, so at most 5 of 8 after. New claude cwd recorded before use: `/tmp/akr-e2e-engine-claude` (a fresh folder under the trusted, non-git `/tmp`; removed by the tier's cleanup). The other cwds stay under the leaf temp (`implementation/kinds-tier/cwds.json`). The stuck K-1 claude terminal t2 was already killed and removed by the tier's own cleanup (absence check `{"left":[],"trusted_added":[]}`, no akr-e2e-engine socket, app home or core state left), and it stays counted. Outcome: red before any harness launch (`check kinds-tier-2: 1 .../check-kinds-tier-2-1794096684002-2993278.log`). akrogon's leaf `.env` write (`emitEnvFile`, `src/next.ts`, since c4a9ffdd 2026-10-11, not this leaf's code) renames a temp file from the repo's git dir into the worktree, and `/tmp` (tmpfs) and the leaf temp (btrfs) are different filesystems: `EXDEV: cross-device link not permitted, rename '.../akr-e2e-engine-kinds-root/.git/worktrees/akr-e2e-engine-claude/akrogon-env-2993690' -> '/tmp/akr-e2e-engine-claude/.env'` (`implementation/kinds-tier/claude-start.txt`). Harness sessions: 0. Count after: 1 of 8. Absence after: `{"left":[],"trusted_added":[]}`; `/tmp/akr-e2e-engine-claude` absent.
- Count line K-3 (kinds tier on head ac63d6a6, plan O2): grant `grants[0]`, bound 8 harness sessions (at most 4 prompts each), count so far 1, unit harness session. Expected: 4 sessions, 2 prompts each, so at most 5 of 8 after. Deviation, for review: to keep O2's claude folder `/tmp/akr-e2e-engine-claude` while the tier's repo shares its filesystem, the run uses `AKROGON_E2E_ROOT=/tmp/akr-e2e-engine`, a fresh folder recorded here before use and removed after. So the tier repo and the codex, pi and agy cwds sit in `/tmp/akr-e2e-engine/` instead of the leaf temp. Paths: `/tmp/akr-e2e-engine-claude`, `/tmp/akr-e2e-engine/akr-e2e-engine-{codex,pi,agy}`, `/tmp/akr-e2e-engine/akr-e2e-engine-kinds-{root,home}`, `/tmp/akr-e2e-engine/akre2e-rt-kinds`. Outcome: red at the first kind (`check kinds-tier-3: 1 .../check-kinds-tier-3-1794096802972-2995071.log`). The claude seat (terminal t2) stopped at the same folder-trust dialog, now for `/tmp/akr-e2e-engine-claude` (`implementation/kinds-tier/claude-start.txt`). That folder is the leaf's git worktree, as every leaf seat folder is, so Claude does not treat it as covered by the trusted, non-git `/tmp`. The dialog was not answered, and `~/.claude.json` has no `akr-e2e` entry. No task reached the model, and codex, pi and agy were not launched. Harness sessions: 1 (claude, live stage reached). Count after: 2 of 8. Cleanup: the tier's absence check reads `{"left":[],"trusted_added":[]}`; `/tmp/akr-e2e-engine-claude` and `/tmp/akr-e2e-engine` were removed; no akr-e2e-engine socket, app home, core state or Claude transcript folder remains.


## Implement pass 3 (2026-11-08): kinds tier under plan O3

- Commit 72049f8b restores every kind's cwd to the leaf temp (O2's `/tmp` cwd withdrawn) and answers the claude seat's folder-trust dialog once, inside the start verb's proof window, with a `Test-Change:` trailer citing O3 and `implementation/kinds-tier/claude-start.txt`.
- Key note, for review: O3 and the grant name `hc keys enter`. K-3's real screen shows the dialog's cursor on "No, exit", where Enter alone would exit Claude and waste a counted session. The tier reads the screen and presses `down enter` when the cursor is on "No, exit", `enter` when it is on "Yes, I trust this folder". The effect is the one O3 authorizes (answer Yes for the recorded throwaway cwd). The keys sent are kept in `implementation/kinds-tier/claude-trust.txt`.

## Implement pass 3: grant count lines

- Count line K-4 (kinds tier `tests/e2e/kinds.e2e.ts` on head 72049f8b, plan O3): grant `grants[0]`, bound 8 harness sessions (at most 4 prompts each), count so far 2 (K-1, K-3), unit harness session. Expected: 4 sessions (claude, codex, pi, agy), 2 prompts each, so at most 6 of 8 after. Cwds recorded before use: `/var/tmp/akr-1000/5d20/1f23ef6e/akr-e2e-engine-{claude,codex,pi,agy}`. The claude cwd gets the retained `~/.claude.json` projects entry (readiness.yaml `retained[0]`).
  - K-4 outcome: red before any harness launch (`check kinds-tier-4: 1 .../check-kinds-tier-4-1794097448344-3014654.log`). The env vars were set outside `run-check`, which does not forward them, so `required('AKROGON_E2E')` threw at the first line. Harness sessions: 0. Count after: 2 of 8. No tier was started, so nothing needed cleanup.
- Count line K-5 (same tier, head 72049f8b, env passed through `env` inside the run-check command as in K-1 to K-3): grant `grants[0]`, bound 8 harness sessions (at most 4 prompts each), count so far 2, unit harness session. Expected: 4 sessions, 2 prompts each, so at most 6 of 8 after. Same cwds as K-4.
  - K-5 outcome: red at the claude kind's transcript step (`check kinds-tier-5: 1 .../check-kinds-tier-5-1794097481720-3015153.log`, wall 10 s). The trust step worked: the cursor was on "No, exit", the tier pressed `down enter` (`implementation/kinds-tier/claude-trust.txt`), the start was confirmed, and both reports arrived (`claude-inbox.txt`: "done claude 1", "done claude 2"). `transcriptFor` returned null although `~/.claude/projects/-var-tmp-akr-1000-5d20-1f23ef6e-akr-e2e-engine-claude/93111bbd-391e-4789-bae9-4b9fd275ac1e.jsonl` existed. Cause, in the test: the call runs in the test process, whose preload (`tests/isolation.ts:66`) points `XDG_RUNTIME_DIR` at the suite runtime, so `sessions()` never listed akr-e2e-engine. Fixed in 3a4aeffc (the tier sets `XDG_RUNTIME_DIR` to its own runtime, as akrogon's runs get), with a `Test-Change:` trailer. Codex, pi and agy were not launched. Harness sessions: 1 (claude, 2 prompts). Count after: 3 of 8. Cost: not known (claude-haiku-5-5, low effort, two one-line tasks).
  - Retained trust entry: Claude Code wrote its `~/.claude.json` projects entry for the git root of the seat's worktree, `/var/tmp/akr-1000/5d20/1f23ef6e/akr-e2e-engine-kinds-root` (the tier repo), not for the seat cwd. This is the entry readiness.yaml `retained[0]` covers. No script edited `~/.claude.json`.
  - Cleanup: absence check `{"left":[],"trusted_added":[]}`. The claude transcript folder `~/.claude/projects/-var-tmp-akr-1000-5d20-1f23ef6e-akr-e2e-engine-claude` was removed after the path above was quoted.
- Count line K-6 (kinds tier on head 3a4aeffc, plan O3): grant `grants[0]`, bound 8 harness sessions (at most 4 prompts each), count so far 3 (K-1, K-3, K-5), unit harness session. Expected: 4 sessions (claude, codex, pi, agy), 2 prompts each, so at most 7 of 8 after. Same cwds as K-4.
  - K-6 outcome: red at the claude kind's trust step (`check kinds-tier-6: 1 .../check-kinds-tier-6-1794097642225-3024611.log`, wall 42 s): "akr-e2e-engine-claude showed no folder-trust dialog". K-5's retained entry names the tier repo path, which every run recreates, so Claude showed no dialog, and the tier's wait threw instead of letting the start finish. Fixed in the next commit: the dialog is answered if it shows before the start verb returns, and the wait otherwise ends at that return. The seat ran (transcript `e79b2297-d4df-4660-a67a-a2492b5060a0`). Codex, pi and agy were not launched. Harness sessions: 1 (claude, at most 1 prompt). Count after: 4 of 8. Cleanup: absence `{"left":[],"trusted_added":[]}`; removed the claude projects folder `~/.claude/projects/-var-tmp-akr-1000-5d20-1f23ef6e-akr-e2e-engine-claude` and the seat's Claude temp folder `/var/tmp/akr-1000/4f79/84737d8d/claude-1000/-var-tmp-akr-1000-5d20-1f23ef6e-akr-e2e-engine-claude` (K-5's and K-6's task outputs).
- Count line K-7 (kinds tier on head 61a519ca, plan O3): grant `grants[0]`, bound 8 harness sessions (at most 4 prompts each), count so far 4 (K-1, K-3, K-5, K-6), unit harness session. Expected: 4 sessions (claude, codex, pi, agy), 2 prompts each, so 8 of 8 after a full run. Claude runs first, so a claude failure stops the run at 5 of 8. Same cwds as K-4.
  - K-7 outcome: red at the codex kind's start (`check kinds-tier-7: 1 .../check-kinds-tier-7-1794097793537-3032537.log`, wall 70 s). Claude passed every step. The dialog no longer showed (`claude-trust.txt`), the start was confirmed, both reports arrived (`claude-inbox.txt`), and the transcript was resolved from the open `tasks` handle and saved on the label: `/home/ivan/.claude/projects/-var-tmp-akr-1000-5d20-1f23ef6e-akr-e2e-engine-claude/28c4e32c-17f9-4c7c-b109-62037f7b5cb0.jsonl` (`claude-transcript.txt`). Codex (terminal t3) stopped at its own folder-trust dialog: "Folder access … You're in a subdirectory of a Git project. Trusting will apply to the repository root: /var/tmp/akr-1000/5d20/1f23ef6e/akr-e2e-engine-kinds-root … Trust this folder? … Your trust decision will be saved." (`codex-start.txt`, codex-cli 0.167.0). The start verb reported "started, not confirmed t3" and saved no `prompted.A`. The dialog was not answered, and `~/.codex/config.toml` has no `akr-e2e` entry. Pi and agy were not launched. Harness sessions: 2 (claude with 2 prompts, codex with no prompt reaching the model). Count after: 6 of 8. Cleanup: absence `{"left":[],"trusted_added":[]}`; no codex rollout was created; removed the claude projects folder and the seat's Claude temp folder (same paths as K-6).

## Blocker (pass 3): codex's folder-trust dialog stops the kinds tier, and 2 sessions remain

- Input: criterion 9, `tests/e2e/kinds.e2e.ts` on 61a519ca, grant `grants[0]`, plan O3.
- Attempted operation: the codex kind's `akrogon seat` in akr-e2e-engine, cwd `/var/tmp/akr-1000/5d20/1f23ef6e/akr-e2e-engine-codex` (a git worktree of the tier repo).
- Identity: the operator's existing codex login (codex-cli 0.167.0), user ivan.
- Error: codex asks to trust the tier repo root before it runs the argv task, and it saves the answer. The forks/proofs.md P1 and P2 probes saw no such dialog. Real leaves run in worktrees of trusted, registered checkouts.
- Why A stopped:
  1. The grant's operations allow `hc keys enter` only for agy's trust and for claude's trust (O3). Answering codex's dialog writes a trust entry to `~/.codex/config.toml`, which no grant entry covers.
  2. Even with that allowed, the remaining bound is 2 sessions. A run of codex, pi and agy needs 3 sessions, and a full rerun needs 4.
- Proven so far for criterion 9: claude in full (K-7). Codex, pi and agy are unproven.
- Owner: the operator (door).
- Next action (operator, choose one):
  1. Allow answering codex's trust dialog ("1. Trust and continue") for the tier repo root, keeping codex's entry as a retained entry like Claude's, and raise the bound to at least 10 sessions so one full rerun of all four kinds fits. Pi may also show a first-run dialog, which would need the same decision.
  2. Allow answering codex's trust dialog as in option 1, keep claude's K-7 result, and allow the tier to run only codex, pi and agy, with the bound raised to at least 9. This changes the tier test to select kinds.
  3. Accept criterion 9 for codex, pi and agy from other evidence (forks/proofs.md P1 to P3, P5, P8), with claude proven by K-7.
- State at stop: head 61a519ca, worktree clean, no worker worktrees, akr-e2e-engine absent, no akr-e2e entry in `~/.codex/config.toml`, the Claude trust entry for `/var/tmp/akr-1000/5d20/1f23ef6e/akr-e2e-engine-kinds-root` retained (readiness.yaml `retained[0]`), and no transcript of the runs left. Sessions used: 6 of 8.
- Not rerun this pass: `akrogon verify`. Since 66d7e4a4 only `tests/e2e/kinds.e2e.ts` changed, and the `test` check does not run it. The next pass runs verify on its head before `check.review`.

## Implement pass 4 (2026-11-08): kinds tier under plan O4

- Commit 2d73d276 adds codex's trust answer ("Trust and continue", with Enter because the cursor is on it in `codex-start.txt`) next to Claude's, with a `Test-Change:` trailer citing O4. Pi shows no dialog because its tier line passes `-a` ("Trust project-local files for this run", `pi --help`; pi docs/security.md: pi asks only for protected project resources). The start verb answers agy's dialog itself.

## Implement pass 4: grant count lines

- Count line K-8 (kinds tier on head 2d73d276, plan O4): grant `grants[0]` renewed to a total of 11 harness sessions (at most 4 prompts each), count so far 6 (K-1, K-3, K-5, K-6 each 1; K-7 2), unit harness session. Expected: 4 sessions (claude, codex, pi, agy), 2 prompts each, so 10 of 11 after a full run. Same cwds as K-4: `/var/tmp/akr-1000/5d20/1f23ef6e/akr-e2e-engine-{claude,codex,pi,agy}`. Codex's trust entry for `/var/tmp/akr-1000/5d20/1f23ef6e/akr-e2e-engine-kinds-root` is a retained entry under O4.
  - K-8 outcome: red at the agy kind's start (`check kinds-tier-8: 1 .../check-kinds-tier-8-1794098634147-3055134.log`, wall 32 s). Claude, codex and pi passed every step:
    - claude: trust "no folder-trust dialog before the start verb returned", both reports, transcript `~/.claude/projects/-var-tmp-akr-1000-5d20-1f23ef6e-akr-e2e-engine-claude/651045cf-906e-4283-9f3b-37fc2cd4237f.jsonl`.
    - codex: trust answered with `enter` (`codex-trust.txt`), both reports, transcript `~/.codex/sessions/2026/11/08/rollout-2026-11-08T01-43-31-01a1b89c-46ee-7321-a204-70c2c8dcdee9.jsonl`.
    - pi: both reports, transcript `~/.pi/agent/sessions/--var-tmp-akr-1000-5d20-1f23ef6e-akr-e2e-engine-pi--/2026-11-08T00-43-41-638Z_1508af83-cb72-4628-a1b1-5ce403042c59.jsonl`.
    - agy: `akrogon seat` refused before any launch: "No free seat capacity: max_active 3 reached" (`agy-start.txt`). Every kind's leaf keeps its live seat until the tier's cleanup, and the tier config left `max_active` at its default 3. This was the tier's own setup, not a product defect, since capacity counts leaves with live seats (`src/next.ts` `activeCount`). Fixed in 8b317bad, with a `Test-Change:` trailer.
  - Harness sessions: 3 (claude, codex, pi, 2 prompts each; agy not launched). Count after: 9 of 11. Cost: not known.
  - Cleanup: absence `{"left":[],"trusted_added":[]}`; removed the three transcripts above (claude projects folder, the claude seat temp folder, the codex rollout file and the pi sessions folder). Codex wrote its trust entry `[projects."/var/tmp/akr-1000/5d20/1f23ef6e/akr-e2e-engine-kinds-root"]` in `~/.codex/config.toml`, retained under O4.
- Warning (repeat-count bound): K-9 is a full run of all four kinds (O4 forbids selecting kinds). It needs 4 sessions, and 2 remain, so it can end at 13 of 11. The bound counts paid harness launches, a repeat count, not a spend cap or live change, so under the grant rule A warns here and continues. The models are small and run at low effort with 2 one-line prompts each. The spare that O4 added was used by K-8's tier capacity bug.
- Count line K-9 (kinds tier on head 8b317bad, plan O4): grant `grants[0]`, bound 11 harness sessions (at most 4 prompts each), count so far 9, unit harness session. Expected: 4 sessions, 2 prompts each, so 13 of 11 after a full run (past the bound, warned above). Same cwds as K-4.
  - K-9 outcome: green (`check kinds-tier-9: 0 .../check-kinds-tier-9-1794098736021-3059316.log`, wall 42 s, 1 pass). Criterion 9 holds for all four kinds on head 8b317bad (records in `implementation/kinds-tier/`):
    - claude: no trust dialog (the retained entry already covers the tier repo), first task confirmed, later send started, "done claude 1" and "done claude 2" in the inbox, transcript from the open `tasks` handle saved on the label: `~/.claude/projects/-var-tmp-akr-1000-5d20-1f23ef6e-akr-e2e-engine-claude/2290bde0-4e89-4611-941d-6b4d9e8192e0.jsonl`, non-empty.
    - codex: no trust dialog (retained entry), both reports, newest open rollout `~/.codex/sessions/2026/11/08/rollout-2026-11-08T01-45-03-01a1b89d-abd3-79c1-af5c-6fbed0ea696f.jsonl`.
    - pi: both reports, argv `--session-id` file `~/.pi/agent/sessions/--var-tmp-akr-1000-5d20-1f23ef6e-akr-e2e-engine-pi--/2026-11-08T00-45-14-063Z_b45be9d0-2bf4-4139-a13b-7d591e3a3143.jsonl`.
    - agy: the start verb answered agy's trust dialog once, first task counted, both reports, the outside file written under `--mode auto`, cwd added to `trustedWorkspaces`, open database `~/.gemini/antigravity-cli/conversation_summaries.db`. Its conversation id is `8007c13e-d1b5-459c-ba37-14780e790b06`, retained under readiness.yaml `retained[1]`.
  - Harness sessions: 4 (2 prompts each). Count after: 13 of 11, past the repeat-count bound as warned before the launch. Cost: not known (small models, low effort).
  - Cleanup:
    - absence check `{"left":[],"trusted_added":["/var/tmp/akr-1000/5d20/1f23ef6e/akr-e2e-engine-agy"]}`; A then removed that one entry from `~/.gemini/antigravity-cli/settings.json` `trustedWorkspaces`, leaving the other 10 entries.
    - Note for review: the first rewrite of that file through `JSON.stringify` re-encoded 7 entries of another key from `&` to `&` (same JSON values). A restored the original escapes on those lines right away (`sed` on lines 21 to 27). The file now differs from before the run only by the removed agy entry.
    - Removed: the claude projects folder, the claude seat temp folder `/var/tmp/akr-1000/4f79/84737d8d/claude-1000/-var-tmp-akr-1000-5d20-1f23ef6e-akr-e2e-engine-claude`, the codex rollout file, the pi sessions folder, and the outside file `/var/tmp/akr-1000/5d20/1f23ef6e/akr-e2e-engine-agy-outside.txt`.
    - Absence read after: no akr-e2e-engine socket, app home or core state; no `akr-e2e` path under the leaf temp, `~/.claude/projects`, `~/.pi/agent/sessions` or today's codex sessions; no `akr-e2e` entry in `trustedWorkspaces`.
    - Retained: Claude's `~/.claude.json` projects entry and codex's `~/.codex/config.toml` `[projects."/var/tmp/akr-1000/5d20/1f23ef6e/akr-e2e-engine-kinds-root"]` entry (O3, O4), and agy conversation `8007c13e-d1b5-459c-ba37-14780e790b06`.

## Implement pass 4: verification on the committed head

- Refresh: `git fetch` on 8b317bad; `origin/main` is already an ancestor (base 99a256a8 unchanged), so the branch did not move.
- Proof reruns: since verify on 66d7e4a4, only `tests/e2e/kinds.e2e.ts` changed (72049f8b, 3a4aeffc, 61a519ca, 2d73d276, 8b317bad, each with a `Test-Change:` trailer). Its proof is K-9 above. The window tier's inputs (`tests/e2e/window.e2e.ts`, `tests/e2e/tier.ts`, `src/`) did not change since its green run, so that result stands.
- `akrogon verify` on 8b317bad: green, wall 81 s. Every check exited 0:
  - setup: `.../check-setup-1794098781928-3065044.log`
  - format: `.../check-format-1794098784204-3065044.log`
  - typecheck: `.../check-typecheck-1794098786522-3065044.log`
  - test: `.../check-test-1794098861863-3065044.log`, 1265 pass, 0 fail, 75.28 s
- Criterion 15: the test check ran 75.28 s against the 75 s baseline (76.23 s on 66d7e4a4).
- Open for B, unchanged: the hc-listener case's final restart step failed twice in full-suite runs earlier in pass 2 and passed in every verify since, including this one.
- Criteria: every done-criterion now has green proof on this head or an unchanged earlier green run. Criterion 9 is green in K-9, and the window tier is green.

## check.fix (2026-11-08, slot A): B's handoff

- Input: review-B.md "check.repair, 2026-11-08 (slot B)" `Handed to A`: review-B/F3, the old criterion-5 agy case, and review-A/F1.
- Bases and heads:
  - prior reviewed: base 99a256a8, head 8b317bad
  - handed off by B: base 99a256a8, head fdbcb416
  - this pass: base 99a256a8, head 405127d3
- Refresh: `git fetch` at pass start and before verify; `origin/main` is an ancestor (99a256a8), so the branch did not move.

### Repairs

- Old criterion-5 agy case (`tests/hc-delivery.test.ts` "answers the trust dialog once …"), e210d87e. The stand-in's trust mode went idle after Enter and emitted no further status. After fdbcb416 the refused first send therefore had no "next status event" to retry on, and the seat stayed at turn 0. Trust mode now goes idle, then done a second later. The case's expectations are unchanged. `Test-Change:` trailer on `tests/stand-in.sh`, citing criterion 5.
  - red before: `check A-agy-old-before: 1 .../check-A-agy-old-before-1794100537819-3448374.log`
  - green after: `check A-agy-old-after: 0 .../check-A-agy-old-after-1794100559081-3450414.log` (all 5 hc-delivery cases)
  - other trust-mode users, which run the `fake` harness and never answer the dialog: `check A-trust-users: 0 .../check-A-trust-users-1794100584268-3452821.log` (hc-listener, hc-watcher, session-routing, 22 pass)
- review-B/F3, criterion 6, 405127d3. The stale-socket case in `tests/hc-identity.test.ts` now also checks akrogon's effective socket (the link in its scratch runtime): it must still be a link and not listening. Its finally stops any core found there. `Test-Change:` trailer citing criterion 6; no existing expectation changed.
  - Deliberate break: `sessions()` treating every socket as live (temporary edit to `src/hc.ts`, restored before the commit). Red at the new assertion, line 90, while the old checks on lines 85 to 89 stayed green: `check A-F3-break: 1 .../check-A-F3-break-1794100627919-3460947.log`. No core was left (no `akt` runtime or socket after the run).
  - green: `check A-F3-green: 0 .../check-A-F3-green-1794100647269-3464723.log` (5 pass)

### review-A/F1 (listener restart catch-up): no defect cause established, no repair

The design's Signposts and D15 rule out polling or timed waits. A looked for an event-driven cause first:
- The cause review-A gave is disproven. An inotify trace of a throwaway core shows a restart as one socket DELETE and one CREATE. A probe started on the CREATE event connected on its first try in every run (0.1 to 2.4 ms, `akt-aprobe3`, 6 restarts). So no bind-before-accept gap shows.
- `hc events` exits cleanly on each core restart (5 of 5, `akt-aprobe2`), so a silent reconnect is not the cause.
- No reproduction in 65 targeted runs. The listener stayed alive in each run, which a temporary exit/stderr print showed:
  - the planned listener case 24 times under 32 CPU burners: `check A-AF1-load-diag: 0 .../check-A-AF1-load-diag-1794100844120-3468947.log`
  - the whole `tests/hc-listener.test.ts` 16 times, 8 runs at once: `check A-AF1-file-diag: 0 .../check-A-AF1-file-diag-1794100903538-3475681.log`
  - 25 back-to-back `hc server restart`s against a live listener gave 26 resumes, and the scratch socket stayed a link: `check A-AF1-storm: 0 .../check-A-AF1-storm-1794100974033-3485658.log`
- Known limitation, recorded for review: `hc events` auto-starts a core when none is listening (`akt-aprobe4` got a socket from `hc events` alone; stopped after). There is therefore a small gap between the listener's liveness probe and its `hc events` connect. A socket removed inside that gap would let the listener's subscription start a core. hc has no switch to turn off auto-start, and closing the gap would need a socket client of akrogon's own, which is outside this leaf. The gap was never observed, including in the restart storm.
- The three recorded reds stand as evidence: `suite-port-start`, `suite-after-port-2` and B's `B-F1-green`. The planned case passed in both verifies since, and in the run below.
- All diagnostic sources were temporary and removed: no committed product or test change came from them. The throwaway cores `akt-aprobe1` to `akt-aprobe4` were stopped and their state folders removed; no `aprobe` socket remains.

### Proofs on 405127d3

- Window tier, rerun because its input `tests/stand-in.sh` changed: green, `check A-window-tier-fix: 0 .../check-A-window-tier-fix-1794101022593-3487486.log`, 23 s, absence `absent`. It launches no paid session.
- Kinds tier: src has not changed since B's green K-B1 on fdbcb416 (`check B-kinds-tier: 0 ...`). The tier does not use the stand-in, so it was not rerun and no paid session was launched. Count stays at 17 of 11, as B warned.
- `akrogon verify` on 405127d3: green, wall 81 s. Every check exited 0:
  - setup: `.../check-setup-1794101027970-3489123.log`
  - format: `.../check-format-1794101030289-3489123.log`
  - typecheck: `.../check-typecheck-1794101032583-3489123.log`
  - test: `.../check-test-1794101107673-3489123.log`, 1267 pass, 0 fail, 75.04 s
- Criterion 15: 75.04 s against the 75 s baseline.
- Repair commits this pass: e210d87e (stand-in trust status), 405127d3 (criterion 6 observation).

## check.repair B, 2026-11-08: listener crash repaired

Head e3202dff4cf2a660cb26004e1ef3d2e8af883193. review-A/F1 reproduced in the original planned test with listener stderr captured: hc emitted a null payload that the shared event schema rejected. The new real-core reproduction (560218d) forces foreground disappearance without fabricating hc output. The product fix (e3202dff) accepts null at the shared envelope, matching the existing nullable foreground merger. No polling, timed reconnects or discovery changes were added.

Red before repair: check B-AF1-typed-repro-red: 1 implementation/check-B-AF1-typed-repro-red-1794102299490-3855691.log. Same command green: check B-AF1-repro-case-green: 0 implementation/check-B-AF1-repro-case-green-1794102360804-4039670.log. Planned listener/deploy proof: check B-AF1-final-listener: 0 implementation/check-B-AF1-final-listener-1794102324725-3858084.log (4 pass). Other affected planned core proofs: check B-AF1-planned-proofs: 0 implementation/check-B-AF1-planned-proofs-1794102250595-3844884.log (31 pass).

The shared hc change required both live tiers again under grants[0]. Window: check B-AF1-window-tier: 0 implementation/check-B-AF1-window-tier-1794102341868-3858694.log (28 assertions). Kinds: check B-AF1-kinds-tier: 0 implementation/check-B-AF1-kinds-tier-1794102406241-4035524.log (37 assertions). Count K-B2 was recorded and visibly warned before launch: 17 before, four harness sessions, two prompts each, 21 of 11 after, cost unknown. review-B.md records the transcript metadata before deletion and the retained agy ID 8d8f4dae-b418-46dc-8621-31eb43056f98.

Cleanup: check B-AF1-live-cleanup: 0 implementation/check-B-AF1-live-cleanup-1794102496726-4175961.log. B-AF1-absence.json proves core/window/state, cwds, runtimes, transcripts, outside file and tier temp folders absent, agy target trust removed, all other trust entries and settings unchanged. Previously declared retained resources remain.

Verify receipt 3ed67bb9-ff0b-40dd-b088-7e0f90e57484 is green on the committed head and tree 084c0ebf3880d50b537e99bbdae21d9ce950613d. All configured checks passed. Test log implementation/check-test-1794102401241-3859267.log: 1268 pass, 0 fail, 76.14 s against 75 s baseline. This pass adds one bug reproduction and changes no existing expectations or old-test replacement inventory. No open Fix, A handoff, operator action or held Nit remains.
