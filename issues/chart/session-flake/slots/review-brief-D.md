# Review brief: session-flake (slot D)

Worktree /home/ivan/.akrogon/worktrees/akrogon/session-flake, branch session-flake, commit 71378d15 on 814a2387. Test-only (tests/hc-fixture.ts, +19).

Goal: remove the root cause of session-reads "a manual next ignores an inherited HC_TERMINAL_ID" and session-routing "the blocked notice lands in the session holding the repo space" (both failed 3-4 of 4 on base today), plus hc-delivery "a working seat gets no send...".

Helper's cause: hc test cores never stop their leaf slices (src/scope.ts:8-12; tests/hc-fixture.ts:384). ~32,000 empty akrogon-l*.slice units piled up in the user manager, making systemd-run --scope take 1.4-3.6 s, over the 3 s shortStartProof (tests/hc-fixture.ts:185); src/seat.ts:333-337 then reads the pid still in hc-hold-*.service ("seat outside its leaf scope"); session-reads read `before` before the idle stand-in wrote its argv task.
Fix: HcCore.stop reads the akrogon.repo/akrogon.leaf labels of the seats it held, and after `hc server stop` runs `systemctl --user stop` on those slices, throwing on failure.
Proof claimed: before 4/4 fail each file; after host cleanup, 8/8 pass each with two copies in parallel at load 25-29; verify green 1375.

Judge: is the cause proven; does the fix stop the leak for every fixture path (failed tests, throws before stop, cores never stopped); can it stop a slice that belongs to another live home or a production leaf; is session-reads' `before` read still racy without the slow manager.

Verdict ready, nits or fix, Fixes only with a reproducing scenario and file:line.
