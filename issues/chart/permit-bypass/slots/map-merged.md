# Merged map (A, B, C), 2026-10-13

Sources: slots/map-A.md, map-B.md, map-C.md.

## Findings
- M1 Report right on serialization, wrong on containment (A,B,C). The raw run (shell 3693707, test pid 3693709) sat in akrogon.slice/akrogon-l1152f2131fc9 scope, inside CPUQuota 1600% and the memory brake, stoppable by leaf stop (src/scope.ts:53-88, src/stop.ts:53-56). The permit is taken only in withPermit (src/permit.ts:78-125), called by run-check (src/run-check.ts:173-181) and base-run (src/base-run.ts:165).
- M2 Seat used the raw command from the start (B,C; A corrected). First call: foreground `AKROGON_BASE=... bun run test:changed | tail -15` with seat-chosen timeout:300 (pi session jsonl :47, 12:16:45Z); after the timeout it reran the same raw command under nohup to /tmp/ftf-logs (:51). Its own brief-4.md:63 held the wrapped form (C).
- M3 Instruction gap (A,B,C): "resolved changed-tests command" is undefined at skills/implement-issue/SKILL.md:57, brief-template.md:37, worker-protocol.md:11. Only `akrogon config` prints the run-check-wrapped form (src/config.ts:312-329); raw forms stay in issues/config.yaml and package.json. SKILL.md:27 and check-issue:33 allow proofs "outside the printed commands" with setup only, no permit (B,C).
- M4 pi teaches the bypass shape (B,C): ~/.pi/agent/extensions/tamdoma-pi-tweaks/shell-timeout.ts:1-8 (default 120 s, max 600 s) tells seats to "run anything longer in the background and poll its log", against implement-issue:45 wait-on-exit. The seat did fixed sleep polls 120-300 s.
- M5 Instructions alone are weak (C): the same seat broke two plain rules (TMPDIR at implement:25, wait-on-exit at :45).
- M6 Lock reading differs: C says the shipped serialization equals foreclosed 1b and the host-test-load destination ("one load limit enforced below the agent layer") is not met for serialization. A and B say revised 1a promised the permit only in run-check/base-run plus bound-and-stop for everything else, so a strict guarantee is a new decision (B).
- M7 Other live defects: seats wrap run-check in `timeout 240` (pid 399055/399068), which kills queued waits (B,C); logs in /tmp outside leaf TMPDIR (A,B,C); a check_start with no check_end at 12:15Z after a holder died in normal timeout flow (C); host-wide permit makes varhop's cheap check wait behind framework's 12-min runs (C); ~10 waiters invisible to seats, status shows holder only (C).
- M8 Speed: the holder finished 12:34:08Z, exit 0, 825.6 s (13.8 min) against 731-733 s solo (framework issues/timings.jsonl:56,58), but it overlapped the raw run for ~10 min, so the quota cost is not isolated (B,C).
- M9 Ceiling trigger (forks in host-test-load/forks/ceiling-values.md:25): not met, trigger is framework:verify:core (A,C). B: literal wording "a later run over 300 s" is ambiguous; the operator decides, never silently.

## Practitioner and primary sources
- Bazel --local_test_jobs / exclusive tag: the gate lives in the runner every test passes through (A,B,C via limit-boundary Findings; bazel.build/docs/user-manual read 2026-10-13 by B).
- systemd.resource-control: CPUWeight shares, CPUQuota caps CPU time; neither counts runs (B,C; raw man source read 2026-10-13).
- Advisory locks bind only callers that ask; same-UID seats can leave any fence short of UID separation (C).

## Forks (proposed order)
1. Guarantee: what "one run at a time" must mean now (A,B,C). Reshapes all others.
2. Long-run path: how a seat runs a 12+ min queued check under harness timeouts (B,C; A as instruction only).
3. Evidence: does a raw run count as proof (C).
4. Queue visibility and dedup (C; B: do not add a registry silently).
5. Ceiling trigger reading (B; A,C say not met).

## Off route candidates (A,B,C unless tagged)
TasksMax; framework fan-out caps; merge-first priority; raising the pi cap as the fix; re-adding framework-tests.lock (C); a PATH shim on bun (A,C reject); UID separation (C, named cost only).
