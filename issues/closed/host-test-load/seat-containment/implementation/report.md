# Implementation report: seat-containment

Base: 6c43d3f3e8b353015e94f19bf56e4a884b0c3139 (AKROGON_BASE after the final refresh).
Committed head for proof: e5776ad.

Refreshes:
- Implement start: a no-op. The branch was already on origin/main at 99a5ada.
- Before the final proof: the branch moved from base 99a5ada, head 0cc2081 to base 6c43d3f, head e5776ad. Main had added the host-wide run permit. Two conflicts were resolved by keeping both sides. In tests/run-check.test.ts the allowed env list keeps both `AKROGON_RUN` and `DBUS_SESSION_BUS_ADDRESS` (in 8ad2109, which already carries that file's trailer). In src/AREA.md, Key files keeps the permit line and the scope line, and the file stays at 40 lines.

Commit ids in the table below are the pre-refresh ids. After the refresh they map in order to 8ad2109, 5576955, 4d70139, ebe23a7, 63ad6ea, 4eb6178, f0c7f88, 947fdce, 6ce7fae, 3be9dd1, e5776ad.

## Changed files and reasons

| Commit | Files | Reason |
|---|---|---|
| 7d273f6 | tests/* (plan.synthesis) | Red tests and fixtures for C1-C6 (plan "Red evidence"). |
| 0f6dbcd, 9b1cfbf | README.md, docs/guide/install.md, docs/guide/setup.md, docs/guide/next.md, src/AREA.md, tests/AREA.md | Every doc the plan names. src/AREA.md stays at 40 lines by merging two line pairs. 9b1cfbf is the trailer-only commit for tests/AREA.md. |
| b1ab9f4 (U2) | src/run-check.ts, src/config.ts | D5: bus cut in constructedEnv after env/pass_env, and DBUS_SESSION_BUS_ADDRESS reserved. |
| 383444e (U1) | systemd/akrogon.slice, src/install.ts, src/self-update.ts | D6: slice file (T6 content), link through planSkillLinks, `systemctl --user daemon-reload` in install and installStage. installStage uses `spawnCaptured(..., { env: process.env })` so the reload sees the current PATH. |
| 4cb3e9a | tests/install.test.ts | Plan R2: in-process selfUpdate calls in that file get the fake systemctl. A PATH sentinel on the real `systemctl` recorded no call (41 pass, 0 fail). |
| 07171cf (U3) | src/scope.ts (new), src/next.ts | D1-D4: leafSlice, paneScope, procRoot, adoptShell, inOwnScope, the allocate ensure step, the placement bus cut, and the check/adopt. |
| 60235fe | tests/fake-busctl.ts | Worker mismatch M1: the fixture read `au` as 2 + count values, which rejected the design's exact argv. Fixed to 1 + count. |
| 144317d | src/next.ts, src/scope.ts | Worker mismatch M2: a new pane was boxed only before the final save, so a failed swap left an unboxed recorded pane, which the next pass closed. Each pane is now boxed right after it is resolved, before any save records it. tests/next.test.ts "swap failure keeps A recorded" passes unchanged. |
| 5e66da5 | tests/fake-busctl.ts, tests/seat-containment.test.ts | Reproduction of the live-run bug (see Live run, attempt 2). It adds the `busctl.delay` marker, which moves the shell 0.5 s after the call returns, and a case for it. It was red on 0cc2081's parent with the live error: "Pane w1:p2 for leaf build is not in its own scope after adoption: …/app.slice/herdr.scope". It carries Test-Change trailers. |
| 0cc2081 (U5, brief-5) | src/next.ts | Fix: `StartTransientUnit` returns once systemd queues the job, so `box` now polls `inOwnScope` every 50 ms for up to 5 s after adoption. `unreadable` still throws at once. A timeout throws the existing error. Worker commit 78b0d34. |

Worker returns (all three filled the four report fields):
- U2: committed b02f655, picked as b1ab9f4. Its tests passed 55/0.
- U1: committed 949a299, picked as 383444e. Its tests passed 41/0. It noted one accidental real `systemctl --user daemon-reload` during its own debugging (reload only, no unit change).
- U3: committed 0546a51, picked as 07171cf. It returned M1 and M2, both resolved above.
- U5: committed 78b0d34, picked as 0cc2081. seat-containment.test.ts passed 7/0, and changed tests passed 856/0. No mismatch.

All worker worktrees (u1, u2, u3 and the U5 agent worktree) are removed.

## Proof (on e5776ad)

Checks, each the exact printed `checks` command with AKROGON_BASE=6c43d3f:
- format: rc 0 (1 s). It left no diff.
- typecheck: rc 0 (2 s).
- test: rc 0, 878 pass, 0 fail (108 s).
- test_changed: rc 0, 863 pass, 0 fail (107 s).

An earlier run on 144317d with base 99a5ada was also green: test 870/0, test_changed 855/0. It is superseded by the run above.

Done-criteria, fixture parts (all in the green `test` run above):
- C1: tests/install.test.ts "install links akrogon.slice with the ceiling values…", "install reports a non-link akrogon.slice path as a conflict", and tests/self-update.test.ts "self-update links akrogon.slice from the deployed checkout…".
- C2, C6: tests/seat-containment.test.ts "next boxes every pane shell in its own scope under the leaf slice before the seat starts".
- C3: tests/seat-containment.test.ts "new leaf pane shells get the session bus cut", tests/run-check.test.ts "run-check cuts the session bus even when the caller has one", tests/base-run.test.ts "a base-run command runs with the session bus cut", tests/config.test.ts reserved list and "config refuses DBUS_SESSION_BUS_ADDRESS in pass_env".
- C4: tests/seat-containment.test.ts "a failed adoption stops dispatch and reports the slug" and "a misplaced shell stops dispatch and reports the slug".
- C2 race: tests/seat-containment.test.ts "a shell systemd moves after the adoption call returns is still boxed".
- C5: tests/seat-containment.test.ts "an outside pane is closed and recreated boxed before any prompt" and "an unreadable cgroup never closes the pane and skips the leaf this pass".

Live parts (C1, C2, C5, C6): see "Live run" below.

## Live run

Grant: operator 2026-10-13, readiness.yaml grants[0]. Stop line as granted. Budget: 3 attempts, each cleaned before the next.

Attempt 1, on 144317d: a fixture error. `next` refused the `.env` write because the temp repo had no `.gitignore`. No herdr tab or systemd unit was created. The worktree and branch were removed.

Attempt 2, on 144317d, from 13:03:10 to 13:05:34 (about 2.5 min). T=/tmp/akl-t99c.
- C1 pass: `systemctl --user show akrogon.slice` gave CPUWeight=20, CPUQuotaPerSecUSec=16s, MemoryHigh=68719476736, MemoryMax=103079215104 and MemorySwapMax=0.
- C2 fail, 5 of 5 times: `"error":"Pane w1:p2 for leaf live-seat-1 is not in its own scope after adoption: 0::/…/app.slice/akl-live-server.service"`. A later read showed each shell in its scope, for example `…/akrogon.slice/akrogon-lc9626dc0c32b.slice/akrogon-lc9626dc0c32b-pw1p2-577419-206012.scope`. That proves the race. Chromium run with `herdr pane run` in boxed pane w1:p3 put all 12 chromium pids in that pane's scope, and no new `app-*Chrom*` scope appeared.
- C6 pass for the existing scopes: TimeoutStopUSec=5s and SendSIGHUP=yes.
- C5 fail: the restart startup pass hit the same race. Pane B was never boxed.
- Cleanup absence check: no `akrogon-l*` or `akl-*` units, akl-live-server inactive, T gone, and the `akrogon.slice` link gone. The worker also ran `systemctl --user stop akrogon.slice`, which was outside the brief. Only its own leaf slice was under it.
- Result: the reproduction 5e66da5 and the fix 0cc2081 above.

Attempt 3, on e5776ad, from 13:15:17 to 13:17:24 (about 2 min 7 s). T=/tmp/akl-lYVe. Both seats ran pi. All criteria pass.
- C1 pass: the same values as in attempt 2.
- C2 pass: `akrogon next live-seat-1` returned rc 0 and recorded A=w1:p2 and B=w1:p3. The shells are in `…/akrogon.slice/akrogon-lc9626dc0c32b.slice/akrogon-lc9626dc0c32b-pw1p2-1909691-277736.scope` and `…-pw1p3-1909841-277742.scope`. The seat processes (pi 1910002, codex-code-mode, exec_bridge) are in A's scope. Chromium run with `herdr pane run w1:p3 …` put all 12 pids in p3's scope. The `app-*Chrom*` listing was the same before and after (only the operator's `app-com.google.Chrome-6467.scope`).
- C6 pass: all four scopes (p2 to p5) show TimeoutStopUSec=5s and SendSIGHUP=yes.
- C5 pass: after `herdr server stop` and a restart, the startup pass closed restored p2 and p3 (both exited Hangup) and created p4 and p5. State records A=w1:p4 and B=w1:p5. Both shells and the new seat are in their own scopes. Both scopes were active at 13:16:25, before the prompt at 13:16:29.
- Cleanup absence check: no `akrogon-l*` or `akl-*` units, akl-live-server inactive, T gone, the `akrogon.slice` link gone, and the pi session folder removed. I re-checked units, the link and `/tmp/akl-*` myself after the return. The lane stayed clean at e5776ad.

## Known limitations

- Accepted residuals from the design: between a cold restore and the first akrogon pass a resumed seat is unboxed. Hand-split panes are not boxed. Empty leaf slices stay loaded.
- After a restart, herdr resumes pi in a restored pane for about 50 ms before the startup pass closes it. This is the accepted cold-restore residual. No prompt is sent in that window.
- The parent `akrogon.slice` stays loaded after its link is removed, until the user manager next reloads it. The grant forbids stopping it.
- A failed adoption now takes up to 5 s before it throws, because of the poll.
- installStage reports a missing `systemctl` binary (spawn ENOENT) as `links failed: …`, through the existing catch.

## Unverified criteria

None.
